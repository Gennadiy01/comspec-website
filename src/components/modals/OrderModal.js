// src/components/modals/OrderModal.js - ВИПРАВЛЕНО автозаповнення категорій
import React, { useState, useEffect, useRef, useMemo, useCallback  } from 'react';
import { useOrderModal } from '../../context/OrderModalContext';
import AddressSearch from '../forms/AddressSearch';
import { getLoadingPointsByProduct, getLoadingPointsBySpecificProduct } from '../../data/loadingPoints';
import { isProductAvailableForPickup } from '../../data/productExclusions';
import jsonpService from '../../services/JSONPGoogleSheetsService';
import telegramService from '../../services/TelegramService';
import ValidationUtils from '../../utils/validation';
// import { isEdgeBrowser, areEdgeFixesEnabled } from '../../utils/browserDetection';
import ProductsAPI from '../../data/products/productsAPI.js';
import '../../styles/order-modal.css';

// Отримання даних продукції з нової системи
const categories = [
  { id: 'Щебінь', name: 'Щебінь', category: 'Будівельні матеріали' },
  { id: 'Пісок', name: 'Пісок', category: 'Будівельні матеріали' },
  { id: 'Асфальт', name: 'Асфальт', category: 'Будівельні матеріали' },
  { id: 'Бетон', name: 'Бетон', category: 'Будівельні матеріали' }
];


// ✅ МАПІНГ КАТЕГОРІЙ: використовуємо з ProductsAPI
const categoryMapping = ProductsAPI.CATEGORY_MAPPING;

const OrderModal = () => {
  const { isOpen, orderData, closeOrderModal } = useOrderModal();
  
  // ВАЖЛИВО: Визначаємо режим модального вікна
  const isConsultationMode = orderData?.source === 'services-page';
  
  // Стани форми
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    product: '',
    deliveryType: 'delivery',
    address: '',
    loadingPoint: '',
    message: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  
  // ВАЖЛИВО: Стани для пошуку адреси - мають бути завжди присутні
  const [addressData, setAddressData] = useState(null);
  const [deliveryValidation, setDeliveryValidation] = useState(null);
  
  const firstInputRef = useRef(null);

  // Мемоізуємо список критичних помилок
  const criticalErrors = useMemo(() => {
    return Object.keys(errors).filter(key => 
      key !== 'nameWarning' && errors[key]
    );
  }, [errors]);

  // Динамічні тексти залежно від режиму
  const modalTitle = isConsultationMode ? 'Замовити консультацію' : 'Замовити матеріали';
  const modalSubtitle = isConsultationMode 
    ? 'Заповніть форму і ми зв\'яжемося з вами для обговорення деталей' 
    : 'Заповніть форму і ми зв\'яжемося з вами протягом 15 хвилин або просто зателефонуйте 073 9 27 27 00';
  const submitButtonText = isConsultationMode ? 'Надіслати заявку' : 'Надіслати замовлення';
  const messagePlaceholder = isConsultationMode 
    ? 'Опишіть послуги, які вас цікавлять...' 
    : 'Уточніть бажану фракцію щебеню, марку асфальту або бетону.\nОпишіть Ваш проект або додаткові побажання.';

  // ✅ ВИПРАВЛЕНО: Ініціалізація форми при відкритті модального вікна
  useEffect(() => {
    if (isOpen) {
      // Скидаємо форму до початкових значень
      setFormData({
        name: '',
        phone: '',
        email: '',
        product: '',
        deliveryType: 'delivery',
        address: '',
        loadingPoint: '',
        message: ''
      });

      // ✅ АВТОЗАПОВНЕННЯ ТОВАРУ (тільки для режиму замовлення)
      if (!isConsultationMode && orderData?.product) {

        let productToSet = '';
        
        // Логіка вибору товару залежно від джерела
        if (orderData.source === 'hero-section' || orderData.source === 'companies-section') {
          // З Hero або компаній - залишаємо порожнім для вибору категорії
          productToSet = '';
        } else if (orderData.source === 'product-card') {
          // З картки категорії на головній - підставляємо категорію
          const mappedProduct = categoryMapping[orderData.product] || orderData.product;
          productToSet = mappedProduct;
        } else if (orderData.source === 'products-page' || orderData.source === 'product-detail-page') {
          // З сторінки товарів або деталі товару - блокуємо select і показуємо конкретний товар
          productToSet = orderData.productTitle || orderData.product;
        }
        
        setFormData(prev => ({
          ...prev,
          product: productToSet
        }));

      }
      
      // Фокусуємося на першому полі після відкриття
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);
      
      // Скидаємо стани при відкритті
      setErrors({});
      setIsSubmitting(false);
      setShowSuccess(false);
      setSubmitResult(null);
      setAddressData(null);
      setDeliveryValidation(null);
    }
  }, [isOpen, orderData?.product, orderData?.productTitle, orderData?.source, isConsultationMode]);

  // Обробка закриття модального вікна
  const handleClose = useCallback(() => {
    // Скидаємо форму
    setFormData({
      name: '',
      phone: '',
      email: '',
      product: '',
      deliveryType: 'delivery',
      address: '',
      loadingPoint: '',
      message: ''
    });
    setErrors({});
    setIsSubmitting(false);
    setShowSuccess(false);
    setSubmitResult(null);
    setAddressData(null);
    setDeliveryValidation(null);
    closeOrderModal();
  }, [closeOrderModal]);
  
  // Обробка натискання Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, isSubmitting, handleClose]);

  // Детекція проблемних мобільних браузерів
  useEffect(() => {
    const detectMobileBrowser = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const isProblematicBrowser = /miuibrowser|samsungbrowser|ucbrowser|oppo|vivo/i.test(userAgent);
      
      if (isMobile || isProblematicBrowser) {
        const selects = document.querySelectorAll('.form-select');
        selects.forEach(select => {
          select.classList.add('native-mobile');
          
          if (/android/i.test(userAgent)) {
            select.style.cssText += `
              -webkit-appearance: listbox !important;
              appearance: listbox !important;
              background-color: #ffffff !important;
              border: 2px solid #008080 !important;
              color: #333333 !important;
              font-size: 16px !important;
              padding: 12px !important;
              min-height: 48px !important;
            `;
          }
        });
      }
    };

    if (isOpen) {
      setTimeout(detectMobileBrowser, 100);
    }
  }, [isOpen]);

  // Обробка зміни полів форми
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // 🔧 PRODUCTION FIX: Спеціальна обробка зміни типу доставки (ЗАВЖДИ, не тільки для Edge)
    if (name === 'deliveryType' && value === 'pickup') {
      console.log('🔧 Production Fix: Перемикання на самовивіз - очищаємо адресу');
      
      setFormData(prev => ({
        ...prev,
        [name]: value,
        address: '', // Примусово очищаємо адресу
      }));
      
      // Очищаємо дані адреси і валідації
      setAddressData(null);
      setDeliveryValidation(null);
      
      // Очищаємо помилки адреси
      if (errors.address) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.address;
          return newErrors;
        });
      }
      
      console.log('🔧 Production Fix: Адреса очищена для самовивозу');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Спеціальна обробка для поля імені з валідацією через ValidationUtils
  
const handleNameInput = (e) => {
  const { value } = e.target;
  const validation = ValidationUtils.validateName(value);
  
  // Встановлюємо очищене значення
  setFormData(prev => ({
    ...prev,
    name: validation.cleaned
  }));
  
  // Показуємо попередження якщо були неприпустимі символи
  if (value !== validation.cleaned && value.length > 0) {
    setErrors(prev => ({
      ...prev,
      nameWarning: 'Дозволені тільки українські літери, пробіли, дефіси та апострофи'
    }));
    
    setTimeout(() => {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.nameWarning;
        return newErrors;
      });
    }, 3000);
  }
  
  // Очищаємо помилку валідації
  if (errors.name) {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.name;
      return newErrors;
    });
  }
};

  // Обробка телефону з автоматичним форматуванням
  const handlePhoneInput = (e) => {
    const { value } = e.target;
    const validation = ValidationUtils.validatePhone(value);
    
    // Встановлюємо форматований телефон якщо валідація пройшла
    setFormData(prev => ({
      ...prev,
      phone: validation.isValid ? validation.formatted : value
    }));
    
    // Очищаємо помилку якщо телефон став валідним
    if (validation.isValid && errors.phone) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.phone;
        return newErrors;
      });
    }
  };

  // ВИПРАВЛЕНИЙ хендлер для вибору адреси
  const handleAddressSelect = (data) => {
    console.log('Вибрано адресу:', data);
    
    setAddressData(data);
    setDeliveryValidation(data.validation);
    
    if (data.validation) {
      console.log('Результат валідації доставки:', {
        region: data.validation.region,
        available: data.validation.available,
        message: data.validation.message
      });
    }
  };

  // Валідація форми з використанням ValidationUtils
  const validateForm = () => {
    const validation = ValidationUtils.validateOrderForm(formData, isConsultationMode);
    
    setErrors(validation.errors);
    
    // Додаємо попередження про ім'я якщо воно є
    if (errors.nameWarning) {
      setErrors(prev => ({
        ...prev,
        nameWarning: errors.nameWarning
      }));
    }
    
    return validation.isValid;
  };

  // Відправка форми з Google Sheets інтеграцією
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      const firstErrorField = document.querySelector('.form-input.error, .form-select.error');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        firstErrorField.focus();
      }
      return;
    }

    setIsSubmitting(true);
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.submit;
      return newErrors;
    });

    try {
      // ✅ EDGE БРАУЗЕР FIX: очищаємо адресу ПЕРЕД обробкою для самовивозу
      const formDataToProcess = { ...formData };
      if (formDataToProcess.deliveryType === 'pickup') {
        formDataToProcess.address = '';
        formDataToProcess.region = '';
        console.log('🔧 Edge Fix: Очищено адресу для самовивозу перед обробкою');
      }
      
      // Підготовка даних для Google Sheets з використанням ValidationUtils
      const cleanedData = ValidationUtils.prepareDataForSheets(formDataToProcess, isConsultationMode);
      
      // ✅ ДОДАТКОВИЙ ЗАХИСТ: очищаємо адресу для самовивозу після обробки
      if (formDataToProcess.deliveryType === 'pickup') {
        cleanedData.address = '';
        cleanedData.region = '';
      }
      
      // Додаємо дані з валідації адреси
      const orderDataForSheets = {
        ...cleanedData,
        region: (() => {
          // ✅ ВИПРАВЛЕННЯ: для самовивозу регіон не потрібен
          if (formDataToProcess.deliveryType === 'pickup') {
            return '';
          }
          
          // Спочатку перевіряємо дані з addressData
          if (addressData?.validation?.region) {
            return addressData.validation.region;
          }
          
          // Потім перевіряємо deliveryValidation
          if (deliveryValidation?.region) {
            return deliveryValidation.region;
          }
          
          // Якщо є адреса, але немає валідації - витягуємо область вручну
          if (formData.address) {
            const extractedRegion = ValidationUtils.validateDeliveryZone(formData.address);
            return extractedRegion.region;
          }
          
          // Якщо нічого немає - повертаємо порожній рядок
          return '';
        })(),

        loadingPoint: (() => {
          if (!formData.loadingPoint) return '';
          
          const availablePoints = getAvailableLoadingPoints();
          console.log('🔍 Debug loadingPoint:', {
            formLoadingPoint: formData.loadingPoint,
            formLoadingPointType: typeof formData.loadingPoint,
            availablePoints: availablePoints.map(p => ({ id: p.id, idType: typeof p.id, name: p.name }))
          });
          
          const foundPoint = availablePoints.find(p => p.id.toString() === formData.loadingPoint.toString());
          console.log('🎯 Found point:', foundPoint);
          
          return foundPoint?.name || '';
        })()
      };

      // Debug: логування регіону (ПІСЛЯ об'єкта!)
      console.log('🔍 Debug region detection:', {
        formAddress: formData.address,
        addressDataRegion: addressData?.validation?.region,
        deliveryValidationRegion: deliveryValidation?.region,
        finalRegion: orderDataForSheets.region
      });

      // Визначаємо джерело замовлення
      const source = orderData?.source === 'services-page' ? 'services-page' : 'product-page';
      
      console.log('Відправляємо замовлення в Google Sheets:', {
        formData: orderDataForSheets,
        isConsultationMode,
        source,
        addressData,
        deliveryValidation
      });

      // ✅ EDGE БРАУЗЕР FINAL FIX: остаточна перевірка перед відправкою
      const finalOrderData = { ...orderDataForSheets };
      if (finalOrderData.deliveryType === 'pickup') {
        finalOrderData.address = '';
        finalOrderData.region = '';
        finalOrderData.deliveryAddress = ''; // Додатково очищаємо deliveryAddress
        console.log('🔧 Edge Final Fix: Остаточно очищено адресу та регіон для самовивозу');
        console.log('📋 Фінальні дані для відправки:', finalOrderData);
      }
      
      // 🔧 ДОДАТКОВИЙ EDGE FIX: Перевірка на undefined/null значення
      Object.keys(finalOrderData).forEach(key => {
        if (finalOrderData[key] === undefined || finalOrderData[key] === null) {
          finalOrderData[key] = '';
        }
      });

      // Відправляємо замовлення через JSONP сервіс (БЕЗ CORS проблем)
      const result = await jsonpService.saveOrder(
        finalOrderData, 
        isConsultationMode, 
        source
      );

      if (result.success) {
        setSubmitResult(result);
        setShowSuccess(true);
        
        console.log('Замовлення успішно збережено:', {
          orderId: result.orderId,
          manager: result.manager,
          mode: isConsultationMode ? 'consultation' : 'order',
          source: source,
          data: result.data
        });

        // 📊 Відстеження аналітики замовлення
        try {
          const ProductAnalytics = (await import('../../analytics/ProductAnalytics')).default;
          
          // Визначаємо productId з формових даних
          const productId = orderData?.productId || formData.product || 'unknown';
          
          ProductAnalytics.trackEvent('product_order', {
            productId: productId,
            orderId: result.orderId,
            orderType: isConsultationMode ? 'consultation' : 'order',
            deliveryType: formData.deliveryType,
            source: source,
            manager: result.manager,
            region: finalOrderData.region || '',
            loadingPoint: finalOrderData.loadingPoint || ''
          });

          console.log('📊 Відстежено замовлення аналітикою:', {
            event: 'product_order',
            productId: productId,
            orderId: result.orderId
          });
        } catch (analyticsError) {
          console.error('❌ Помилка відстеження замовлення аналітикою:', analyticsError);
        }

        // 🆕 ЕТАП 2: Відправка в Telegram після успішного збереження
        try {
          console.log('🔍 DEBUG: Перевірка Telegram сервісу...');
          console.log('🔍 DEBUG: telegramService:', telegramService);
          console.log('🔍 DEBUG: telegramService methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(telegramService)));
          
          if (telegramService && telegramService.isEnabled && telegramService.isEnabled()) {
            console.log('📤 Відправляємо замовлення в Telegram...');
            
            const telegramData = {
              orderId: result.orderId,
              manager: result.manager,
              orderData: orderDataForSheets, // Використовуємо підготовлені дані замість result.data
              isConsultation: isConsultationMode,
              managerTelegramChatId: result.managerTelegramChatId
            };
            
            console.log('🔍 DEBUG: Telegram дані:', telegramData);
            
            const telegramResult = await telegramService.sendOrderNotification(telegramData);
            
            if (telegramResult && telegramResult.success) {
              console.log('✅ Telegram повідомлення відправлено:', telegramResult);
            } else {
              console.warn('⚠️ Помилка Telegram (замовлення збережено):', telegramResult?.message || 'Невідома помилка');
            }
          } else {
            console.log('ℹ️ Telegram сервіс вимкнений або не налаштований');
            console.log('🔍 DEBUG: telegramService enabled check:', {
              hasService: !!telegramService,
              hasMethod: !!(telegramService && telegramService.isEnabled),
              isEnabled: telegramService ? telegramService.isEnabled() : 'No service'
            });
          }
        } catch (telegramError) {
          console.error('❌ КРИТИЧНА ПОМИЛКА Telegram:', {
            error: telegramError,
            message: telegramError?.message,
            stack: telegramError?.stack,
            name: telegramError?.name
          });
          // НЕ блокуємо основний процес - Telegram це додаткова функція
        }

        // Автоматичне закриття через 5 секунд (збільшено для читання результату)
        setTimeout(() => {
          handleClose();
        }, 5000);
      } else {
        throw new Error('Не вдалося зберегти замовлення');
      }

    } catch (error) {
      console.error('Помилка відправки замовлення:', error);
      
      // Показуємо зрозумілу помилку користувачу
      let errorMessage = 'Помилка при відправці замовлення. Спробуйте ще раз.';
      
      if (error.message.includes('підключитися до бази даних')) {
        errorMessage = 'Тимчасові проблеми з сервером. Спробуйте за кілька хвилин або зателефонуйте нам.';
      } else if (error.message.includes('валідації')) {
        errorMessage = error.message;
      } else if (error.message.includes('Немає активних менеджерів')) {
        errorMessage = 'Наразі всі менеджери зайняті. Будь ласка, зателефонуйте нам або спробуйте пізніше.';
      } else if (error.message.includes('OVER_QUERY_LIMIT')) {
        errorMessage = 'Перевищено ліміт запитів. Спробуйте через кілька хвилин або зателефонуйте нам.';
      }
      
      setErrors({ submit: errorMessage });
      
      // Детальне логування для відладки
      console.error('Деталі помилки:', {
        message: error.message,
        stack: error.stack,
        formData: formData,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Отримання доступних пунктів навантаження з урахуванням правил для конкретних товарів
  const getAvailableLoadingPoints = () => {
    if (!formData.product) return [];
    
    // Отримуємо конкретний продукт
    const allProducts = ProductsAPI.getAllProducts();
    const foundProduct = allProducts.find(p => p.title === formData.product);
    
    if (foundProduct) {
      // Використовуємо нову функцію з правилами виключень
      
      return getLoadingPointsBySpecificProduct(foundProduct.id, foundProduct.title);
    } else {
      // Якщо товар не знайдено, використовуємо стару логіку з категоріями
      const productCategory = getProductCategoryForLoadingPoints(formData.product);
      
      return getLoadingPointsByProduct(productCategory);
    }
  };

  // Функція визначення категорії товару для пунктів навантаження
  const getProductCategoryForLoadingPoints = (product) => {
    // Якщо це вже категорія (з Hero або карток категорій)
    if (['Щебінь', 'Пісок', 'Асфальт', 'Бетон'].includes(product)) {
      return product;
    }

    // Якщо це конкретний товар, визначаємо його категорію
    const allProducts = ProductsAPI.getAllProducts();
    const foundProduct = allProducts.find(p => p.title === product);
    
    if (foundProduct) {
      // Мапимо назву категорії товару до української назви для пунктів навантаження
      return categoryMapping[foundProduct.category] || foundProduct.categoryName || 'Щебінь';
    }

    // За замовчуванням повертаємо Щебінь
    return 'Щебінь';
  };

  if (!isOpen) return null;

  return (
    <div className="order-modal-overlay" onClick={handleClose}>
      <div className="order-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="order-modal-header">
          <h2 className="order-modal-title">{modalTitle}</h2>
          <p className="order-modal-subtitle">
            {isConsultationMode ? (
              modalSubtitle
            ) : (
              <>
                {modalSubtitle.split('073 9 27 27 00')[0]}
                <a href="tel:+380739272700" className="phone-link">
                  073 9 27 27 00
                </a>
              </>
            )}
          </p>
          <button onClick={handleClose} className="order-close-btn">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="order-modal-body">
          {showSuccess ? (
            <div className="order-success">
              <svg className="order-success-icon" viewBox="0 0 24 24" fill="none">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h3>{isConsultationMode ? 'Дякуємо за звернення!' : 'Дякуємо за замовлення!'}</h3>
              <p>
                {submitResult ? (
                  <>
                    Ваша заявка успішно відправлена.<br/>
                    <strong>Номер замовлення: #{submitResult.orderId}</strong><br/>
                    <strong>Ваш менеджер: {submitResult.manager}</strong><br/>
                    Очікуйте дзвінок найближчим часом.
                  </>
                ) : (
                  <>
                    Ваша заявка успішно відправлена.<br/>
                    Наш менеджер зв'яжеться з вами найближчим часом.
                  </>
                )}
              </p>
              
              {/* Додаткова інформація про замовлення */}
              {submitResult && submitResult.data && (
                <div style={{
                  marginTop: '20px',
                  padding: '15px',
                  backgroundColor: 'rgba(0, 128, 128, 0.05)',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  color: '#495057'
                }}>
                  <div><strong>Дата:</strong> {submitResult.data.Date} о {submitResult.data.Time}</div>
                  {submitResult.data.Product && (
                    <div><strong>Продукт:</strong> {submitResult.data.Product}</div>
                  )}
                  {submitResult.data.Delivery_Type && (
                    <div><strong>Доставка:</strong> {submitResult.data.Delivery_Type === 'delivery' ? 'Доставка' : 'Самовивіз'}</div>
                  )}
                  <div><strong>Режим:</strong> {submitResult.data.Mode === 'consultation' ? 'Консультація' : 'Замовлення'}</div>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="order-form">
              {/* Ім'я */}
              <div className="form-group">
                <label className="form-label required">Ваше ім'я</label>
                <input
                  ref={firstInputRef}
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleNameInput}
                  className={`form-input ${errors.name ? 'error' : ''}`}
                  placeholder="Іван Іваненко"
                  disabled={isSubmitting}
                  maxLength="50"
                />
                {errors.name && <div className="form-error">{errors.name}</div>}
                {errors.nameWarning && (
                  <div className="form-warning" style={{
                    color: '#FFA500',
                    fontSize: '0.875rem',
                    marginTop: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                      <path d="M12 9v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 1L3 21h18L12 1z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {errors.nameWarning}
                  </div>
                )}
              </div>

              {/* Телефон */}
              <div className="form-group">
                <label className="form-label required">Телефон</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handlePhoneInput}
                  className={`form-input ${errors.phone ? 'error' : ''}`}
                  placeholder="+38 (0__) ___-__-__"
                  disabled={isSubmitting}
                />
                {errors.phone && <div className="form-error">{errors.phone}</div>}
                <div style={{
                  fontSize: '0.8rem',
                  color: '#6c757d',
                  marginTop: '4px'
                }}>
                  Формати: +380671234567, 380671234567, 0671234567
                </div>
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="your@email.com"
                  disabled={isSubmitting}
                />
                {errors.email && <div className="form-error">{errors.email}</div>}
              </div>

              {/* Поля для замовлення - показуємо тільки якщо НЕ консультація */}
              {!isConsultationMode && (
                <>
                  {/* Оберіть товар */}
                  <div className="form-group">
                    <label className="form-label">Оберіть товар</label>
                    {orderData?.source === 'products-page' || orderData?.source === 'product-detail-page' ? (
                      /* Для конкретних товарів - показуємо тільки обраний товар */
                      <input
                        type="text"
                        name="product"
                        value={formData.product}
                        className="form-input"
                        disabled={true}
                        style={{
                          backgroundColor: '#f8f9fa',
                          color: '#495057',
                          cursor: 'not-allowed'
                        }}
                      />
                    ) : (
                      /* Для Hero та карток категорій - показуємо список категорій */
                      <select
                        name="product"
                        value={formData.product}
                        onChange={handleInputChange}
                        className="form-select"
                        disabled={isSubmitting}
                      >
                        <option value="">Не обрано</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Тип отримання */}
                  <div className="form-group">
                    <label className="form-label">Спосіб отримання</label>
                    <div className="radio-group">
                      <div className="radio-option">
                        <input
                          type="radio"
                          id="delivery"
                          name="deliveryType"
                          value="delivery"
                          checked={formData.deliveryType === 'delivery'}
                          onChange={handleInputChange}
                          disabled={isSubmitting}
                        />
                        <label htmlFor="delivery">Доставка</label>
                      </div>
                      <div className="radio-option">
                        <input
                          type="radio"
                          id="pickup"
                          name="deliveryType"
                          value="pickup"
                          checked={formData.deliveryType === 'pickup'}
                          onChange={handleInputChange}
                          disabled={isSubmitting}
                        />
                        <label htmlFor="pickup">Самовивіз</label>
                      </div>
                    </div>
                  </div>

                  {/* Умовні поля */}
                  {formData.deliveryType === 'delivery' && (
                    <div className="conditional-field">
                      <div className="form-group">
                        <label className="form-label">Адреса доставки</label>
                        <AddressSearch
                          value={formData.address}
                          onChange={(value) => setFormData(prev => ({ ...prev, address: value }))}
                          onAddressSelect={handleAddressSelect}
                          error={errors.address}
                          disabled={isSubmitting}
                          placeholder="Введіть адресу доставки (необов'язково)..."
                        />
                        {errors.address && <div className="form-error">{errors.address}</div>}
                        
                        {/* Показуємо результат валідації доставки ++++ дублююче повыдомлення закоментоване ++++++++++++++
                        {deliveryValidation && (
                          <div style={{
                            marginTop: '8px',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            backgroundColor: deliveryValidation.available ? 
                              'rgba(40, 167, 69, 0.1)' : 'rgba(255, 193, 7, 0.1)',
                            color: deliveryValidation.available ? '#155724' : '#856404',
                            border: `1px solid ${deliveryValidation.available ? 
                              'rgba(40, 167, 69, 0.3)' : 'rgba(255, 193, 7, 0.3)'}`
                          }}>
                            <strong>{deliveryValidation.region}:</strong> {deliveryValidation.message}
                          </div>
                        )}

                        ++++++++++++++++++++++++++++++++++++++++++++++ */}
                        
                        <div style={{
                          fontSize: '0.825rem',
                          color: '#6c757d',
                          marginTop: '6px',
                          fontStyle: 'italic'
                        }}>
                          Адресу можна не вказувати — менеджер уточнить деталі доставки по телефону
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.deliveryType === 'pickup' && formData.product && (() => {
                    const availablePoints = getAvailableLoadingPoints();
                    const allProducts = ProductsAPI.getAllProducts();
                    const foundProduct = allProducts.find(p => p.title === formData.product);
                    const isAvailable = foundProduct ? isProductAvailableForPickup(foundProduct.id) : availablePoints.length > 0;
                    
                    if (!isAvailable) {
                      return (
                        <div className="conditional-field">
                          <div className="form-group">
                            <label className="form-label">Пункт навантаження</label>
                            <div style={{
                              padding: '12px 16px',
                              backgroundColor: 'rgba(220, 53, 69, 0.08)',
                              border: '1px solid rgba(220, 53, 69, 0.3)',
                              borderRadius: '8px',
                              color: '#721c24',
                              fontSize: '0.9rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              minHeight: '48px'
                            }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: '#dc3545', flexShrink: 0 }}>
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                                <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                                <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
                              </svg>
                              <span>Продукція не доступна для самовивозу</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    
                    return (
                      <div className="conditional-field">
                        <div className="form-group">
                          <label className="form-label">Пункт навантаження</label>
                          <select
                            name="loadingPoint"
                            value={formData.loadingPoint}
                            onChange={handleInputChange}
                            className={`form-select form-select-mobile-optimized ${errors.loadingPoint ? 'error' : ''}`}
                            disabled={isSubmitting}
                          >
                            <option value="">Не обрано</option>
                            {availablePoints.map((point) => (
                              <option key={point.id} value={point.id}>
                                ⬤ {point.name} | {point.address}
                              </option>
                            ))}
                          </select>
                          {errors.loadingPoint && <div className="form-error">{errors.loadingPoint}</div>}
                          
                          <div style={{
                            fontSize: '0.825rem',
                            color: '#6c757d',
                            marginTop: '6px',
                            fontStyle: 'italic'
                          }}>
                            Пункт навантаження можна не обирати — менеджер допоможе обрати найзручніший
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Підказка якщо обрано самовивіз, але не обрано товар */}
                  {formData.deliveryType === 'pickup' && !formData.product && (
                    <div className="conditional-field">
                      <div style={{
                        padding: '12px 16px',
                        backgroundColor: 'rgba(255, 165, 0, 0.08)',
                        border: '1px solid rgba(255, 165, 0, 0.3)',
                        borderRadius: '8px',
                        color: '#856404',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: '#FFA500', flexShrink: 0 }}>
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                          <path d="M12 16v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>Оберіть товар, щоб побачити доступні пункти навантаження</span>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Повідомлення */}
              <div className="form-group">
                <label className="form-label">Повідомлення</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  className="form-textarea"
                  placeholder={messagePlaceholder}
                  disabled={isSubmitting}
                  rows="4"
                  maxLength="1000"
                />
                <div style={{
                  fontSize: '0.8rem',
                  color: '#6c757d',
                  marginTop: '4px',
                  textAlign: 'right'
                }}>
                  {formData.message.length}/1000 символів
                </div>
              </div>

              {/* Помилки валідації */}
              {criticalErrors.length > 0 && !isSubmitting && (
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: 'rgba(220, 53, 69, 0.08)',
                  border: '1px solid rgba(220, 53, 69, 0.3)',
                  borderRadius: '8px',
                  color: '#721c24',
                  fontSize: '0.9rem',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px'
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: '#dc3545', flexShrink: 0, marginTop: '2px' }}>
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                    <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <div>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                      Будь ласка, виправте помилки у формі:
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '16px' }}>
                      {errors.name && <li>Перевірте поле "Ім'я"</li>}
                      {errors.phone && <li>Перевірте поле "Телефон"</li>}
                      {errors.email && <li>Перевірте поле "Email"</li>}
                      {errors.address && <li>Перевірте адресу доставки</li>}
                      {errors.submit && <li>{errors.submit}</li>}
                    </ul>
                  </div>
                </div>
              )}

              {/* Спеціальна помилка відправки */}
              {errors.submit && (
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: 'rgba(220, 53, 69, 0.08)',
                  border: '1px solid rgba(220, 53, 69, 0.3)',
                  borderRadius: '8px',
                  color: '#721c24',
                  fontSize: '0.9rem',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px'
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: '#dc3545', flexShrink: 0, marginTop: '2px' }}>
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 8v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <div>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                      Помилка відправки
                    </div>
                    <div>{errors.submit}</div>
                    <div style={{ marginTop: '8px', fontSize: '0.85rem', color: '#856404' }}>
                      💡 Ви завжди можете зателефонувати нам: 
                      <a href="tel:+380739272700" style={{ color: '#008080', fontWeight: '600' }}>
                        073 9 27 27 00
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Кнопки */}
              <div className="form-actions">
                <button
                  type="submit"
                  className="btn-order-submit"
                  disabled={isSubmitting}
                  style={{
                    opacity: isSubmitting ? 0.7 : 1,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isSubmitting ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <div className="order-spinner"></div>
                      {isConsultationMode ? 'Відправляємо заявку...' : 'Створюємо замовлення...'}
                    </span>
                  ) : (
                    submitButtonText
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="btn-order-cancel"
                  disabled={isSubmitting}
                >
                  Скасувати
                </button>
              </div>

              {/* Інформація про обробку - показуємо тільки для режиму замовлення */}
              {!isConsultationMode && (
                <div style={{
                  fontSize: '0.875rem',
                  color: '#6c757d',
                  textAlign: 'left',
                  marginTop: '16px',
                  marginLeft: '16px',
                  lineHeight: '1.6',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  alignItems: 'flex-start'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: '#008080', flexShrink: 0 }}>
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Замовлення обробляються з 8:00 до 20:00, пн-сб</span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: '#008080', flexShrink: 0 }}>
                      <path d="M1 3h15v13H1z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="6" cy="19" r="2" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="20" cy="19" r="2" stroke="currentColor" strokeWidth="2"/>
                      <path d="M16 3v13h4.5l2-4V8h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Мінімальна партія - 1 машина</span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: '#008080', flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Вартість доставки розраховується менеджером</span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: '#008080', flexShrink: 0 }}>
                      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Сертифіковані матеріали з гарантією якості</span>
                  </div>
                </div>
              )}

              {/* Інформація про консультацію */}
              {isConsultationMode && (
                <div style={{
                  fontSize: '0.875rem',
                  color: '#6c757d',
                  textAlign: 'left',
                  marginTop: '16px',
                  marginLeft: '16px',
                  lineHeight: '1.6',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  alignItems: 'flex-start'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: '#008080', flexShrink: 0 }}>
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Безкоштовна консультація наших експертів</span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: '#008080', flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Зв'яжемося протягом 15 хвилин</span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: '#008080', flexShrink: 0 }}>
                      <path d="M9 11H1v8a2 2 0 0 0 2 2h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M13 21h8a2 2 0 0 0 2-2v-8h-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M13 3h8a2 2 0 0 1 2 2v8h-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M1 11h8V3a2 2 0 0 0-2-2H3a2 2 0 0 0-2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Індивідуальний розрахунок для вашого проекту</span>
                  </div>
                </div>
              )}

              {/* Індикатор безпеки та конфіденційності */}
              <div style={{
                marginTop: '20px',
                padding: '12px 16px',
                backgroundColor: 'rgba(0, 128, 128, 0.05)',
                border: '1px solid rgba(0, 128, 128, 0.2)',
                borderRadius: '8px',
                fontSize: '0.8rem',
                color: '#495057',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ color: '#008080', flexShrink: 0 }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="16" r="1" stroke="currentColor" strokeWidth="2"/>
                  <path d="M7 11V7a5 5 0 1 1 10 0v4" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <span>
                  Ваші дані захищені та використовуються виключно для обробки замовлення
                </span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderModal;