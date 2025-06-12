import asyncio
import sqlite3
import threading
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["https://varunah-max.github.io", "http://localhost:*", "*"]}})

DATABASE = 'users.db'

def get_db_connection():
    conn = sqlite3.connect(DATABASE, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/api/users', methods=['GET'])
def get_users():
    conn = get_db_connection()
    users = conn.execute('SELECT username, balance FROM users').fetchall()
    conn.close()
    return jsonify([{"username": u["username"], "balance": u["balance"]} for u in users])

@app.route('/api/user_by_chat_id', methods=['POST'])
def get_user_by_chat_id():
    data = request.json
    chat_id = data.get('chat_id')
    if chat_id is None:
        return jsonify({"error": "chat_id required"}), 400
    try:
        chat_id = int(chat_id)
    except ValueError:
        return jsonify({"error": "chat_id must be a valid integer"}), 400
    conn = get_db_connection()
    user = conn.execute('SELECT username, balance FROM users WHERE chat_id = ?', (chat_id,)).fetchone()
    conn.close()
    if user:
        return jsonify({"username": user["username"], "balance": user["balance"]})
    return jsonify({"error": "user not found"}), 404

async def accrue_loop():
    conn = get_db_connection()
    try:
        while True:
            conn.execute('UPDATE users SET balance = balance + 0.01')
            conn.commit()
            await asyncio.sleep(1)
    except Exception as e:
        print(f"Error in accrue_loop: {e}")
    finally:
        conn.close()

def start_background_loop():
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.create_task(accrue_loop())
    loop.run_forever()

if __name__ == '__main__':
    threading.Thread(target=start_background_loop, daemon=True).start()
    print("Web API started at http://127.0.0.1:5000")
    app.run(host="0.0.0.0", port=5000, debug=True)
