document.addEventListener('DOMContentLoaded', () => {
    if (window.Telegram && window.Telegram.WebApp) {
        const user = window.Telegram.WebApp.initDataUnsafe.user;
        if (user) {
            // Обновление баланса каждую секунду
            let mockBalance = 0.00;

            setInterval(async () => {
                try {
                    // ======= [БЛОК: ПОЛУЧЕНИЕ БАЛАНСА ПО CHAT_ID] =======
                    const balanceResponse = await fetch('/get_balance_by_chat_id', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ chat_id: user.id }) // Предполагается, что user.id — это chat_id
                    });

                    if (!balanceResponse.ok) {
                        throw new Error(`HTTP error: ${balanceResponse.status}`);
                    }

                    const balanceResult = await balanceResponse.json();

                    if (balanceResult.balance !== undefined) {
                        const hashCount = document.getElementById('hash-count');
                        if (hashCount) {
                            hashCount.textContent = balanceResult.balance.toFixed(2);
                            console.log(`Updated balance: ${balanceResult.balance.toFixed(2)} H`);
                        }
                    } else {
                        console.warn('Invalid balance response:', balanceResult);
                    }
                } catch (error) {
                    console.log('Balance fetch failed:', error.message);
                    mockBalance += 0.01;
                    const hashCount = document.getElementById('hash-count');
                    if (hashCount) {
                        hashCount.textContent = mockBalance.toFixed(2);
                        console.log(`Using mock balance: ${mockBalance.toFixed(2)} H`);
                        }
                }

                try {
                    // ======= [БЛОК: ПОЛУЧЕНИЕ ПРОФИЛЯ] =======
                    const profileResponse = await fetch('/get_profile', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ user_id: user.id })
                    });

                    if (!profileResponse.ok) {
                        throw new Error(`HTTP error: ${profileResponse.status}`);
                    }

                    const profileResult = await profileResponse.json();

                    if (profileResult.user_id) {
                        const userId = document.getElementById('user-id');
                        const referrals = document.getElementById('referrals');
                        const referralLink = document.getElementById('referral-link');

                        if (userId) userId.textContent = profileResult.user_id;
                        if (referrals) referrals.textContent = profileResult.referrals;

                        if (referralLink) {
                            const link = `https://t.me/${profileResult.channel_nickname}?start=${profileResult.user_id}`;
                            referralLink.textContent = link;
                            referralLink.href = link;
                            console.log(`Updated referral link: ${link}`);
                        }
                    } else {
                        console.warn('Invalid profile response:', profileResult);
                    }
                } catch (error) {
                    console.log('Profile fetch failed:', error.message);
                }

            }, 1000);
        } else {
            console.error('Telegram user data not available');
            const hashCount = document.getElementById('hash-count');
            if (hashCount) hashCount.textContent = '0.00';
        }
    } else {
        console.error('Telegram Web App not initialized');
        const hashCount = document.getElementById('hash-count');
        if (hashCount) hashCount.textContent = '0.00';
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
        button.addEventListener('click', async () => {
            const item = button.getAttribute('data-item');
            try {
                const response = await fetch('/action', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'buy', data: item })
                });
                const result = await response.json();
                console.log(result.message);
            } catch (error) {
                console.log(`Buy item: ${item}`);
            }
        });
    });

    document.querySelectorAll('.sell-item').forEach(button => {
        button.addEventListener('click', async () => {
            const chip = button.getAttribute('data-chip');
            try {
                const response = await fetch('/action', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'sell', data: chip })
                });
                const result = await response.json();
                console.log(result.message);
            } catch (error) {
                console.log(`Sell chip: ${chip}`);
            }
        });
    });

    document.querySelectorAll('.action-upgrade').forEach(button => {
        button.addEventListener('click', async () => {
            try {
                const response = await fetch('/action', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'upgrade', data: null })
                });
                const result = await response.json();
                console.log(result.message);
            } catch (error) {
                console.log('Upgrade Farm clicked');
            }
        });
    });

    document.querySelectorAll('.action-boost').forEach(button => {
        button.addEventListener('click', async () => {
            try {
                const response = await fetch('/action', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'boost', data: null })
                });
                const result = await response.json();
                console.log(result.message);
            } catch (error) {
                console.log('Boost Mining clicked');
            }
        });
    });

    document.querySelectorAll('.action-ad').forEach(button => {
        button.addEventListener('click', async () => {
            try {
                const response = await fetch('/action', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'ad', data: null })
                });
                const result = await response.json();
                console.log(result.message);
            } catch (error) {
                console.log('Watch Ad clicked');
            }
        });
    });

    document.querySelectorAll('.action-leaderboard').forEach(button => {
        button.addEventListener('click', async () => {
            try {
                const response = await fetch('/action', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'leaderboard', data: null })
                });
                const result = await response.json();
                console.log(result.message);
            } catch (error) {
                console.log('View Leaderboard clicked');
            }
        });
    });

    document.querySelectorAll('.action-sound').forEach(button => {
        button.addEventListener('click', async () => {
            try {
                const response = await fetch('/action', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'sound', data: null })
                });
                const result = await response.json();
                console.log(result.message);
            } catch (error) {
                console.log('Toggle Sound clicked');
            }
        });
    });

    document.querySelectorAll('.action-notifications').forEach(button => {
        button.addEventListener('click', async () => {
            try {
                const response = await fetch('/action', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'notifications', data: null })
                });
                const result = await response.json();
                console.log(result.message);
            } catch (error) {
                console.log('Toggle Notifications clicked');
            }
        });
    });

    document.querySelectorAll('.action-wallet').forEach(button => {
        button.addEventListener('click', async () => {
            try {
                const response = await fetch('/action', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'wallet', data: null })
                });
                const result = await response.json();
                console.log(result.message);
            } catch (error) {
                console.log('Connect Wallet clicked');
            }
        });
    });

    document.querySelectorAll('.action-task').forEach(button => {
        button.addEventListener('click', async () => {
            const task = button.getAttribute('data-task');
            try {
                const response = await fetch('/action', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'task', data: task })
                });
                const result = await response.json();
                console.log(result.message);
            } catch (error) {
                console.log(`Claim Task Reward: ${task}`);
            }
        });
    });

    document.querySelectorAll('.action-view-profile').forEach(button => {
        button.addEventListener('click', async () => {
            const player = button.getAttribute('data-player');
            try {
                const response = await fetch('/action', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'view_profile', data: player })
                });
                const result = await response.json();
                console.log(result.message);
            } catch (error) {
                console.log(`View profile: ${player}`);
            }
        });
    });

    document.querySelectorAll('.action-exchange').forEach(button => {
        button.addEventListener('click', async () => {
            const action = button.getAttribute('data-action');
            try {
                const response = await fetch('/action', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: action, data: null })
                });
                const result = await response.json();
                console.log(result.message);
            } catch (error) {
                console.log(`${action} clicked`);
            }
        });
    });

    document.querySelectorAll('.action-deposit, .action-withdraw').forEach(button => {
        button.addEventListener('click', async () => {
            const action = button.classList.contains('action-deposit') ? 'deposit' : 'withdraw';
            const amountInput = button.previousElementSibling;
            const amount = amountInput ? amountInput.value : null;
            try {
                const response = await fetch('/action', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: action, data: amount })
                });
                const result = await response.json();
                console.log(result.message);
            } catch (error) {
                console.log(`${action} ${amount} clicked`);
            }
        });
    });
});
