// src/data/productExclusions.js
// Правила виключень/включень для конкретних товарів

// Оновлена структура відповідно до нових вимог від 14.08.2025
export const PRODUCT_EXCLUSIONS = {
  
  // ===== ТОВАРИ ДОСТУПНІ У ВСІХ 9 ПУНКТАХ НАВАНТАЖЕННЯ =====
  // gravel-granite-5-10 - доступний скрізь (немає правил)
  // gravel-granite-5-20 - доступний скрізь (немає правил) 
  // gravel-granite-10-20 - доступний скрізь (немає правил)
  // gravel-granite-20-40 - доступний скрізь (немає правил)
  // gravel-granite-40-70 - доступний скрізь (немає правил)
  // mixture-0-40 - доступний скрізь (немає правил)
  // mixture-0-70 - доступний скрізь (немає правил)
  // sand-0-5 - доступний скрізь (немає правил)
  
  // ===== ТОВАРИ ТІЛЬКИ НА КОРОСТЕНСЬКОМУ ЩЕБЗАВОДІ =====
  
  // Митий пісок 0,63-2 - тільки на Коростенському щебзаводі
  'sand-washed-0-63-2': {
    includedPoints: ['korosten'],
    reason: 'Спеціальна фракція піску доступна тільки на Коростенському щебзаводі',
    comment: 'Унікальна фракція 0,63-2,00 мм виробляється тільки на одному підприємстві'
  },

  // Митий пісок 2-5 - тільки на Коростенському щебзаводі
  'sand-washed-2-5': {
    includedPoints: ['korosten'],
    reason: 'Спеціальна фракція піску доступна тільки на Коростенському щебзаводі',
    comment: 'Митий пісок 2-5 мм виробляється тільки на одному підприємстві'
  },

  // ===== ТОВАРИ ТІЛЬКИ НА КАР'ЄРАХ (6 ПУНКТІВ) =====
  
  // Бутовий камінь - тільки на кар'єрах (виключити 3 бази)
  'stone-raw': {
    excludedPoints: ['abz-kyiv', 'irpin', 'boryspil'],
    reason: 'Видобуток та обробка каменю тільки на кар\'єрах',
    comment: 'Бутовий камінь не доступний на базах у містах, тільки на місцях видобутку'
  },

  // ===== ТОВАРИ НЕДОСТУПНІ ДЛЯ ЗАМОВЛЕННЯ =====
  
  // Пісок 0-2 - недоступний для замовлення
  'sand-washed-0-2': {
    includedPoints: [],
    reason: 'Товар тимчасово недоступний для замовлення',
    comment: 'Пісок 0-2 не доступний в жодному пункті навантаження'
  },

  // ===== ТОВАРИ КАТЕГОРІЇ ПІСОК - ТІЛЬКИ НА БАЗАХ =====
  
  // Пісок річковий - тільки на роздрібних базах
  'sand-river': {
    includedPoints: ['abz-kyiv', 'irpin', 'boryspil'],
    reason: 'Пісок річковий доступний тільки на роздрібних базах',
    comment: 'Доступний для самовивозу з баз ВБЗ, Ірпінь та Бориспіль'
  },

  // Пісок яружний - тільки на роздрібних базах
  'sand-ravine': {
    includedPoints: ['abz-kyiv', 'irpin', 'boryspil'],
    reason: 'Пісок яружний доступний тільки на роздрібних базах',
    comment: 'Доступний для самовивозу з баз ВБЗ, Ірпінь та Бориспіль'
  }
};

// Функція для отримання списку виключених/включених пунктів для товару
export const getProductRules = (productId) => {
  return PRODUCT_EXCLUSIONS[productId] || null;
};

// Функція для перевірки чи доступний товар в конкретному пункті
export const isProductAvailableAtPoint = (productId, pointId) => {
  const rules = PRODUCT_EXCLUSIONS[productId];
  
  if (!rules) {
    return true; // Якщо немає правил - товар доступний скрізь
  }
  
  // Якщо є список виключених пунктів
  if (rules.excludedPoints) {
    return !rules.excludedPoints.includes(pointId);
  }
  
  // Якщо є список включених пунктів (тільки в них доступний)
  if (rules.includedPoints) {
    return rules.includedPoints.includes(pointId);
  }
  
  return true;
};

// Функція для перевірки чи товар доступний для самовивозу (чи є хоча б один пункт)
export const isProductAvailableForPickup = (productId) => {
  const rules = PRODUCT_EXCLUSIONS[productId];
  
  if (!rules) {
    return true; // Якщо немає правил - товар доступний скрізь
  }
  
  // Якщо є список включених пунктів і він порожній - товар недоступний
  if (rules.includedPoints && rules.includedPoints.length === 0) {
    return false;
  }
  
  // Якщо є список включених пунктів і він не порожній - товар доступний
  if (rules.includedPoints && rules.includedPoints.length > 0) {
    return true;
  }
  
  // Інакше товар доступний
  return true;
};

// Статистика правил для логування
export const exclusionStats = {
  totalRules: Object.keys(PRODUCT_EXCLUSIONS).length,
  rulesWithExclusions: Object.values(PRODUCT_EXCLUSIONS).filter(rule => rule.excludedPoints).length,
  rulesWithInclusions: Object.values(PRODUCT_EXCLUSIONS).filter(rule => rule.includedPoints).length,
  affectedProducts: Object.keys(PRODUCT_EXCLUSIONS)
};