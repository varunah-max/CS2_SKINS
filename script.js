const API_URL = 'http://127.0.0.1:5000/api';

let user = {
    chat_id: null,
    username: 'Гость',
    balance: 0,
    energy: 0,
    charged_batteries: 0,
    ad_views: 0,
    miningRate: 0.001,
    referral_count: 0,
    referral_balance: 0,
    referral_link: '',
    referral_energy_rate: 0.0,
    referrals: [],
    microchips: [{ chip_id: 0, name: 'Базовая микросхема', rate: 0.001, cost: 10.0, rarity: 'Common' }],
    boosters: [],
    cosmetics: [],
    last_withdrawal: null
};

let boostMultiplier = 1;
let boostTimeout = null;
let currentChatId = null;

function showMessage(elementId, message, isError = false) {
    const messageEl = document.getElementById(elementId);
    messageEl.textContent = message;
    messageEl.classList.toggle('error-message', isError);
    messageEl.classList.toggle('success-message', !isError);
    messageEl.style.display = 'block';
    setTimeout(() => { messageEl.style.display = 'none'; }, 3000);
}

function updateFarmDisplay() {
    document.getElementById('farm-username').textContent = user.username;
    document.getElementById('username-display').textContent = user.username;
    document.getElementById('lightning').textContent = user.balance.toFixed(2);
    document.getElementById('balance').textContent = user.balance.toFixed(2);
    document.getElementById('charged-batteries').textContent = user.charged_batteries;
    document.getElementById('farm-referral-count').textContent = user.referral_count;
    document.getElementById('referrals-referral-count').textContent = user.referral_count;
    document.getElementById('referral-balance').textContent = user.referral_balance.toFixed(2);
    document.getElementById('energy').textContent = user.energy.toFixed(2);
    document.getElementById('energy-progress').style.width = `${(user.energy / 50) * 100}%`;
    document.getElementById('ad-views').textContent = user.ad_views;
    document.getElementById('mining-rate').textContent = (user.miningRate * boostMultiplier).toFixed(3);
    document.getElementById('bonus-batteries').textContent = user.charged_batteries;
    document.getElementById('withdrawal-batteries').textContent = user.charged_batteries;
    document.getElementById('referral-link').textContent = user.referral_link;
    document.getElementById('referral-link').href = user.referral_link;
    document.getElementById('referral-energy-rate').textContent = user.referral_energy_rate.toFixed(4);
    const equipmentList = document.getElementById('equipment-list');
    equipmentList.innerHTML = user.microchips.map(chip => `
        <div class="item ${chip.rarity.replace(' ', '')}">
            <span>${chip.name} (${chip.rate.toFixed(4)} 🪫/s, ${chip.rarity})</span>
            <div>
                <button class="upgrade-button" onclick="upgradeMicrochip(${chip.chip_id})">Улучшить (+${(chip.cost * 0.5).toFixed(2)} ⚡)</button>
                <button class="sell-button" onclick="sellMicrochip(${chip.chip_id})">Продать (+${(chip.cost * 0.5).toFixed(2)} ⚡)</button>
            </div>
        </div>
    `).join('');
    const referralsList = document.getElementById('referrals-list');
    referralsList.innerHTML = user.referrals.length ? user.referrals.map(ref => `
        <tr>
            <td>${ref.chat_id}</td>
            <td>${ref.username}</td>
            <td>${ref.balance.toFixed(2)} ⚡</td>
        </tr>
    `).join('') : '<tr><td colspan="3">Нет рефералов</td></tr>';
}


async function fetchUserData(chat_id) {
    try {
        const response = await fetch(`${API_URL}/user_by_chat_id`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id })
        });
        const data = await response.json();
        if (data.error) {
            throw new Error(data.error);
        }
        user = { ...user, ...data, boosters: user.boosters, cosmetics: user.cosmetics };
        updateFarmDisplay();
    } catch (error) {
        showMessage('farm-message', `Ошибка: ${error.message}`, true);
    }
}

async function login() {
    const chat_id = document.getElementById('chat-id').value;
    const username = document.getElementById('username').value;
    if (!chat_id || !username) {
        showMessage('login-message', 'Chat ID и имя пользователя обязательны', true);
        return;
    }
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: parseInt(chat_id), username })
        });
        const data = await response.json();
        if (data.error) {
            throw new Error(data.error);
        }
        currentChatId = data.chat_id;
        user = { ...user, ...data, boosters: user.boosters, cosmetics: user.cosmetics };
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('game-container').style.display = 'block';
        updateFarmDisplay();
        setInterval(() => fetchUserData(currentChatId), 1000);
    } catch (error) {
        showMessage('login-message', `Ошибка: ${error.message}`, true);
    }
}

async function logout() {
    try {
        const response = await fetch(`${API_URL}/logout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: currentChatId })
        });
        const data = await response.json();
        if (data.error) {
            throw new Error(data.error);
        }
        currentChatId = null;
        user = {
            chat_id: null,
            username: 'Гость',
            balance: 0,
            energy: 0,
            charged_batteries: 0,
            ad_views: 0,
            miningRate: 0.001,
            referral_count: 0,
            referral_balance: 0,
            referral_link: '',
            referral_energy_rate: 0.0,
            referrals: [],
            microchips: [{ chip_id: 0, name: 'Базовая микросхема', rate: 0.001, cost: 10.0, rarity: 'Common' }],
            boosters: [],
            cosmetics: [],
            last_withdrawal: null
        };
        document.getElementById('game-container').style.display = 'none';
        document.getElementById('login-container').style.display = 'block';
        document.getElementById('chat-id').value = '';
        document.getElementById('username').value = '';
        showMessage('login-message', 'Выход выполнен', false);
        updateFarmDisplay();
    } catch (error) {
        showMessage('farm-message', `Ошибка: ${error.message}`, true);
    }
}

async function register() {
    const chat_id = document.getElementById('reg-chat-id').value;
    const username = document.getElementById('reg-username').value;
    const referrer_id = document.getElementById('reg-referrer-id').value || null;
    if (!chat_id || !username) {
        showMessage('register-message', 'Chat ID и имя пользователя обязательны', true);
        return;
    }
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: parseInt(chat_id), username, referrer_id: referrer_id ? parseInt(referrer_id) : null })
        });
        const data = await response.json();
        if (data.error) {
            throw new Error(data.error);
        }
        showMessage('register-message', 'Успешная регистрация!', false);
        document.getElementById('reg-chat-id').value = '';
        document.getElementById('reg-username').value = '';
        document.getElementById('reg-referrer-id').value = '';
        showLogin();
    } catch (error) {
        showMessage('register-message', `Ошибка: ${error.message}`, true);
    }
}

function showRegister() {
    document.getElementById('login').classList.remove('active');
    document.getElementById('register').classList.add('active');
    document.getElementById('login-content').classList.remove('active');
    document.getElementById('register-content').classList.add('active');
}

function showLogin() {
    document.getElementById('register').classList.remove('active');
    document.getElementById('login').classList.add('active');
    document.getElementById('register-content').classList.remove('active');
    document.getElementById('login-content').classList.add('active');
}

async function updateBalance(balance_change, is_ad_view = false) {
    try {
        const response = await fetch(`${API_URL}/update_balance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: currentChatId, balance_change, is_ad_view })
        });
        const data = await response.json();
        if (data.error) {
            throw new Error(data.error);
        }
        user.balance = data.new_balance;
        if (is_ad_view) {
            user.ad_views += 1;
        }
        updateFarmDisplay();
        return true;
    } catch (error) {
        showMessage('farm-message', `Ошибка: ${error.message}`, true);
        return false;
    }
}

async function buyMicrochip(rarity) {
    const rarityConfig = {
        'Uncommon': { cost: 25, name: 'Микросхема Uncommon' },
        'Rare': { cost: 50, name: 'Микросхема Rare' },
        'Super Rare': { cost: 100, name: 'Микросхема Super Rare' },
        'Epic': { cost: 250, name: 'Микросхема Epic' },
        'Mythic': { cost: 500, name: 'Микросхема Mythic' },
        'Legendary': { cost: 1000, name: 'Микросхема Legendary' }
    };
    if (!rarityConfig[rarity]) {
        showMessage('farm-message', 'Недопустимая редкость', true);
        return;
    }
    try {
        const response = await fetch(`${API_URL}/add_microchip`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: currentChatId,
                name: `${rarityConfig[rarity].name} #${user.microchips.length + 1}`,
                rarity: rarity,
                balance_change: -rarityConfig[rarity].cost
            })
        });
        const data = await response.json();
        if (data.error) {
            throw new Error(data.error);
        }
        user.balance = data.new_balance;
        user.microchips = data.microchips;
        user.miningRate = data.miningRate;
        showMessage('farm-message', `Микросхема ${rarity} успешно куплена!`, false);
        updateFarmDisplay();
    } catch (error) {
        showMessage('farm-message', `Ошибка: ${error.message}`, true);
    }
}

async function upgradeMicrochip(chip_id) {
    try {
        const response = await fetch(`${API_URL}/upgrade_microchip`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: currentChatId, chip_id })
        });
        const data = await response.json();
        if (data.error) {
            throw new Error(data.error);
        }
        user.balance = data.new_balance;
        user.microchips = data.microchips;
        user.miningRate = data.miningRate;
        showMessage('farm-message', `Микросхема улучшена! Новый rate: ${data.new_rate.toFixed(4)} 🪫/s`, false);
        updateFarmDisplay();
    } catch (error) {
        showMessage('farm-message', `Ошибка: ${error.message}`, true);
    }
}

async function sellMicrochip(chip_id) {
    try {
        const response = await fetch(`${API_URL}/sell_microchip`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: currentChatId, chip_id })
        });
        const data = await response.json();
        if (data.error) {
            throw new Error(data.error);
        }
        user.balance = data.new_balance;
        user.microchips = data.microchips;
        user.miningRate = data.miningRate;
        showMessage('farm-message', `Микросхема продана за ${(data.new_balance - user.balance).toFixed(2)} ⚡!`, false);
        updateFarmDisplay();
    } catch (error) {
        showMessage('farm-message', `Ошибка: ${error.message}`, true);
    }
}

async function exchangeLightning() {
    const battery_amount = parseInt(prompt('Сколько 🪫 Батареек получить? (Курс: 100 ⚡ = 1 🪫)', '1'));
    if (isNaN(battery_amount) || battery_amount <= 0) {
        showMessage('farm-message', 'Введите положительное целое число', true);
        return;
    }
    try {
        const response = await fetch(`${API_URL}/exchange`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: currentChatId, lightning_amount: battery_amount })
        });
        const data = await response.json();
        if (data.error) {
            throw new Error(data.error);
        }
        user.balance = data.new_balance;
        user.charged_batteries = data.new_batteries;
        showMessage('farm-message', `Обменено ${battery_amount * 100} ⚡ на ${data.battery_gain} 🪫 Батареек!`, false);
        updateFarmDisplay();
    } catch (error) {
        showMessage('farm-message', `Ошибка: ${error.message}`, true);
    }
}

async function applyBoost() {
    if (await updateBalance(-25)) {
        boostMultiplier = 2;
        user.boosters.push({ name: 'Ускоритель', duration: 3600 });
        showMessage('farm-message', 'Буст применен на 1 час!', false);
        updateFarmDisplay();
        if (boostTimeout) clearTimeout(boostTimeout);
        boostTimeout = setTimeout(() => {
            boostMultiplier = 1;
            showMessage('farm-message', 'Буст закончился!', true);
            updateFarmDisplay();
        }, 3600 * 1000);
    }
}


async function watchAd() {
    if (await updateBalance(5, true)) {
        showMessage('farm-message', 'Получено 5 ⚡ за просмотр рекламы!', false);
        updateFarmDisplay();
    }
}

async function completeTask(taskId) {
    const rewards = { 'watch-ad': 5, 'subscribe': 10 };
    if (rewards[taskId] && await updateBalance(rewards[taskId], taskId === 'watch-ad')) {
        showMessage('tasks-message', `Получено ${rewards[taskId]} ⚡ за выполнение задания!`, false);
        updateFarmDisplay();
    }
}

async function buyItem(itemId) {
    const items = {
        booster: {
            cost: 25,
            action: () => {
                boostMultiplier = 2;
                user.boosters.push({ name: 'Ускоритель', duration: 3600 });
                if (boostTimeout) clearTimeout(boostTimeout);
                boostTimeout = setTimeout(() => {
                    boostMultiplier = 1;
                    showMessage('store-message', 'Буст закончился!', true);
                    updateFarmDisplay();
                }, 3600 * 1000);
            }
        },
        cosmetic: {
            cost: 20,
            action: () => {
                user.cosmetics.push({ name: `Неоновая обложка #${user.cosmetics.length + 1}` });
            }
        }
    };
    if (items[itemId] && await updateBalance(-items[itemId].cost)) {
        try {
            items[itemId].action();
            showMessage('store-message', `Успешно куплен ${itemId === 'booster' ? 'Ускоритель' : 'Неоновая обложка'}!`, false);
            updateFarmDisplay();
        } catch (error) {
            showMessage('store-message', `Ошибка: ${error.message}`, true);
        }
    }
}

async function requestBonus() {
    try {
        const response = await fetch(`${API_URL}/request_bonus`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: currentChatId })
        });
        const data = await response.json();
        if (data.error) {
            throw new Error(data.error);
        }
        user.charged_batteries -= 1;
        showMessage('bonus-message', 'Запрос на бонус отправлен! Комиссия 5%. Вы будете уведомлены.', false);
        updateFarmDisplay();
    } catch (error) {
        showMessage('bonus-message', `Ошибка: ${error.message}`, true);
    }
}

async function requestWithdrawal() {
    const amount = parseInt(document.getElementById('withdrawal-amount').value);
    const wallet = document.getElementById('withdrawal-wallet').value;
    if (!amount || !wallet) {
        showMessage('withdrawal-message', 'Введите количество батареек и адрес кошелька', true);
        return;
    }
    if (amount < 5) {
        showMessage('withdrawal-message', 'Минимальная сумма вывода — 5 🪫 Батареек', true);
        return;
    }
    try {
        const response = await fetch(`${API_URL}/request_withdrawal`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: currentChatId, amount, wallet })
        });
        const data = await response.json();
        if (data.error) {
            throw new Error(data.error);
        }
        user.charged_batteries = data.new_batteries;
        user.ton_wallet = wallet;
        user.last_withdrawal = new Date().toISOString();
        showMessage('withdrawal-message', data.message, false);
        updateFarmDisplay();
    } catch (error) {
        showMessage('withdrawal-message', `Ошибка: ${error.message}`, true);
    }
}

document.querySelectorAll('.tab-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.tab-link').forEach(l => l.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        link.classList.add('active');
        document.getElementById(link.getAttribute('href').substring(1)).classList.add('active');
    });
});