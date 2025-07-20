// Допоміжні функції для тестування
const fs = require('fs');
const path = require('path');

/**
 * 🧪 Допоміжні функції для тестування оптимізації
 */
class TestHelpers {
  
  /**
   * 📊 Отримати метрики файлової системи
   */
  static getFileSystemMetrics(basePath) {
    const metrics = {
      totalFiles: 0,
      totalSize: 0,
      filesByType: {},
      sizeByType: {}
    };
    
    try {
      const files = fs.readdirSync(basePath);
      
      for (const file of files) {
        const filePath = path.join(basePath, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isFile()) {
          const ext = path.extname(file) || 'no-ext';
          
          metrics.totalFiles++;
          metrics.totalSize += stats.size;
          
          if (!metrics.filesByType[ext]) {
            metrics.filesByType[ext] = 0;
            metrics.sizeByType[ext] = 0;
          }
          
          metrics.filesByType[ext]++;
          metrics.sizeByType[ext] += stats.size;
        }
      }
      
      // Конвертуємо розміри в KB
      metrics.totalSizeKB = Math.round(metrics.totalSize / 1024);
      for (const type in metrics.sizeByType) {
        metrics.sizeByType[type] = Math.round(metrics.sizeByType[type] / 1024);
      }
      
    } catch (error) {
      console.error('❌ Помилка аналізу файлової системи:', error.message);
    }
    
    return metrics;
  }
  
  /**
   * 📋 Перевірити наявність файлів
   */
  static checkRequiredFiles(files) {
    const results = {};
    
    for (const file of files) {
      const fullPath = path.isAbsolute(file) ? file : path.join(process.cwd(), file);
      results[file] = {
        exists: fs.existsSync(fullPath),
        size: 0,
        sizeKB: 0
      };
      
      if (results[file].exists) {
        const stats = fs.statSync(fullPath);
        results[file].size = stats.size;
        results[file].sizeKB = Math.round(stats.size / 1024);
      }
    }
    
    return results;
  }
  
  /**
   * 🔍 Перевірити наявність експортів в файлі
   */
  static checkExports(filePath, expectedExports) {
    const results = {};
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      for (const exp of expectedExports) {
        const patterns = [
          `export const ${exp}`,
          `export function ${exp}`,
          `export class ${exp}`,
          `export { ${exp}`,
          `export default ${exp}`,
          `module.exports.${exp}`,
          `exports.${exp}`
        ];
        
        results[exp] = patterns.some(pattern => content.includes(pattern));
      }
      
    } catch (error) {
      console.error(`❌ Помилка перевірки експортів в ${filePath}:`, error.message);
      for (const exp of expectedExports) {
        results[exp] = false;
      }
    }
    
    return results;
  }
  
  /**
   * 📈 Порівняти метрики
   */
  static compareMetrics(before, after, metricName) {
    const comparison = {
      before: before,
      after: after,
      change: after - before,
      changePercent: 0,
      improved: false,
      status: 'unchanged'
    };
    
    if (before > 0) {
      comparison.changePercent = Math.round(((after - before) / before) * 100);
    }
    
    if (comparison.change < 0) {
      comparison.improved = true;
      comparison.status = 'improved';
    } else if (comparison.change > 0) {
      comparison.improved = false;
      comparison.status = 'degraded';
    }
    
    return comparison;
  }
  
  /**
   * 🎯 Створити звіт про тестування
   */
  static createTestReport(stageName, tests) {
    const report = {
      stage: stageName,
      timestamp: new Date().toISOString(),
      summary: {
        total: tests.length,
        passed: 0,
        failed: 0,
        skipped: 0
      },
      tests: tests,
      duration: 0
    };
    
    for (const test of tests) {
      switch (test.status) {
        case 'passed':
          report.summary.passed++;
          break;
        case 'failed':
          report.summary.failed++;
          break;
        case 'skipped':
          report.summary.skipped++;
          break;
      }
      
      report.duration += test.duration || 0;
    }
    
    report.summary.successRate = Math.round((report.summary.passed / report.summary.total) * 100);
    
    return report;
  }
  
  /**
   * 💾 Зберегти результати тестів
   */
  static saveTestResults(stageName, results) {
    try {
      const resultsPath = path.join(process.cwd(), 'docs', 'optimization', 'tests', 'results');
      
      if (!fs.existsSync(resultsPath)) {
        fs.mkdirSync(resultsPath, { recursive: true });
      }
      
      const filename = `${stageName}-test-results.json`;
      const filePath = path.join(resultsPath, filename);
      
      fs.writeFileSync(filePath, JSON.stringify(results, null, 2));
      console.log(`💾 Результати збережено: ${filePath}`);
      
      return filePath;
      
    } catch (error) {
      console.error('❌ Помилка збереження результатів:', error.message);
      return null;
    }
  }
  
  /**
   * 📊 Завантажити baseline метрики
   */
  static loadBaselineMetrics() {
    try {
      const baselinePath = path.join(process.cwd(), 'docs', 'optimization', 'tests', 'baseline', 'baseline-metrics.json');
      
      if (!fs.existsSync(baselinePath)) {
        console.warn('⚠️ Baseline метрики не знайдено');
        return null;
      }
      
      const content = fs.readFileSync(baselinePath, 'utf8');
      return JSON.parse(content);
      
    } catch (error) {
      console.error('❌ Помилка завантаження baseline:', error.message);
      return null;
    }
  }
  
  /**
   * 📋 Завантажити baseline тести
   */
  static loadBaselineTests() {
    try {
      const baselinePath = path.join(process.cwd(), 'docs', 'optimization', 'tests', 'baseline', 'baseline-tests.json');
      
      if (!fs.existsSync(baselinePath)) {
        console.warn('⚠️ Baseline тести не знайдено');
        return null;
      }
      
      const content = fs.readFileSync(baselinePath, 'utf8');
      return JSON.parse(content);
      
    } catch (error) {
      console.error('❌ Помилка завантаження baseline тестів:', error.message);
      return null;
    }
  }
  
  /**
   * 🔄 Запустити тест з таймером
   */
  static async runTimedTest(testName, testFunction) {
    const startTime = performance.now();
    
    try {
      console.log(`🧪 Запуск тесту: ${testName}`);
      
      const result = await testFunction();
      
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      
      console.log(`✅ ${testName} - ПРОЙДЕНО (${duration}ms)`);
      
      return {
        name: testName,
        status: 'passed',
        duration: duration,
        result: result
      };
      
    } catch (error) {
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      
      console.log(`❌ ${testName} - НЕ ПРОЙДЕНО (${duration}ms)`);
      console.log(`   Помилка: ${error.message}`);
      
      return {
        name: testName,
        status: 'failed',
        duration: duration,
        error: error.message
      };
    }
  }
  
  /**
   * 🎨 Форматування звіту
   */
  static formatReport(report) {
    const lines = [];
    
    lines.push(`📊 ЗВІТ ТЕСТУВАННЯ - ${report.stage.toUpperCase()}`);
    lines.push('='.repeat(50));
    lines.push(`📅 Дата: ${new Date(report.timestamp).toLocaleString()}`);
    lines.push(`⏱️ Час виконання: ${report.duration}ms`);
    lines.push('');
    
    lines.push('📈 ПІДСУМКИ:');
    lines.push(`  ✅ Пройдено: ${report.summary.passed}/${report.summary.total}`);
    lines.push(`  ❌ Не пройдено: ${report.summary.failed}/${report.summary.total}`);
    lines.push(`  ⏸️ Пропущено: ${report.summary.skipped}/${report.summary.total}`);
    lines.push(`  📊 Успішність: ${report.summary.successRate}%`);
    lines.push('');
    
    lines.push('📋 ДЕТАЛЬНІ РЕЗУЛЬТАТИ:');
    for (const test of report.tests) {
      const status = test.status === 'passed' ? '✅' : test.status === 'failed' ? '❌' : '⏸️';
      lines.push(`  ${status} ${test.name} (${test.duration}ms)`);
      
      if (test.error) {
        lines.push(`     💥 ${test.error}`);
      }
    }
    
    return lines.join('\n');
  }
  
  /**
   * 🔍 Перевірити стан Git
   */
  static checkGitStatus() {
    try {
      const { execSync } = require('child_process');
      
      // Перевірити чи є Git
      execSync('git --version', { stdio: 'pipe' });
      
      // Отримати статус
      const status = execSync('git status --porcelain', { encoding: 'utf8' });
      const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
      
      return {
        isGit: true,
        branch: branch,
        hasChanges: status.trim().length > 0,
        changes: status.trim().split('\n').filter(line => line.length > 0)
      };
      
    } catch (error) {
      return {
        isGit: false,
        branch: null,
        hasChanges: false,
        changes: []
      };
    }
  }
}

module.exports = TestHelpers;