document.addEventListener('DOMContentLoaded', () => {
  // Telegram Web App
  if (window.Telegram && window.Telegram.WebApp) {
    const user = window.Telegram.WebApp.initDataUnsafe.user;
    if (user) {
      console.log('Telegram user:', user);
    } else {
      console.error('Telegram user data not available');
    }
  } else {
    console.error('Telegram Web App not initialized');
  }

  loadTelegramUserData(); // 👈 показываем Telegram-пользователя

  // Tabs
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.tab).classList.add('active');
    });
  });

  // Store Tabs
  const storeTabs = document.querySelectorAll('.store-tab');
  const storeContents = document.querySelectorAll('.store-content');
  storeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      storeTabs.forEach(t => t.classList.remove('active'));
      storeContents.forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.storeTab).classList.add('active');
    });
  });

  // Market Tabs
  const marketTabs = document.querySelectorAll('.market-tab');
  const marketContents = document.querySelectorAll('.market-content');
  marketTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      marketTabs.forEach(t => t.classList.remove('active'));
      marketContents.forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.marketTab).classList.add('active');
    });
  });

  // User Search
  function showError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
      errorDiv.style.display = 'none';
    }, 5000);
  }

  window.fetchUserData = async function () {
    const chatIdInput = document.getElementById('chat-id-input').value.trim();
    if (!chatIdInput || isNaN(chatIdInput)) {
      showError('Пожалуйста, введите числовой Chat ID');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/api/user_by_chat_id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: parseInt(chatIdInput) })
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
  };

  async function updateBalances() {
    try {
      const usersResponse = await fetch('http://127.0.0.1:5000/api/users');
      if (usersResponse.ok) {
        const users = await usersResponse.json();
        console.log('Пользователи:', users);
        const tbody = document.getElementById('user-table-body');
        tbody.innerHTML = '';
        users.forEach(user => {
          const row = document.createElement('tr');
          row.innerHTML = `<td>${user.username}</td><td>${user.balance.toFixed(2)}</td>`;
          tbody.appendChild(row);
        });
      } else {
        console.error('Ошибка /api/users:', usersResponse.status);
      }

      const chatIdInput = document.getElementById('chat-id-input').value.trim();
      if (chatIdInput && !isNaN(chatIdInput)) {
        const userResponse = await fetch('http://127.0.0.1:5000/api/user_by_chat_id', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: parseInt(chatIdInput) })
        });
        if (userResponse.ok) {
          const data = await userResponse.json();
          console.log('Пользователь:', data);
          if (!data.error) {
            document.getElementById('username').textContent = data.username || 'Unknown';
            document.getElementById('balance').textContent = data.balance.toFixed(2);
            document.getElementById('user-info').style.display = 'block';
          }
        } else {
          console.error('Ошибка /api/user_by_chat_id:', userResponse.status);
        }
      }
    } catch (error) {
      console.error('Ошибка обновления данных:', error);
    }
  }

  async function loadTelegramUserData() {
    if (window.Telegram && window.Telegram.WebApp) {
      const user = window.Telegram.WebApp.initDataUnsafe.user;
      if (!user || !user.id) {
        console.error('Telegram user data not available');
        return;
      }

      const chatId = user.id;

      try {
        const response = await fetch('http://127.0.0.1:5000/api/user_by_chat_id', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId })
        });

        const data = await response.json();

        if (data.error) {
          console.error('Ошибка при получении данных Telegram-пользователя:', data.error);
          return;
        }

        document.getElementById('username').textContent = data.username || 'Unknown';
        document.getElementById('balance').textContent = data.balance.toFixed(2);
        document.getElementById('user-info').style.display = 'block';
      } catch (error) {
        console.error('Ошибка при загрузке Telegram-пользователя:', error);
      }
    }
  }

  setInterval(updateBalances, 1000);
  updateBalances();
});
