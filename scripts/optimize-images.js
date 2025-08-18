const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Кольорові логи для красивого виводу
const colors = {
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`)
};

// Конфігурація
const config = {
  // Шляхи
  inputDir: 'public/images/products/desktop',
  mobileDir: 'public/images/products/mobile',
  placeholderDir: 'public/images/products/placeholders',
  
  // Розміри зображень
  mobile: {
    width: 300,
    height: 200,
    quality: 80
  },
  placeholder: {
    width: 20,
    height: 13,
    quality: 30,
    blur: 2
  }
};

// Функція для отримання розміру файлу в KB
const getFileSizeKB = (filePath) => {
  const stats = fs.statSync(filePath);
  return Math.round(stats.size / 1024);
};

// Функція для створення mobile версії
const createMobileVersion = async (inputPath, outputPath) => {
  try {
    await sharp(inputPath)
      .resize(config.mobile.width, config.mobile.height, {
        fit: 'cover', // Обрізає зображення зберігаючи пропорції
        position: 'center'
      })
      .jpeg({ 
        quality: config.mobile.quality,
        mozjpeg: true // Використовуємо MozJPEG для кращого стиснення
      })
      .toFile(outputPath);
    
    const inputSize = getFileSizeKB(inputPath);
    const outputSize = getFileSizeKB(outputPath);
    const compression = Math.round((1 - outputSize/inputSize) * 100);
    
    log.success(`Mobile: ${path.basename(outputPath)} (${outputSize}KB, -${compression}%)`);
  } catch (error) {
    log.error(`Помилка створення mobile версії для ${inputPath}: ${error.message}`);
  }
};

// Функція для створення placeholder версії
const createPlaceholderVersion = async (inputPath, outputPath) => {
  try {
    await sharp(inputPath)
      .resize(config.placeholder.width, config.placeholder.height, {
        fit: 'cover',
        position: 'center'
      })
      .blur(config.placeholder.blur)
      .jpeg({ 
        quality: config.placeholder.quality,
        mozjpeg: true
      })
      .toFile(outputPath);
    
    const outputSize = getFileSizeKB(outputPath);
    log.success(`Placeholder: ${path.basename(outputPath)} (${outputSize}KB)`);
  } catch (error) {
    log.error(`Помилка створення placeholder версії для ${inputPath}: ${error.message}`);
  }
};

// Головна функція обробки
const processImages = async () => {
  log.info('🚀 Початок оптимізації зображень товарів...\n');
  
  // Перевіряємо чи існує вхідна папка
  if (!fs.existsSync(config.inputDir)) {
    log.error(`Папка ${config.inputDir} не існує!`);
    return;
  }
  
  // Читаємо список файлів
  const files = fs.readdirSync(config.inputDir)
    .filter(file => /\.(jpg|jpeg|png)$/i.test(file));
  
  if (files.length === 0) {
    log.warn('Не знайдено зображень для обробки!');
    return;
  }
  
  log.info(`Знайдено ${files.length} зображень для обробки:`);
  files.forEach(file => console.log(`  • ${file}`));
  console.log('');
  
  let processedCount = 0;
  let totalInputSize = 0;
  let totalOutputSize = 0;
  
  // Обробляємо кожне зображення
  for (const file of files) {
    const inputPath = path.join(config.inputDir, file);
    const fileName = path.parse(file).name;
    const fileExt = '.jpg'; // Завжди зберігаємо як JPG
    
    // Шляхи для вихідних файлів
    const mobileFileName = `${fileName}-mobile${fileExt}`;
    const placeholderFileName = `${fileName}-placeholder${fileExt}`;
    
    const mobilePath = path.join(config.mobileDir, mobileFileName);
    const placeholderPath = path.join(config.placeholderDir, placeholderFileName);
    
    // Розмір оригінального файлу
    const inputSize = getFileSizeKB(inputPath);
    totalInputSize += inputSize;
    
    log.info(`\n📸 Обробляємо: ${file} (${inputSize}KB)`);
    
    // Створюємо mobile версію
    await createMobileVersion(inputPath, mobilePath);
    
    // Створюємо placeholder версію
    await createPlaceholderVersion(inputPath, placeholderPath);
    
    // Підраховуємо загальний розмір вихідних файлів
    if (fs.existsSync(mobilePath)) {
      totalOutputSize += getFileSizeKB(mobilePath);
    }
    if (fs.existsSync(placeholderPath)) {
      totalOutputSize += getFileSizeKB(placeholderPath);
    }
    
    processedCount++;
  }
  
  // Підсумкова статистика
  const totalCompression = Math.round((1 - totalOutputSize/totalInputSize) * 100);
  
  log.success(`\n🎉 Обробка завершена!`);
  log.info(`📊 Статистика:`);
  log.info(`   • Оброблено зображень: ${processedCount}`);
  log.info(`   • Створено mobile версій: ${processedCount}`);
  log.info(`   • Створено placeholder версій: ${processedCount}`);
  log.info(`   • Розмір оригіналів: ${totalInputSize}KB`);
  log.info(`   • Розмір оптимізованих: ${totalOutputSize}KB`);
  log.info(`   • Стиснення: ${totalCompression}% (економія ${totalInputSize - totalOutputSize}KB)`);
  
  log.success('\n✨ Всі зображення успішно оптимізовано!');
};

// Запускаємо обробку
if (require.main === module) {
  processImages().catch(error => {
    log.error(`Критична помилка: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { processImages, config };