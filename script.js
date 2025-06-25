Telegram.WebApp.ready();

const initData = Telegram.WebApp.initData;
const initDataParsed = Telegram.WebApp.initDataUnsafe;
const chatId = initDataParsed.user?.id || initDataParsed.chat?.id;

const userInfoDiv = document.getElementById('user-info');

// Замените на URL сервера (Render или ngrok)
const SERVER_URL = 'https://ВАШ_RENDER_URL';

if (chatId) {
    fetch(`${SERVER_URL}/get_user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, init_data: initData })
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                userInfoDiv.innerHTML = `<p class="error">${data.error}</p>`;
            } else {
                userInfoDiv.innerHTML = `
                    <div class="info-item"><strong>Chat ID:</strong> ${data.chat_id}</div>
                    <div class="info-item"><strong>Имя пользователя:</strong> ${data.username || 'Не указано'}</div>
                    <div class="info-item"><strong>Баланс:</strong> ${data.balance} TON</div>
                    <div class="info-item"><strong>Заряженные батареи:</strong> ${data.charged_batteries}</div>
                    <div class="info-item"><strong>Просмотры рекламы:</strong> ${data.ad_views}</div>
                    <div class="info-item"><strong>TON кошелёк:</strong> ${data.ton_wallet || 'Не указано'}</div>
                    <div class="info-item"><strong>Последний вывод:</strong> ${data.last_withdrawal || 'Нет данных'}</div>
                    <div class="info-item"><strong>Энергия:</strong> ${data.energy}</div>
                    <div class="info-item"><strong>Реферер ID:</strong> ${data.referrer_id || 'Нет'}</div>
                    <div class="info-item"><strong>Реферальный коэффициент:</strong> ${data.referral_energy_rate}</div>
                `;
            }
        })
        .catch(error => {
            userInfoDiv.innerHTML = `<p class="error">Ошибка: ${error.message}</p>`;
        });
} else {
    userInfoDiv.innerHTML = '<p class="error">Chat ID не найден</p>';
}
