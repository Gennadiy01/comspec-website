import React, { useState, useEffect } from 'react';
import jsonpService from '../services/JSONPGoogleSheetsService';
import telegramService from '../services/TelegramService';
import ValidationUtils from '../utils/validation';

const Contacts = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [errors, setErrors] = useState({});

  // Обробка якорів при завантаженні сторінки
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      // Перевіряємо чи є це справжній якір (не маршрут)
      const hashParts = hash.split('#');
      if (hashParts.length > 2) {
        // Якщо є більше одного #, беремо останню частину як якір
        const anchorId = '#' + hashParts.pop();
        const element = document.querySelector(anchorId);
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start' 
            });
          }, 100);
        }
      }
      // Ігноруємо хеші які є маршрутами (наприклад #/contacts)
    }
  }, []);

  // Тестова функція для діагностики (тільки у development)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.testContactForm = async () => {
        console.log('🧪 Тест форми зворотного зв\'язку...');
        
        // Тест підключення до Google Apps Script
        try {
          const testResult = await jsonpService.testConnection();
          console.log('✅ Google Apps Script підключення:', testResult);
        } catch (error) {
          console.error('❌ Помилка підключення Google Apps Script:', error);
        }
        
        // Тест Telegram сервісу
        console.log('🤖 Telegram статус:', {
          enabled: telegramService.isEnabled(),
          service: !!telegramService,
          hasBotToken: !!telegramService.botToken
        });
        
        // Тест валідації
        const testData = {
          name: 'Тест Контакти',
          phone: '0671234567',
          email: 'test@contact.com',
          message: 'Тестове повідомлення з форми контактів'
        };
        
        const validation = ValidationUtils.validateOrderForm(testData);
        console.log('🔍 Валідація тестових даних:', validation);
        
        return {
          googleScript: true,
          telegram: telegramService.isEnabled(),
          validation: validation.isValid
        };
      };
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Валідація через ValidationUtils (як у формі замовлення)
    const validationResult = ValidationUtils.validateOrderForm(formData);
    
    if (!validationResult.isValid) {
      console.log('❌ Форма містить помилки:', validationResult.errors);
      setErrors(validationResult.errors);
      setSubmitResult({ 
        success: false, 
        message: 'Будь ласка, виправте помилки у формі.' 
      });

      // Автоматично приховуємо повідомлення через 6 секунд
      setTimeout(() => {
        setSubmitResult(null);
      }, 6000);
      return;
    }

    // Очищуємо помилки при успішній валідації
    setErrors({});
    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      console.log('📝 Відправляємо повідомлення зворотного зв\'язку:', formData);

      // Використовуємо очищені дані з валідації (відформатований телефон і т.д.)
      const cleanedData = validationResult.cleanedData;
      console.log('🔧 Очищені дані для відправки:', cleanedData);
      
      // Відправляємо повідомлення через Google Apps Script
      console.log('📤 Викликаємо jsonpService.saveFeedback...');
      const result = await jsonpService.saveFeedback(cleanedData, 'contact-form');
      
      console.log('✅ Повідомлення успішно збережено:', result);
      console.log('👨‍💼 Призначений менеджер:', result.manager);
      console.log('📱 Chat ID менеджера:', result.managerTelegramChatId);

      // Відправляємо повідомлення в Telegram
      console.log('🤖 Перевірка Telegram сервісу:');
      console.log('  - Telegram enabled:', telegramService.isEnabled());
      console.log('  - Manager:', result.manager);
      console.log('  - Manager Chat ID:', result.managerTelegramChatId);
      
      if (telegramService.isEnabled() && result.manager && result.managerTelegramChatId) {
        console.log('📤 Відправляємо повідомлення в Telegram...');
        
        const telegramData = {
          feedbackId: result.feedbackId || 'FEEDBACK-' + Date.now(),
          manager: result.manager,
          feedbackData: cleanedData, // Використовуємо очищені дані
          managerTelegramChatId: result.managerTelegramChatId
        };
        
        console.log('📋 Дані для Telegram:', telegramData);

        try {
          const telegramResult = await telegramService.sendFeedbackNotification(telegramData);
          console.log('✅ Telegram повідомлення відправлено:', telegramResult);
        } catch (telegramError) {
          console.warn('⚠️ Помилка відправки Telegram повідомлення:', telegramError);
          // Не блокуємо успіх форми через помилку Telegram
        }
      } else {
        console.log('⚠️ Telegram повідомлення не відправлено. Причини:');
        console.log('  - Telegram enabled:', telegramService.isEnabled());
        console.log('  - Manager exists:', !!result.manager);
        console.log('  - Chat ID exists:', !!result.managerTelegramChatId);
      }

      setSubmitResult({ success: true, message: 'Дякуємо за звернення! Ми зв\'яжемось з вами найближчим часом.' });
      setFormData({ name: '', phone: '', email: '', message: '' });

      // Автоматично приховуємо повідомлення через 5 секунд
      setTimeout(() => {
        setSubmitResult(null);
      }, 5000);

    } catch (error) {
      console.error('❌ Помилка відправки повідомлення:', error);
      setSubmitResult({ 
        success: false, 
        message: 'Виникла помилка при відправці повідомлення. Спробуйте ще раз або зателефонуйте нам.' 
      });

      // Автоматично приховуємо повідомлення про помилку через 8 секунд
      setTimeout(() => {
        setSubmitResult(null);
      }, 8000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Очищаємо помилку для поля при зміні
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

  // Обробка email з валідацією
  const handleEmailInput = (e) => {
    const { value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      email: value
    }));
    
    // Перевіряємо валідність email і очищаємо помилку якщо він став валідним
    if (value) {
      const validation = ValidationUtils.validateEmail(value);
      if (validation.isValid && errors.email) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.email;
          return newErrors;
        });
      }
    } else {
      // Якщо поле очищене, видаляємо помилку (email необов'язковий)
      if (errors.email) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.email;
          return newErrors;
        });
      }
    }
  };

  return (
    <div className="contacts-page">
      <section className="section">
        <div className="container">
          <h1 className="section-title">Контакти</h1>
          
          <div className="grid grid-2" style={{gap: '3rem'}}>
            {/* Contact Information */}
            <div>
              <div className="contact-section" style={{marginBottom: '2rem'}}>
                <h3>Відділ продажів</h3>
                <div style={{marginBottom: '1rem'}}>
                  <strong>Адреса:</strong>
                  <p>м. Київ, Харківське шосе, 17-А</p>
                </div>
                <div style={{marginBottom: '1rem'}}>
                  <strong>Телефони:</strong>
                  <p>
                    <a href="tel:+380739272700" style={{color: '#008080', textDecoration: 'none'}}>
                      073 927 27 00
                    </a>
                  </p>
                  <p>
                    <a href="tel:+380445274700" style={{color: '#008080', textDecoration: 'none'}}>
                      044 527 47 00
                    </a>
                  </p>
                </div>
                <div>
                  <strong>Email:</strong>
                  <p>
                    <a href="mailto:sales.maxigran@gmail.com" style={{color: '#008080', textDecoration: 'none'}}>
                      sales@comspec.ua
                    </a>
                  </p>
                </div>
              </div>

              <div className="contact-section">
                <h3>Загальні контакти</h3>
                <div style={{marginBottom: '1rem'}}>
                  <strong>Головний офіс:</strong>
                  <p>02090, м. Київ, Харківське шосе, 17-А, оф. 3</p>
                </div>
                <div style={{marginBottom: '1rem'}}>
                  <strong>Телефон:</strong>
                  <p>
                    <a href="tel:+380445274700" style={{color: '#008080', textDecoration: 'none'}}>
                      044 527 47 00
                    </a>
                  </p>
                </div>
                <div>
                  <strong>Email:</strong>
                  <p>
                    <a href="mailto:comspec@comspec.ua" style={{color: '#008080', textDecoration: 'none'}}>
                      comspec@comspec.ua
                    </a>
                  </p>
                </div>
              </div>

              <div className="messengers" style={{marginTop: '2rem'}}>
                <h4>Месенджери</h4>
                <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
                  <a 
                    href="viber://chat?number=+380739272700" 
                    className="btn btn-primary"
                    style={{textDecoration: 'none'}}
                  >
                    Viber
                  </a>
                  <a 
                    href="https://t.me/comspec_ua" 
                    className="btn btn-primary"
                    style={{textDecoration: 'none'}}
                  >
                    Telegram
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h3>Форма зворотного зв'язку</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Ім'я *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleNameInput}
                    required
                    style={{
                      borderColor: (errors.name || errors.nameWarning) ? '#dc3545' : undefined
                    }}
                  />
                  {errors.name && (
                    <div style={{color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem'}}>
                      {errors.name}
                    </div>
                  )}
                  {errors.nameWarning && (
                    <div style={{color: '#f39c12', fontSize: '0.875rem', marginTop: '0.25rem'}}>
                      {errors.nameWarning}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Телефон *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handlePhoneInput}
                    placeholder="+380"
                    required
                    style={{
                      borderColor: errors.phone ? '#dc3545' : undefined
                    }}
                  />
                  {errors.phone && (
                    <div style={{color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem'}}>
                      {errors.phone}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleEmailInput}
                    style={{
                      borderColor: errors.email ? '#dc3545' : undefined
                    }}
                  />
                  {errors.email && (
                    <div style={{color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem'}}>
                      {errors.email}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="message">Повідомлення *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Введіть ваше повідомлення..."
                    required
                    rows="5"
                    style={{
                      borderColor: errors.message ? '#dc3545' : undefined
                    }}
                  />
                  {errors.message && (
                    <div style={{color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem'}}>
                      {errors.message}
                    </div>
                  )}
                </div>

                <button 
                  type="submit" 
                  className="btn btn-accent"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Відправляється...' : 'Надіслати'}
                </button>
                
                {/* Повідомлення про результат відправки */}
                {submitResult && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    borderRadius: '8px',
                    backgroundColor: submitResult.success ? '#d4edda' : '#f8d7da',
                    color: submitResult.success ? '#155724' : '#721c24',
                    border: `1px solid ${submitResult.success ? '#c3e6cb' : '#f5c6cb'}`
                  }}>
                    {submitResult.message}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator Section */}
      <section id="calculator" className="section gray">
        <div className="container">
          <h2 className="section-title">Калькулятор вартості</h2>
          <div className="calculator" style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <div className="grid grid-2">
              <div className="form-group">
                <label>Тип продукції</label>
                <select>
                  <option>Щебінь гранітний 5-20</option>
                  <option>Щебінь гранітний 20-40</option>
                  <option>Пісок річковий</option>
                  <option>Асфальт гарячий</option>
                  <option>Бетон М200</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Кількість (тонн/м³)</label>
                <input type="number" placeholder="10" />
              </div>
              
              <div className="form-group">
                <label>Відстань доставки (км)</label>
                <input type="number" placeholder="50" />
              </div>
              
              <div className="form-group">
                <label>Спосіб доставки</label>
                <select>
                  <option>Автотранспорт</option>
                  <option>Залізниця</option>
                </select>
              </div>
            </div>
            
            <div style={{textAlign: 'center', marginTop: '1.5rem'}}>
              <button className="btn btn-primary">Розрахувати вартість</button>
            </div>
            
            <div className="calculation-result" style={{
              marginTop: '1.5rem',
              padding: '1rem',
              background: '#f8f9fa',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h4>Орієнтовна вартість: 45 000 грн</h4>
              <p style={{color: '#6c757d', fontSize: '0.875rem'}}>
                *Остаточна вартість може відрізнятися залежно від додаткових умов
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contacts;