# 🤖 CLAUDE.md - Довідник для Claude Code

## 📋 КОМАНДИ ВІДКОТУ ТА ВІДНОВЛЕННЯ

### 🚨 Екстрені команди відкоту

#### Відкат останнього commit (м'який)
```bash
git reset --soft HEAD~1
```

#### Відкат останнього commit (жорсткий)
```bash
git reset --hard HEAD~1
git push --force
```

#### Безпечний відкат (створює новий commit)
```bash
git revert HEAD
git push
```

#### Відкат до конкретної версії
```bash
git log --oneline -10          # подивитися історію
git reset --hard <commit-hash> # відкотитися до потрібного commit
git push --force
```

#### Екстрений відкат через reflog
```bash
git reflog                     # показує всю історію дій
git reset --hard HEAD@{2}      # повернутися на 2 кроки назад
```

### 📂 Відновлення з файлових backup

#### Відновити src/ з backup
```bash
rm -rf src
cp -r backups/src_backup_20250803 src
git add .
git commit -m "restore: відновлення src з backup файлів"
```

#### Відновити package.json
```bash
cp backups/package_backup_20250803.json package.json
git add package.json
git commit -m "restore: відновлення package.json з backup"
```

### 🏷️ Корисні Git команди

#### Створити backup tag
```bash
git tag "backup-start-$(date +%Y%m%d)"
```

#### Переглянути всі теги
```bash
git tag -l
```

#### Повернутися до тега
```bash
git checkout backup-start-20250803
```

### 📍 Поточний стан backup

- **Git backup створено:** ✅ (commit: backup: початковий стан перед покращеннями)
- **Git tag створено:** ✅ backup-start-20250803
- **Файлові backup:** ✅ 
  - `backups/src_backup_20250803/`
  - `backups/package_backup_20250803.json`

### 🔧 Корисні команди розробки

#### Запуск проекту
```bash
npm start
```

#### Збірка проекту
```bash
npm run build
```

#### Перевірка статусу Git
```bash
git status
git log --oneline -5
```

---

*Файл створено для швидкого доступу до команд відкоту та відновлення при роботі з Claude Code*