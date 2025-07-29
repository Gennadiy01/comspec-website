# 🔄 TELEGRAM ROLLBACK ІНСТРУКЦІЇ

## 📦 Бекап створено
**Коміт бекапу:** `9496228`  
**Дата:** 29.07.2025  
**Повідомлення:** "BACKUP: Telegram integration completed - before restructuring"

## ⚡ Швидкий відкат
```bash
cd "D:\Нове підприємство\MG\Сайт\Новий сайт 2025"
git reset --hard 9496228
```

## 📋 Файли для відкату (якщо потрібно вручну)
### Видалити нові папки:
- `src/services/telegram/`
- `src/config/telegram/`
- `src/utils/telegram/`
- `src/tests/telegram/`
- `docs/telegram/`

### Повернути файли в корінь:
- `telegram-test.js`
- `telegram-formatting-test.js`
- `telegram-personal-test.js`
- `telegram-direct-test.js`
- `telegram-utf8-test.js`
- `telegram-simple-format-test.js`
- `telegram-collect-chat-ids.js`
- `telegram-debug.html`
- `debug-telegram-logs.js`
- `test-full-integration.js`
- `test-google-script-response.js`
- `TELEGRAM_INTEGRATION_STATUS.md`

### Відновити оригінальні шляхи в:
- `src/components/modals/OrderModal.js` (імпорт TelegramService)
- Будь-які інші файли з оновленими імпортами

## 🚨 ВАЖЛИВО
Перед відкатом перевірити чи немає інших важливих змін після коміту `9496228`!

## ✅ Після успішного відкату
1. Перевірити функціональність Telegram
2. Протестувати форму замовлення
3. Переконатися що повідомлення доставляються