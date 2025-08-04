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
- **Git tag створено:** ✅ backup-start-20250803, week2-optimizations-complete-20250803
- **Файлові backup:** ✅ 
  - `backups/src_backup_20250803/` (початковий стан)
  - `backups/src_after_error_handling_20250803/` (після Error Handling)
  - `backups/src_after_week2_optimizations_20250803/` (після оптимізацій)
  - `backups/package_backup_20250803.json`

### 🚀 Нові компоненти (Тиждень 2)

#### LazyImage система
```javascript
// Використання базового LazyImage
import LazyImage from '../components/LazyImage';
<LazyImage src="/path/to/image.jpg" alt="Опис" />

// Готові варіанти
import { ProductImage, HeroImage, AvatarImage } from '../components/LazyImage';
<ProductImage src="/images/product.jpg" alt="Продукт" />
<HeroImage src="/images/hero.jpg" alt="Hero зображення" priority={true} />
<AvatarImage src="/images/avatar.jpg" alt="Аватар" />
```

#### useDebounce Hook
```javascript
// Використання для оптимізації пошуку/форм
import { useDebounce } from '../hooks/useDebounce';

const [searchTerm, setSearchTerm] = useState('');
const debouncedSearchTerm = useDebounce(searchTerm, 300); // 300ms затримка

// debouncedSearchTerm буде оновлюватися тільки після паузи 300ms
```

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