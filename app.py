import asyncio
import sqlite3
import logging
import threading
from flask import Flask, request, jsonify
from aiogram import Bot, Dispatcher
from aiogram.types import Message, ReplyKeyboardMarkup, KeyboardButton, WebAppInfo
from aiogram.filters import Command
from aiogram.enums import ChatType

# Конфигурация
TELEGRAM_TOKEN = '6431272924:AAFtOJw3vwP6O6lqViQu0vdXAT5G19YKof4'
WEBAPP_URL = 'https://varunah-max.github.io/CS2_SKINS/'
CHANNEL_NICKNAME = 'Searching_Anomalous_Volumes_bot'
HTTP_PORT = 3000

# Flask-приложение
app = Flask(__name__)

# Telegram-бот
bot = Bot(token=TELEGRAM_TOKEN)
dp = Dispatcher()

# Главное меню
main_menu = ReplyKeyboardMarkup(keyboard=[
    [KeyboardButton(text="Profile"),
     KeyboardButton(text="Open Web App", web_app=WebAppInfo(url=WEBAPP_URL))]
], resize_keyboard=True)

# База данных
class Database:
    def __init__(self, db_file):
        self.connection = sqlite3.connect(db_file, check_same_thread=False)
        self.cursor = self.connection.cursor()
        self.init_db()

    def init_db(self):
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                user_id INTEGER PRIMARY KEY,
                username TEXT,
                chat_id INTEGER,
                balance REAL DEFAULT 0.0,
                referrer_id INTEGER
            )
        ''')
        self.connection.commit()

    def user_exists(self, user_id):
        self.cursor.execute("SELECT 1 FROM users WHERE user_id = ?", (user_id,))
        return self.cursor.fetchone() is not None

    def add_user(self, user_id, username, chat_id, referrer_id=None):
        if not self.user_exists(user_id):
            if referrer_id:
                self.cursor.execute("INSERT INTO users (user_id, username, chat_id, balance, referrer_id) VALUES (?,?,?,?,?)",
                    (user_id, username, chat_id, 0.0, referrer_id))
            else:
                self.cursor.execute("INSERT INTO users (user_id, username, chat_id, balance) VALUES (?,?,?,?)",
                    (user_id, username, chat_id, 0.0))
            self.connection.commit()

    def count_referrals(self, user_id):
        self.cursor.execute("SELECT COUNT(*) FROM users WHERE referrer_id = ?", (user_id,))
        return self.cursor.fetchone()[0]

    def get_balance(self, user_id):
        self.cursor.execute("SELECT balance FROM users WHERE user_id = ?", (user_id,))
        result = self.cursor.fetchone()
        return result[0] if result else 0.0

    def get_profile(self, user_id):
        self.cursor.execute("SELECT username, balance, referrer_id FROM users WHERE user_id = ?", (user_id,))
        result = self.cursor.fetchone()
        if result:
            username, balance, referrer_id = result
            return {
                'user_id': user_id,
                'username': username,
                'balance': balance,
                'referrals': self.count_referrals(user_id),
                'referrer_id': referrer_id or 'None',
                'channel_nickname': CHANNEL_NICKNAME
            }
        return None

    def increment_all_balances(self, amount=0.01):
        self.cursor.execute("UPDATE users SET balance = balance + ?", (amount,))
        self.connection.commit()

    def get_all_user_ids(self):
        self.cursor.execute("SELECT user_id FROM users")
        return [row[0] for row in self.cursor.fetchall()]

    def close(self):
        self.connection.close()


# Фоновая задача для начисления
async def accrue_loop():
    db = Database("users.db")
    try:
        while True:
            db.increment_all_balances(0.01)
            await asyncio.sleep(1)
    finally:
        db.close()

def start_background_loop():
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.create_task(accrue_loop())
    loop.run_forever()

# Flask маршруты API
@app.route('/get_balance', methods=['POST'])
def get_balance():
    data = request.json
    user_id = data.get('user_id')
    if user_id:
        db = Database("users.db")
        balance = db.get_balance(user_id)
        db.close()
        return jsonify({"balance": balance})
    return jsonify({"error": "user_id required"}), 400

@app.route('/get_profile', methods=['POST'])
def get_profile():
    data = request.json
    user_id = data.get('user_id')
    if user_id:
        db = Database("users.db")
        profile = db.get_profile(user_id)
        db.close()
        if profile:
            return jsonify(profile)
        return jsonify({"error": "user not found"}), 404
    return jsonify({"error": "user_id required"}), 400


# Команды Telegram
@dp.message(Command("start"))
async def handle_start(message: Message):
    if message.chat.type != ChatType.PRIVATE:
        return

    user_id = message.from_user.id
    username = message.from_user.username or "Unknown"
    chat_id = message.chat.id

    db = Database("users.db")
    if not db.user_exists(user_id):
        parts = message.text.split()
        referrer_id = int(parts[1]) if len(parts) > 1 and parts[1].isdigit() else None
        if referrer_id and referrer_id != user_id:
            db.add_user(user_id, username, chat_id, referrer_id)
            try:
                await bot.send_message(referrer_id, "You have +1 referral!")
            except:
                pass
        else:
            db.add_user(user_id, username, chat_id)
    db.close()
    await message.answer("Welcome! Your balance increases automatically.\nUse the WebApp or type /balance", reply_markup=main_menu)

@dp.message(Command("balance"))
async def handle_balance(message: Message):
    db = Database("users.db")
    balance = db.get_balance(message.from_user.id)
    db.close()
    await message.answer(f"Your balance: {balance:.2f} H")

@dp.message(Command("profile"))
async def handle_profile(message: Message):
    user_id = message.from_user.id
    db = Database("users.db")
    profile = db.get_profile(user_id)
    db.close()
    if profile:
        await message.answer(
            f"ID: {profile['user_id']}\n"
            f"Referrals: {profile['referrals']}\n"
            f"Balance: {profile['balance']:.2f} H\n"
            f"Referral link: https://t.me/{CHANNEL_NICKNAME}?start={user_id}"
        )


# Запуск всего приложения
if __name__ == '__main__':
    # Запуск фоновой задачи начисления
    threading.Thread(target=start_background_loop, daemon=True).start()

    # Запуск Telegram-бота в отдельном потоке
    threading.Thread(target=lambda: asyncio.run(dp.start_polling(bot)), daemon=True).start()

    # Запуск Flask API
    print(f"Web API started at http://localhost:{HTTP_PORT}")
    app.run(host="0.0.0.0", port=HTTP_PORT)
