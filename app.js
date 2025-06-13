document.addEventListener('DOMContentLoaded', () => {
  loadTelegramUserData();

  window.fetchUserData = async function () {
    const chatIdInput = document.getElementById('chat-id-input').value.trim();
    if (!chatIdInput || isNaN(chatIdInput)) {
      showError('Введите числовой Chat ID');
      return;
    }
    getUserByChatId(parseInt(chatIdInput));
  };

  async function loadTelegramUserData() {
    if (window.Telegram && window.Telegram.WebApp) {
      const user = window.Telegram.WebApp.initDataUnsafe.user;
      if (user && user.id) {
        getUserByChatId(user.id);
      } else {
        console.error('Нет данных Telegram пользователя');
      }
    }
  }

  async function getUserByChatId(chatId) {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/user_by_chat_id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId })
      });

      const data = await response.json();

      if (data.error) {
        showError(data.error);
        document.getElementById('user-info').style.display = 'none';
      } else {
        document.getElementById('username').textContent = data.username || 'Unknown';
        document.getElementById('balance').textContent = data.balance.toFixed(2);
        document.getElementById('user-info').style.display = 'block';
      }
    } catch (err) {
      showError('Ошибка подключения к серверу');
    }
  }

  function showError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    setTimeout(() => {
      errorDiv.textContent = '';
    }, 5000);
  }
});
