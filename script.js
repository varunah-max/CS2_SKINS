Telegram.WebApp.ready();

const initData = Telegram.WebApp.initData;
const initDataParsed = Telegram.WebApp.initDataUnsafe;
const chatId = initDataParsed.user?.id || initDataParsed.chat?.id;

const infoDiv = document.getElementById('info');

if (chatId) {
    fetch('/get_user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: chatId, init_data: initData })
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                infoDiv.innerHTML = `<p class="error">${data.error}</p>`;
            } else {
                infoDiv.innerHTML = `
                    <div class="inf"><strong>Chat ID:</strong> ${data.chat_id}</div>
                    <div class="inf"><strong>Имя пользователя:</strong> ${data.username || 'Не указано'}</div>
                    <div class="inf"><strong>Баланс:</strong> ${data.balance} TON</div>
                    <div class="inf"><strong>Заряженные батареи:</strong> ${data.charged_batteries}</div>
                    <div class="inf"><strong>Просмотры рекламы:</strong> ${data.ad_views}</div>
                    <div class="inf"><strong>TON кошелёк:</strong> ${data.ton_wallet || 'Не указано'}</div>
                    <div class="inf"><strong>Последний вывод:</strong> ${data.last_withdrawal || 'Нет данных'}</div>
                    <div class="inf"><strong>Энергия:</strong> ${data.energy}</div>
                    <div class="inf"><strong>Реферер ID:</strong> ${data.referrer_id || 'Нет'}</div>
                    <div class="inf"><strong>Реферальный коэффициент:</strong> ${data.referral_energy_rate}</div>
                `;
            }
        })
        .catch(error => {
            infoDiv.innerHTML = `<p class="error">Ошибка: ${error.message}</p>`;
        });
} else {
    infoDiv.innerHTML = '<p class="error">Chat ID не найден</p>';
}
