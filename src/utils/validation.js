// src/utils/validation.js - Допоміжні функції валідації (сумісно з Babel)

/**
 * Валідація українського телефону
 */
export const validatePhone = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return {
      isValid: false,
      message: 'Телефон обов\'язковий',
      formatted: ''
    };
  }

  // Очищуємо телефон від всіх символів, крім цифр і +
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  
  // Українські формати:
  // +380XXXXXXXXX (13 символів)
  // 380XXXXXXXXX (12 символів) 
  // 0XXXXXXXXX (10 символів)
  
  let formattedPhone = '';
  let isValid = false;
  
  if (cleanPhone.startsWith('+380') && cleanPhone.length === 13) {
    // +380671234567
    formattedPhone = cleanPhone;
    isValid = true;
  } else if (cleanPhone.startsWith('380') && cleanPhone.length === 12) {
    // 380671234567 -> +380671234567
    formattedPhone = '+' + cleanPhone;
    isValid = true;
  } else if (cleanPhone.startsWith('0') && cleanPhone.length === 10) {
    // 0671234567 -> +380671234567
    formattedPhone = '+380' + cleanPhone.substring(1);
    isValid = true;
  } else if (/^\d{9}$/.test(cleanPhone) && !cleanPhone.startsWith('380')) {
    // 671234567 -> +380671234567 (але НЕ 380682587)
    formattedPhone = '+380' + cleanPhone;
    isValid = true;
  }
  
  // Додаткові перевірки для валідних номерів
  if (isValid) {
    // Отримуємо 9 цифр після +380
    const phoneDigits = formattedPhone.substring(4);
    
    // Перевіряємо, що після +380 рівно 9 цифр
    if (phoneDigits.length !== 9) {
      isValid = false;
    }
    
    // Перевіряємо, що перша цифра після +380 не дорівнює 0
    if (phoneDigits.startsWith('0')) {
      isValid = false;
    }
    
    // Перевіряємо, що номер не складається з однакових цифр
    if (/^(\d)\1{8}$/.test(phoneDigits)) {
      isValid = false;
    }
  }
  
  return {
    isValid,
    message: isValid ? '' : 'Введіть коректний український номер телефону',
    formatted: formattedPhone,
    original: phone
  };
};

/**
 * Валідація імені (українські літери)
 */
/**
 /**
 * ✅ ВИПРАВЛЕНА валідація імені (українські літери + пробіли + апострофи + дефіси)
 */
export const validateName = (name) => {
  if (!name || typeof name !== 'string') {
    return {
      isValid: false,
      message: 'Ім\'я обов\'язкове',
      cleaned: ''
    };
  }

  // Використовуємо trim тільки для валідації, зберігаємо оригінал
  const trimmedForValidation = name.trim();
  
  if (trimmedForValidation.length < 2) {
    return {
      isValid: false,
      message: 'Ім\'я повинно містити щонайменше 2 символи',
      cleaned: name
    };
  }
  
  if (trimmedForValidation.length > 50) {
    return {
      isValid: false,
      message: 'Ім\'я не може перевищувати 50 символів',
      cleaned: name.substring(0, 50)
    };
  }
  
  // ✅ ВИПРАВЛЕНИЙ regex: українські літери + пробіл + апостроф + дефіс
  const nameRegex = /^[А-ЯІЇЄа-яіїє '-]+$/;
  
  if (!nameRegex.test(trimmedForValidation)) {
    return {
      isValid: false,
      message: 'Ім\'я може містити лише українські літери, пробіли, дефіси та апострофи',
      cleaned: name.replace(/[^А-ЯІЇЄа-яіїє '-]/g, '')
    };
  }
  
  return {
    isValid: true,
    message: '',
    cleaned: name
  };
};


/**
 * Валідація email
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return {
      isValid: true, // email не обов'язковий
      message: '',
      cleaned: ''
    };
  }
  
  const trimmedEmail = email.trim();
  
  if (trimmedEmail === '') {
    return {
      isValid: true,
      message: '',
      cleaned: ''
    };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(trimmedEmail)) {
    return {
      isValid: false,
      message: 'Введіть коректний email адрес',
      cleaned: trimmedEmail
    };
  }
  
  if (trimmedEmail.length > 100) {
    return {
      isValid: false,
      message: 'Email занадто довгий (максимум 100 символів)',
      cleaned: trimmedEmail.substring(0, 100)
    };
  }
  
  return {
    isValid: true,
    message: '',
    cleaned: trimmedEmail.toLowerCase()
  };
};

/**
 * Валідація повідомлення
 */
export const validateMessage = (message) => {
  if (!message || typeof message !== 'string') {
    return {
      isValid: true, // повідомлення не обов'язкове
      message: '',
      cleaned: ''
    };
  }
  
  const trimmedMessage = message.trim();
  
  if (trimmedMessage.length > 1000) {
    return {
      isValid: false,
      message: 'Повідомлення занадто довге (максимум 1000 символів)',
      cleaned: trimmedMessage.substring(0, 1000)
    };
  }
  
  return {
    isValid: true,
    message: '',
    cleaned: trimmedMessage
  };
};

/**
 * Комплексна валідація форми замовлення
 */
export const validateOrderForm = (formData, isConsultationMode = false) => {
  const errors = {};
  const cleanedData = {};
  
  // Валідація імені
  const nameValidation = validateName(formData.name);
  if (!nameValidation.isValid) {
    errors.name = nameValidation.message;
  }
  cleanedData.name = nameValidation.cleaned;
  
  // Валідація телефону
  const phoneValidation = validatePhone(formData.phone);
  if (!phoneValidation.isValid) {
    errors.phone = phoneValidation.message;
  }
  cleanedData.phone = phoneValidation.formatted;
  
  // Валідація email
  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.message;
  }
  cleanedData.email = emailValidation.cleaned;
  
  // Валідація повідомлення
  const messageValidation = validateMessage(formData.message);
  if (!messageValidation.isValid) {
    errors.message = messageValidation.message;
  }
  cleanedData.message = messageValidation.cleaned;
  
  // Додаткові поля для режиму замовлення
  if (!isConsultationMode) {
    // Продукт (не обов'язковий, але корисний)
    cleanedData.product = formData.product || '';
    
    // Тип доставки
    cleanedData.deliveryType = formData.deliveryType || 'delivery';
    
    // Адреса (не обов'язкова)
    cleanedData.address = formData.address ? formData.address.trim() : '';
    
    // Регіон
    cleanedData.region = formData.region ? formData.region.trim() : '';
    
    // Пункт навантаження
    cleanedData.loadingPoint = formData.loadingPoint || '';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    cleanedData
  };
};

/**
 * Форматування телефону для відображення
 */
export const formatPhoneDisplay = (phone) => {
  if (!phone) return '';
  
  const cleanPhone = phone.replace(/[^\d]/g, '');
  
  if (cleanPhone.length === 12 && cleanPhone.startsWith('380')) {
    // 380671234567 -> +38 (067) 123-45-67
    const formatted = `+38 (${cleanPhone.substring(3, 6)}) ${cleanPhone.substring(6, 9)}-${cleanPhone.substring(9, 11)}-${cleanPhone.substring(11)}`;
    return formatted;
  }
  
  return phone;
};

/**
 * Очищення та підготовка даних для Google Sheets
 */
export const prepareDataForSheets = (formData, isConsultationMode = false) => {
  const validation = validateOrderForm(formData, isConsultationMode);
  
  if (!validation.isValid) {
    throw new Error(`Помилки валідації: ${Object.values(validation.errors).join(', ')}`);
  }
  
  const cleanedData = {
    ...validation.cleanedData,
    // Додаємо метадані
    timestamp: new Date().toISOString(),
    mode: isConsultationMode ? 'consultation' : 'order'
  };
  
  return cleanedData;
};

/**
 * Валідація зони доставки
 */
export const validateDeliveryZone = (region) => {
  // Доступні зони доставки згідно з документацією проекту
  const availableZones = [
    'Київ',
    'Київська область', 
    'Житомирська область'
  ];
  
  const restrictedZones = [
    'Черкаська область',
    'Вінницька область', 
    'Полтавська область'
  ];
  
  if (!region) {
    return {
      isValid: true,
      available: false,
      message: 'Регіон не визначено'
    };
  }
  
  const normalizedRegion = region.toLowerCase().trim();
  
  // Перевіряємо доступні зони
  for (const zone of availableZones) {
    if (normalizedRegion.includes(zone.toLowerCase())) {
      return {
        isValid: true,
        available: true,
        region: zone,
        message: 'Доставка доступна'
      };
    }
  }
  
  // Перевіряємо обмежені зони  
  for (const zone of restrictedZones) {
    if (normalizedRegion.includes(zone.toLowerCase())) {
      return {
        isValid: true,
        available: false,
        region: zone,
        message: 'Доставка недоступна. Можливий самовивіз'
      };
    }
  }
  
  return {
    isValid: true,
    available: false,
    region: region,
    message: 'Уточніть можливість доставки у менеджера'
  };
};

// Клас ValidationUtils для сумісності з попереднім кодом
class ValidationUtils {
  static validatePhone = validatePhone;
  static validateName = validateName;
  static validateEmail = validateEmail;
  static validateMessage = validateMessage;
  static validateOrderForm = validateOrderForm;
  static formatPhoneDisplay = formatPhoneDisplay;
  static prepareDataForSheets = prepareDataForSheets;
  static validateDeliveryZone = validateDeliveryZone;
}

// Експорт класу як default для сумісності
export default ValidationUtils;