document.addEventListener('DOMContentLoaded', () => {
  // Инициализация Telegram Web App
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.expand();
  }

  // Переключение вкладок
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTab = tab.getAttribute('data-tab');

      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));

      tab.classList.add('active');
      document.getElementById(targetTab).classList.add('active');
    });
  });

  // Переключение категорий в магазине
  const storeCategories = document.querySelectorAll('.category');
  const storeItems = document.querySelectorAll('.store-items');

  storeCategories.forEach(category => {
    category.addEventListener('click', () => {
      const targetCategory = category.getAttribute('data-category');

      storeCategories.forEach(cat => cat.classList.remove('active'));
      storeItems.forEach(item => item.classList.remove('active'));

      category.classList.add('active');
      document.getElementById(targetCategory).classList.add('active');
    });
  });

  // Переключение категорий в рынке
  const marketCategories = document.querySelectorAll('.market-category');
  const marketItems = document.querySelectorAll('.market-items');

  marketCategories.forEach(category => {
    category.addEventListener('click', () => {
      const targetCategory = category.getAttribute('data-market-category');

      marketCategories.forEach(cat => cat.classList.remove('active'));
      marketItems.forEach(item => item.classList.remove('active'));

      category.classList.add('active');
      document.getElementById(targetCategory).classList.add('active');
    });
  });

  // Обработка кликов по кнопкам
  document.querySelectorAll('.buy-item').forEach(button => {
    button.addEventListener('click', () => {
      const item = button.getAttribute('data-item');
      console.log(`Buy item: ${item}`);
      // Логика покупки
    });
  });

  document.querySelectorAll('.sell-item').forEach(button => {
    button.addEventListener('click', () => {
      const chip = button.getAttribute('data-chip');
      console.log(`Sell chip: ${chip}`);
      // Логика продажи
    });
  });

  document.querySelectorAll('.action-upgrade').forEach(button => {
    button.addEventListener('click', () => {
      console.log('Upgrade Farm clicked');
    });
  });

  document.querySelectorAll('.action-boost').forEach(button => {
    button.addEventListener('click', () => {
      console.log('Boost Mining clicked');
    });
  });

  document.querySelectorAll('.action-ad').forEach(button => {
    button.addEventListener('click', () => {
      console.log('Watch Ad clicked');
    });
  });

  document.querySelectorAll('.action-leaderboard').forEach(button => {
    button.addEventListener('click', () => {
      console.log('View Leaderboard clicked');
    });
  });

  document.querySelectorAll('.action-sound').forEach(button => {
    button.addEventListener('click', () => {
      console.log('Toggle Sound clicked');
    });
  });

  document.querySelectorAll('.action-notifications').forEach(button => {
    button.addEventListener('click', () => {
      console.log('Toggle Notifications clicked');
    });
  });

  document.querySelectorAll('.action-wallet').forEach(button => {
    button.addEventListener('click', () => {
      console.log('Connect Wallet clicked');
    });
  });

  document.querySelectorAll('.action-task').forEach(button => {
    button.addEventListener('click', () => {
      const task = button.getAttribute('data-task');
      console.log(`Claim Task Reward: ${task}`);
    });
  });

  document.querySelectorAll('.action-view-profile').forEach(button => {
    button.addEventListener('click', () => {
      const player = button.getAttribute('data-player');
      console.log(`View profile: ${player}`);
    });
  });
});
