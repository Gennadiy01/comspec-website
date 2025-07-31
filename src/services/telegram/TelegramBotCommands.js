/**
 * 🤖 ОБРОБНИКИ КОМАНД TELEGRAM БОТА COMSPEC
 * Реалізація команд /start, /info, /stats
 */

/**
 * Обробка команди /start
 */
function handleStartCommand(update) {
  const chatId = update.message.chat.id;
  const firstName = update.message.from.first_name || 'Менеджер';
  
  const message = `👋 Привіт, ${firstName}!

🤖 Це бот для сповіщень про замовлення COMSPEC.

📋 Доступні команди:
/info - Ваша інформація та Chat ID
/stats - Статистика замовлень

💼 Адміністратор: @d_gennadiy
📞 Підтримка: 073 9 27 27 00

✅ Якщо ви менеджер - ви автоматично отримуватимете персональні сповіщення про нові замовлення.`;

  return {
    method: 'sendMessage',
    chat_id: chatId,
    text: message,
    parse_mode: 'HTML'
  };
}

/**
 * Обробка команди /info
 */
function handleInfoCommand(update, managerData = null) {
  const chatId = update.message.chat.id;
  const firstName = update.message.from.first_name || 'Користувач';
  const username = update.message.from.username ? `@${update.message.from.username}` : 'Не вказано';
  
  let message = `👤 ІНФОРМАЦІЯ ПРО КОРИСТУВАЧА

📱 Ім'я: ${firstName}
🆔 Chat ID: <code>${chatId}</code>
📧 Username: ${username}
🕒 Час запиту: ${new Date().toLocaleString('uk-UA')}

`;

  // Додаємо інформацію про менеджера якщо знайдено в Google Sheets
  if (managerData && managerData.found) {
    message += `💼 СТАТУС МЕНЕДЖЕРА: ✅ Підтверджено

👨‍💼 Ім'я в системі: ${managerData.name}
📧 Email: ${managerData.email || 'Не вказано'}
🔄 Активний: ${managerData.active ? '✅ Так' : '❌ Ні'}
📊 Замовлень сьогодні: ${managerData.ordersToday || 0}
📅 Останнє замовлення: ${managerData.lastOrder || 'Немає'}

`;
  } else {
    message += `⚠️ СТАТУС: Не знайдено в системі менеджерів

💡 Якщо ви менеджер COMSPEC:
1. Переконайтеся що додані в Google Sheets таблицю
2. Зверніться до адміністратора @d_gennadiy
3. Надайте ваш Chat ID: <code>${chatId}</code>

`;
  }

  message += `💼 Адміністратор: @d_gennadiy
📞 Підтримка: 073 9 27 27 00

💡 Цей Chat ID потрібен для налаштування персональних сповіщень.`;

  return {
    method: 'sendMessage',
    chat_id: chatId,
    text: message,
    parse_mode: 'HTML'
  };
}

/**
 * Обробка команди /stats
 */
function handleStatsCommand(update, statsData = null) {
  const chatId = update.message.chat.id;
  const firstName = update.message.from.first_name || 'Користувач';
  
  let message = `📊 СТАТИСТИКА ЗАМОВЛЕНЬ

👤 Менеджер: ${firstName}
🕒 Дата запиту: ${new Date().toLocaleString('uk-UA')}

`;

  if (statsData && statsData.found) {
    message += `📈 ВАШІ ПОКАЗНИКИ:

📅 Сьогодні: ${statsData.today || 0} замовлень
📅 Цього тижня: ${statsData.thisWeek || 0} замовлень  
📅 Цього місяця: ${statsData.thisMonth || 0} замовлень
📅 Всього: ${statsData.total || 0} замовлень

📊 ДЕТАЛІ:
🔄 Активність: ${statsData.active ? '✅ Активний' : '❌ Неактивний'}
📅 Останнє замовлення: ${statsData.lastOrder || 'Немає'}
⭐ Середньо на день: ${statsData.avgPerDay || '0.0'} замовлень

`;

    // Додаємо мотиваційне повідомлення
    if (statsData.today > 0) {
      message += `🎉 Відмінна робота сьогодні! Продовжуйте в тому ж дусі!`;
    } else {
      message += `💪 Нові можливості чекають! Удачі в роботі!`;
    }
  } else {
    message += `⚠️ СТАТИСТИКА НЕДОСТУПНА

❌ Ви не знайдені в системі менеджерів

💡 Для отримання статистики:
1. Переконайтеся що додані в систему
2. Зверніться до адміністратора @d_gennadiy
3. Надайте ваш Chat ID з команди /info

`;
  }

  message += `

💼 Адміністратор: @d_gennadiy
📞 Підтримка: 073 9 27 27 00`;

  return {
    method: 'sendMessage',
    chat_id: chatId,
    text: message,
    parse_mode: 'HTML'
  };
}

/**
 * Головний роутер команд
 */
function processCommand(update) {
  const message = update.message;
  const text = message.text;
  
  // Логування для відладки
  console.log(`[TelegramBot] Команда отримана: ${text} від ${message.from.first_name} (${message.chat.id})`);
  
  if (text.startsWith('/start')) {
    return handleStartCommand(update);
  }
  
  if (text.startsWith('/info')) {
    // Для /info потрібно отримати дані менеджера з Google Sheets
    return {
      command: 'info',
      needsManagerData: true,
      update: update
    };
  }
  
  if (text.startsWith('/stats')) {
    // Для /stats потрібно отримати статистику з Google Sheets
    return {
      command: 'stats', 
      needsStatsData: true,
      update: update
    };
  }
  
  // Невідома команда
  return {
    method: 'sendMessage',
    chat_id: message.chat.id,
    text: `❓ Невідома команда: ${text}

📋 Доступні команди:
/start - Початок роботи
/info - Ваша інформація  
/stats - Статистика замовлень

💼 Адміністратор: @d_gennadiy`,
    parse_mode: 'HTML'
  };
}

// Експорт для використання в Google Apps Script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    processCommand,
    handleStartCommand,
    handleInfoCommand,
    handleStatsCommand
  };
}

// Для використання в Google Apps Script (глобальні функції)
if (typeof global !== 'undefined') {
  global.processCommand = processCommand;
  global.handleStartCommand = handleStartCommand;
  global.handleInfoCommand = handleInfoCommand;
  global.handleStatsCommand = handleStatsCommand;
}