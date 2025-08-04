# 🔧 Гід по відкоту Error Handling змін

## 🚨 Швидкий відкат (якщо щось пішло не так)

### Опція 1: Відкат через Git (рекомендовано)
```bash
# Подивитися останні коміти
git log --oneline -5

# Відкотити до стану до Error Handling
git reset --hard backup-start-20250803
git push --force

# Або використати revert (безпечніше)
git revert HEAD
git push
```

### Опція 2: Відкат через файлові backup
```bash
# Відновити з backup
rm -rf src/utils/simpleErrorHandler.js
rm -rf src/components/SimpleErrorBoundary.js

# Відкотити App.js до оригінального стану
cp backups/src_backup_20250803/App.js src/App.js

# Закомітити зміни
git add .
git commit -m "rollback: відкат Error Handling змін"
git push
```

## 📁 Що було додано (для видалення при відкоті)

### Нові файли:
- `src/utils/simpleErrorHandler.js` - обробник помилок
- `src/components/SimpleErrorBoundary.js` - React Error Boundary

### Змінені файли:
- `src/App.js` - додано ErrorBoundary обгортки

## 🔍 Як перевірити що відкат працює

```bash
# Запустити сервер
npm start

# Перевірити що сайт працює
# Перейти на http://localhost:3000

# Збудувати production версію
npm run build
```

## ⚡ Екстрені команди (копіювати в термінал)

**Повний відкат до початкового стану:**
```bash
git reset --hard backup-start-20250803 && git push --force
```

**М'який відкат (створює новий commit):**
```bash
git revert HEAD && git push
```

**Відновлення з файлових backup:**
```bash
cp -r backups/src_backup_20250803/* src/ && git add . && git commit -m "emergency rollback" && git push
```

---

*Створено: 05.08.2025*  
*Мета: Швидкий відкат Error Handling покращень у разі проблем*