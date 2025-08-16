// src/data/loadingPoints.js

// Імпортуємо правила виключень на рівні модуля
import { PRODUCT_EXCLUSIONS } from './productExclusions.js';

export const loadingPoints = [
  // Щебінь - 9 пунктів
  {
    id: 'korosten',
    name: 'ТДВ "Коростенський щебзавод"',
    address: '11502, Житомирська обл, м. Коростень, вул. Каштанова, 3',
    region: 'Житомирська область',
    coordinates: { lat: 50.9594, lng: 28.6586 },
    hasGravel: true,
    hasSand: false,
    hasAsphalt: false,
    hasConcrete: false,
    active: true
  },
  {
    id: 'rokytne',
    name: 'ТОВ "РКДЗ"',
    address: '09600, Київська обл, смт. Рокитне, вул. Білоцерківська, 1',
    region: 'Київська область',
    coordinates: { lat: 49.9667, lng: 29.9167 },
    hasGravel: true,
    hasSand: false,
    hasAsphalt: false,
    hasConcrete: true, // Також бетон
    active: true
  },
  {
    id: 'boguslav',
    name: 'ТОВ "ВО Богуславський граніт"',
    address: '09700, Київська обл, м. Богуслав, вул. Корсунська, 179',
    region: 'Київська область',
    coordinates: { lat: 49.2167, lng: 30.8167 },
    hasGravel: true,
    hasSand: false,
    hasAsphalt: false,
    hasConcrete: false,
    active: true
  },
  {
    id: 'yaroshivka',
    name: 'ТОВ «Алас Фастів»/ЯРОШІВСЬКИЙ КАР\'ЄР',
    address: '08510, Київська обл, Фастівський р-н, с. Ярошівка, вул. Щорса, 30',
    region: 'Київська область',
    coordinates: { lat: 49.9167, lng: 29.9000 },
    hasGravel: true,
    hasSand: false,
    hasAsphalt: false,
    hasConcrete: false,
    active: true,
    note: 'Використовує прайс Богуслав'
  },
  {
    id: 'berezivka',
    name: 'ТДВ "Березівський кар\'єр"',
    address: 'М06, Березівка, Житомирська область, 12412',
    region: 'Житомирська область',
    coordinates: { lat: 50.3167, lng: 28.4500 },
    hasGravel: true,
    hasSand: false,
    hasAsphalt: false,
    hasConcrete: false,
    active: true
  },
  {
    id: 'ignatpil',
    name: 'ТДВ «Ігнатпільський кар\'єр»',
    address: '11163, Житомирська обл., Овруцький р-н с. Рудня, вул. Робітнича, 10',
    region: 'Житомирська область',
    coordinates: { lat: 51.1167, lng: 28.8000 },
    hasGravel: true,
    hasSand: false,
    hasAsphalt: false,
    hasConcrete: false,
    active: true,
    note: 'Використовує прайс Богуслав'
  },
  {
    id: 'abz-kyiv',
    name: 'База "АБЗ"',
    address: 'м. Київ, вул. Покільська, 4',
    region: 'Київська область',
    coordinates: { lat: 50.4501, lng: 30.5234 },
    hasGravel: true,
    hasSand: true,
    hasAsphalt: true,
    hasConcrete: false,
    active: true
  },
  {
    id: 'irpin',
    name: 'База "Ірпінь"',
    address: 'Київська область, м. Ірпінь, вул. Садова, 94',
    region: 'Київська область',
    coordinates: { lat: 50.5167, lng: 30.2500 },
    hasGravel: true,
    hasSand: true,
    hasAsphalt: false,
    hasConcrete: false,
    active: true
  },
  {
    id: 'boryspil',
    name: 'База "Бориспіль"',
    address: 'Київська область, м. Бориспіль, вул. Завокзальна, 15',
    region: 'Київська область',
    coordinates: { lat: 50.3500, lng: 30.9500 },
    hasGravel: true,
    hasSand: true,
    hasAsphalt: false,
    hasConcrete: false,
    active: true
  }
];

// Функція для пошуку найближчого пункту навантаження
export const findNearestLoadingPoint = (coordinates, productType = null) => {
  if (!coordinates) return null;

  let availablePoints = loadingPoints.filter(point => point.active);
  
  // Фільтруємо за типом продукту
  if (productType) {
    availablePoints = availablePoints.filter(point => {
      switch (productType) {
        case 'Щебінь': return point.hasGravel;    // ✅ Українські
        case 'Пісок': return point.hasSand;
        case 'Асфальт': return point.hasAsphalt;
        case 'Бетон': return point.hasConcrete;
        // Зворотна сумісність:
        case 'gravel': return point.hasGravel;
        case 'sand': return point.hasSand;
        case 'asphalt': return point.hasAsphalt;
        case 'concrete': return point.hasConcrete;
        default: return true;
      }
    });
  }

  if (availablePoints.length === 0) return null;

  // Знаходимо найближчий пункт (спрощена формула відстані)
  let nearestPoint = availablePoints[0];
  let minDistance = calculateDistance(coordinates, nearestPoint.coordinates);

  for (let i = 1; i < availablePoints.length; i++) {
    const distance = calculateDistance(coordinates, availablePoints[i].coordinates);
    if (distance < minDistance) {
      minDistance = distance;
      nearestPoint = availablePoints[i];
    }
  }

  return {
    ...nearestPoint,
    distance: minDistance
  };
};

// Функція розрахунку відстані між координатами (формула Гаверсина)
const calculateDistance = (coords1, coords2) => {
  const R = 6371; // Радіус Землі в км
  const dLat = (coords2.lat - coords1.lat) * Math.PI / 180;
  const dLon = (coords2.lng - coords1.lng) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(coords1.lat * Math.PI / 180) * Math.cos(coords2.lat * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Функція для отримання пунктів за продуктом
export const getLoadingPointsByProduct = (productType) => {
  return loadingPoints.filter(point => {
    if (!point.active) return false;
    
    switch (productType) {
      case 'Щебінь': return point.hasGravel;     // ✅ Українські назви
      case 'Пісок': return point.hasSand;
      case 'Асфальт': return point.hasAsphalt;
      case 'Бетон': return point.hasConcrete;
      // Зворотна сумісність (на випадок старих викликів):
      case 'gravel': return point.hasGravel;
      case 'sand': return point.hasSand;
      case 'asphalt': return point.hasAsphalt;
      case 'concrete': return point.hasConcrete;
      default: return false;
    }
  });
};

// Функція для отримання пунктів навантаження з урахуванням правил для конкретних товарів
export const getLoadingPointsBySpecificProduct = (productId, productTitle) => {
  // Визначаємо категорію товару
  // ВАЖЛИВО: Всі товари з gravel.js відносяться до категорії "Щебінь"
  let category = 'Щебінь';
  
  // TODO: В майбутньому, коли будуть окремі файли для інших категорій:
  // - sand.js → category = 'Пісок'
  // - asphalt.js → category = 'Асфальт'  
  // - concrete.js → category = 'Бетон'
  
  // Поки що всі товари (включаючи пісок, суміші, камінь) з gravel.js = "Щебінь"
  
  // Отримуємо пункти за категорією
  let availablePoints = getLoadingPointsByProduct(category);
  
  // Застосовуємо правила виключень/включень для конкретного товару
  if (productId && PRODUCT_EXCLUSIONS[productId]) {
    const rules = PRODUCT_EXCLUSIONS[productId];
    
    if (rules.excludedPoints) {
      // Виключаємо певні пункти
      availablePoints = availablePoints.filter(point => 
        !rules.excludedPoints.includes(point.id)
      );
    }
    
    if (rules.includedPoints) {
      // Залишаємо тільки включені пункти
      availablePoints = availablePoints.filter(point => 
        rules.includedPoints.includes(point.id)
      );
    }
  }
  return availablePoints;
};

// Статистика пунктів навантаження
export const loadingPointsStats = {
  total: loadingPoints.length,
  active: loadingPoints.filter(p => p.active).length,
  byProduct: {
    'Щебінь': loadingPoints.filter(p => p.hasGravel && p.active).length,    // ✅ Українські ключі
    'Пісок': loadingPoints.filter(p => p.hasSand && p.active).length,
    'Асфальт': loadingPoints.filter(p => p.hasAsphalt && p.active).length,
    'Бетон': loadingPoints.filter(p => p.hasConcrete && p.active).length,
    // Зворотна сумісність:
    gravel: loadingPoints.filter(p => p.hasGravel && p.active).length,
    sand: loadingPoints.filter(p => p.hasSand && p.active).length,
    asphalt: loadingPoints.filter(p => p.hasAsphalt && p.active).length,
    concrete: loadingPoints.filter(p => p.hasConcrete && p.active).length
  },
  byRegion: {
    'Київська область': loadingPoints.filter(p => p.region === 'Київська область' && p.active).length,
    'Житомирська область': loadingPoints.filter(p => p.region === 'Житомирська область' && p.active).length
  }
};