document.addEventListener('DOMContentLoaded', () => {
  let telegramUserId = null;

  if (window.Telegram && window.Telegram.WebApp) {
    const webApp = window.Telegram.WebApp;
    webApp.ready();
    const user = webApp.initDataUnsafe.user;
    if (user) {
      console.log('Telegram user:', user);
      telegramUserId = user.id;
      fetchUserData(telegramUserId);
    } else {
      console.error('Telegram user data not available');
      showError('Не удалось получить данные пользователя Telegram');
    }
  } else {
    console.error('Telegram Web App not initialized');
    showError('Telegram Web App не инициализирован. Запустите приложение через Telegram.');
  }

  function showError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
      errorDiv.style.display = 'none';
    }, 5000);
  }

  async function fetchUserData(chatId) {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/user_by_chat_id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: parseInt(chatId) })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Ошибка сервера:', response.status, errorText);
        throw new Error(`HTTP error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Ответ сервера:', data);
      if (data.error) {
        showError(data.error);
        document.getElementById('user-info').style.display = 'none';
        return;
      }

      document.getElementById('username').textContent = data.username || 'Unknown';
      document.getElementById('balance').textContent = data.balance.toFixed(2);
      document.getElementById('user-info').style.display = 'block';
    } catch (error) {
      console.error('Ошибка получения данных:', error);
      showError(`Не удалось получить данные: ${error.message}`);
      document.getElementById('user-info').style.display = 'none';
    }
  }

  async function updateBalance() {
    if (telegramUserId) {
      fetchUserData(telegramUserId);
    }
  }

  setInterval(updateBalance, 1000);
  updateBalance();
});
