import React, { useState } from 'react';

const Contacts = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Тут буде логіка відправки форми
    alert('Дякуємо за звернення! Ми зв\'яжемось з вами найближчим часом.');
    setFormData({ name: '', phone: '', email: '', message: '' });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
                  <p>м. Київ, вул. Промислова, 15</p>
                </div>
                <div style={{marginBottom: '1rem'}}>
                  <strong>Телефони:</strong>
                  <p>
                    <a href="tel:+380739272700" style={{color: '#008080', textDecoration: 'none'}}>
                      073 927 27 00
                    </a>
                  </p>
                  <p>
                    <a href="tel:+380671234567" style={{color: '#008080', textDecoration: 'none'}}>
                      067 123 45 67
                    </a>
                  </p>
                </div>
                <div>
                  <strong>Email:</strong>
                  <p>
                    <a href="mailto:sales@comspec.ua" style={{color: '#008080', textDecoration: 'none'}}>
                      sales@comspec.ua
                    </a>
                  </p>
                </div>
              </div>

              <div className="contact-section">
                <h3>Загальні контакти</h3>
                <div style={{marginBottom: '1rem'}}>
                  <strong>Головний офіс:</strong>
                  <p>м. Київ, пр. Перемоги, 89, оф. 12</p>
                </div>
                <div style={{marginBottom: '1rem'}}>
                  <strong>Телефон:</strong>
                  <p>
                    <a href="tel:+380441234567" style={{color: '#008080', textDecoration: 'none'}}>
                      (044) 123-45-67
                    </a>
                  </p>
                </div>
                <div>
                  <strong>Email:</strong>
                  <p>
                    <a href="mailto:info@comspec.ua" style={{color: '#008080', textDecoration: 'none'}}>
                      info@comspec.ua
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
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Телефон *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+380"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
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
                  />
                </div>

                <button type="submit" className="btn btn-accent">
                  Надіслати
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="section gray">
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