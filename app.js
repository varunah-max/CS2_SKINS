document.addEventListener('DOMContentLoaded', () => {
  if (window.Telegram && window.Telegram.WebApp) {
    const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
    if (tgUser && tgUser.id) {
      const chatId = tgUser.id;
      fetchUserById(chatId);
    } else {
      showError("Не удалось получить данные Telegram пользователя.");
    }
  } else {
    showError("Приложение не запущено внутри Telegram.");
  }

  async function fetchUserById(chatId) {
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
        return;
      }

      document.getElementById('username').textContent = data.username || 'Unknown';
      document.getElementById('balance').textContent = data.balance.toFixed(2);
      document.getElementById('user-info').style.display = 'block';
    } catch (error) {
      showError('Ошибка при получении данных: ' + error.message);
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
