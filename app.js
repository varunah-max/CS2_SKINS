document.addEventListener('DOMContentLoaded', () => {
  let chatId = null;

  // Telegram Web App
  if (window.Telegram && window.Telegram.WebApp) {
    const user = window.Telegram.WebApp.initDataUnsafe.user;
    if (user && user.id) {
      chatId = user.id;
      console.log('Telegram user chat_id:', chatId);
    } else {
      console.error('Telegram user data not available');
      showError('Не удалось получить данные Telegram пользователя');
    }
  } else {
    console.error('Telegram Web App not initialized');
    showError('Telegram Web App не инициализирован');
  }

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

  // Error handling
  function showError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
      errorDiv.style.display = 'none';
    }, 5000);
  }

  // Fetch current user data
  async function fetchUserData() {
    if (!chatId) return;

    try {
      const response = await fetch('http://127.0.0.1:5000/api/user_by_chat_id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId })
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

  // Update balances and table
  async function updateBalances() {
    try {
      // Update table of all users
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

      // Update current user
      if (chatId) {
        await fetchUserData();
      }
    } catch (error) {
      console.error('Ошибка обновления данных:', error);
    }
  }

  // Initial fetch and periodic update
  if (chatId) {
    fetchUserData();
  }
  setInterval(updateBalances, 1000);
});
