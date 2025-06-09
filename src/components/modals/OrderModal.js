// src/components/modals/OrderModal.js
import React, { useState, useEffect, useRef } from 'react';
import { useOrderModal } from '../../context/OrderModalContext';
import '../../styles/order-modal.css';

// Дані продукції з контексту проекту COMSPEC
const products = [
  { id: 'gravel', name: 'Щебінь', category: 'Будівельні матеріали' },
  { id: 'sand', name: 'Пісок', category: 'Будівельні матеріали' },
  { id: 'asphalt', name: 'Асфальт', category: 'Будівельні матеріали' },
  { id: 'concrete', name: 'Бетон', category: 'Будівельні матеріали' }
];

// Пункти навантаження згідно з контекстом проекту
const loadingPoints = {
  gravel: [
    { id: 1, name: 'ТДВ "Коростенський щебзавод"', location: 'м. Коростень, Житомирська обл.' },
    { id: 2, name: 'ТОВ "РКДЗ"', location: 'смт. Рокитне, Київська обл.' },
    { id: 3, name: 'ТОВ "ВО Богуславський граніт"', location: 'м. Богуслав, Київська обл.' },
    { id: 4, name: 'ТОВ «Алас Фастів»/ЯРОШІВСЬКИЙ КАР\'ЄР', location: 'с. Ярошівка, Київська обл.' },
    { id: 5, name: 'ТДВ "Березівський кар\'єр"', location: 'Березівка, Житомирська обл.' },
    { id: 6, name: 'ТДВ «Ігнатпільський кар\'єр"', location: 'с. Рудня, Житомирська обл.' },
    { id: 7, name: 'База "АБЗ"', location: 'м. Київ, вул. Покільська, 4' },
    { id: 8, name: 'База "Ірпінь"', location: 'м. Ірпінь, Київська обл.' },
    { id: 9, name: 'База "Бориспіль"', location: 'м. Бориспіль, Київська обл.' }
  ],
  sand: [
    { id: 7, name: 'База "АБЗ"', location: 'м. Київ, вул. Покільська, 4' },
    { id: 8, name: 'База "Ірпінь"', location: 'м. Ірпінь, Київська обл.' },
    { id: 9, name: 'База "Бориспіль"', location: 'м. Бориспіль, Київська обл.' }
  ],
  asphalt: [
    { id: 7, name: 'База "АБЗ"', location: 'м. Київ, вул. Покільська, 4' }
  ],
  concrete: [
    { id: 2, name: 'ТОВ "РКДЗ"', location: 'смт. Рокитне, Київська обл.' }
  ]
};

const OrderModal = () => {
  const { isOpen, orderData, closeOrderModal } = useOrderModal();
  
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
  
  const firstInputRef = useRef(null);

  // Ініціалізація форми при відкритті модального вікна
  useEffect(() => {
    if (isOpen) {
      // Встановлюємо предвибраний товар якщо є
      if (orderData.preSelectedProduct) {
        setFormData(prev => ({
          ...prev,
          product: orderData.preSelectedProduct
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
    }
  }, [isOpen, orderData.preSelectedProduct]);

  // Обробка закриття модального вікна
  const handleClose = () => {
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
    closeOrderModal();
  };
  
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
  }, [isOpen, isSubmitting]);

  // Детекція проблемних мобільних браузерів
  useEffect(() => {
    const detectMobileBrowser = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const isProblematicBrowser = /miuibrowser|samsungbrowser|ucbrowser|oppo|vivo/i.test(userAgent);
      
      if (isMobile || isProblematicBrowser) {
        // Додаємо клас для принудового використання нативних select
        const selects = document.querySelectorAll('.form-select');
        selects.forEach(select => {
          select.classList.add('native-mobile');
          
          // Додаткове виправлення для Android
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
      // Виконуємо детекцію після відкриття модалки
      setTimeout(detectMobileBrowser, 100);
    }
  }, [isOpen]);

  // Обробка зміни полів форми
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Очищаємо помилку при введенні
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Спеціальна обробка для поля імені - дозволяємо тільки кириличні літери
  const handleNameInput = (e) => {
    const { value } = e.target;
    const originalValue = value;
    // Дозволяємо тільки українські літери, пробіли, дефіси та апострофи
    const filteredValue = value.replace(/[^А-ЯІЇЄа-яіїє\'\-\s]/g, '');
    
    // Показуємо попередження якщо символи були відфільтровані
    if (originalValue !== filteredValue && originalValue.length > 0) {
      setErrors(prev => ({
        ...prev,
        nameWarning: 'Дозволені тільки українські літери, пробіли, дефіси та апострофи'
      }));
      
      // Прибираємо попередження через 3 секунди
      setTimeout(() => {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.nameWarning;
          return newErrors;
        });
      }, 3000);
    }
    
    setFormData(prev => ({
      ...prev,
      name: filteredValue
    }));
    
    // Очищаємо помилку при введенні
    if (errors.name) {
      setErrors(prev => ({
        ...prev,
        name: ''
      }));
    }
  };

  // Валідація форми
  const validateForm = () => {
    const newErrors = {};

    // Валідація імені - тільки кириличні літери, пробіли, дефіси та апострофи
    if (!formData.name.trim()) {
      newErrors.name = 'Поле "Ім\'я" є обов\'язковим';
    } else if (!/^[А-ЯІЇЄа-яіїє\'\-\s]+$/.test(formData.name.trim())) {
      newErrors.name = 'Ім\'я може містити лише українські літери, пробіли, дефіси та апострофи';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Ім\'я повинно містити щонайменше 2 символи';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Ім\'я не може перевищувати 50 символів';
    }

    // Валідація телефону
    if (!formData.phone.trim()) {
      newErrors.phone = 'Поле "Телефон" є обов\'язковим';
    } else {
      // Очищуємо телефон від всіх символів крім цифр і +
      const cleanPhone = formData.phone.replace(/[^\d+]/g, '');
      
      // Перевіряємо формати: +380XXXXXXXXX або 0XXXXXXXXX
      if (!/^(\+380\d{9}|0\d{9})$/.test(cleanPhone)) {
        newErrors.phone = 'Введіть коректний український номер телефону (наприклад: +380671234567 або 0671234567)';
      }
    }

    // Валідація email якщо заповнений
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Введіть коректний email адрес';
    }

    // Валідація пункту навантаження для самовивозу ТІЛЬКИ якщо обрано товар
    if (formData.deliveryType === 'pickup' && formData.product && !formData.loadingPoint) {
      newErrors.loadingPoint = 'Оберіть пункт навантаження для самовивозу';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Відправка форми
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Прокручуємо до першої помилки
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

    try {
      // Тут буде інтеграція з Google Sheets API, Telegram та Email
      // Поки що симулюємо відправку
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Дані замовлення:', {
        ...formData,
        source: orderData.source,
        timestamp: new Date().toISOString()
      });

      setShowSuccess(true);
      
      // Автоматично закриваємо модальне вікно через 3 секунди після успіху
      setTimeout(() => {
        handleClose();
      }, 3000);

    } catch (error) {
      console.error('Помилка відправки замовлення:', error);
      setErrors({ submit: 'Помилка при відправці замовлення. Спробуйте ще раз.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Отримання доступних пунктів навантаження для обраного товару
  const getAvailableLoadingPoints = () => {
    if (!formData.product) return [];
    return loadingPoints[formData.product] || [];
  };

  if (!isOpen) return null;

  return (
    <div className="order-modal-overlay" onClick={handleClose}>
      <div className="order-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="order-modal-header">
          <h2 className="order-modal-title">Замовити матеріали</h2>
          <p className="order-modal-subtitle">
            Заповніть форму і ми зв'яжемося з вами протягом 15 хвилин або просто зателефонуйте{' '}
            <a href="tel:+380739272700" className="phone-link">
              073 9 27 27 00
            </a>
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
            // Повідомлення про успіх
            <div className="order-success">
              <svg className="order-success-icon" viewBox="0 0 24 24" fill="none">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h3>Дякуємо за замовлення!</h3>
              <p>
                Ваша заявка успішно відправлена.<br/>
                Наш менеджер зв'яжеться з вами найближчим часом.
              </p>
            </div>
          ) : (
            // Форма замовлення
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
                  onChange={handleInputChange}
                  className={`form-input ${errors.phone ? 'error' : ''}`}
                  placeholder="+38 (0__) ___-__-__"
                  disabled={isSubmitting}
                />
                {errors.phone && <div className="form-error">{errors.phone}</div>}
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

              {/* Оберіть товар */}
              <div className="form-group">
                <label className="form-label">Оберіть товар</label>
                <select
                  name="product"
                  value={formData.product}
                  onChange={handleInputChange}
                  className="form-select"
                  disabled={isSubmitting}
                >
                  <option value="">Не обрано</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
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
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`form-input ${errors.address ? 'error' : ''}`}
                      placeholder="Введіть адресу доставки (необов'язково)"
                      disabled={isSubmitting}
                    />
                    {errors.address && <div className="form-error">{errors.address}</div>}
                  </div>
                </div>
              )}

              {formData.deliveryType === 'pickup' && formData.product && (
                <div className="conditional-field">
                  <div className="form-group">
                    <label className="form-label">Пункт навантаження</label>
                    <select
                      name="loadingPoint"
                      value={formData.loadingPoint}
                      onChange={handleInputChange}
                      className={`form-select ${errors.loadingPoint ? 'error' : ''}`}
                      disabled={isSubmitting}
                    >
                      <option value="">Оберіть пункт навантаження</option>
                     {getAvailableLoadingPoints().map((point, index) => (
                      <option key={point.id} value={point.id}>
                       • {point.name} | {point.location}
                     </option>
                      ))}
                    </select>
                    {errors.loadingPoint && <div className="form-error">{errors.loadingPoint}</div>}
                  </div>
                </div>
              )}

              {/* Підказка якщо обрано самовивіз, але не обрано товар */}
              {formData.deliveryType === 'pickup' && !formData.product && (
                <div className="conditional-field">
                  <div style={{
                    padding: '12px 16px',
                    backgroundColor: '#fff4e6',
                    border: '1px solid #FFA500',
                    borderRadius: '6px',
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

              {/* Повідомлення */}
              <div className="form-group">
                <label className="form-label">Повідомлення</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  className="form-textarea"
                  placeholder="Уточніть бажану фракцію щебеню, марку асфальту або бетону.&#10;Опишіть Ваш проект або додаткові побажання."
                  disabled={isSubmitting}
                  rows="4"
                />
              </div>

              {/* Загальна помилка валідації */}
              {Object.keys(errors).length > 0 && !isSubmitting && (
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: '#fff2f2',
                  border: '1px solid #ff6b6b',
                  borderRadius: '6px',
                  color: '#d63031',
                  fontSize: '0.9rem',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: '#ff6b6b', flexShrink: 0 }}>
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
                      {errors.loadingPoint && <li>Оберіть пункт навантаження</li>}
                      {errors.submit && <li>{errors.submit}</li>}
                    </ul>
                  </div>
                </div>
              )}

              {/* Помилка відправки */}
              {errors.submit && (
                <div className="form-error" style={{ textAlign: 'center', fontSize: '1rem' }}>
                  {errors.submit}
                </div>
              )}

              {/* Кнопки */}
              <div className="form-actions">
                <button
                  type="submit"
                  className="btn-order-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <div className="order-spinner"></div>
                      Відправка...
                    </span>
                  ) : (
                    'Надіслати заявку'
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

              {/* Інформація про обробку */}
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
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderModal;