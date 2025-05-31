import React from 'react';
import { Link } from 'react-router-dom';

const RetailLocations = () => {
  const locations = [
    {
      id: 'abz',
      name: 'АБЗ (Асфальтобетонний завод)',
      address: 'м. Київ, вул. Промислова, 25',
      phone: '+380 44 123-45-67',
      email: 'abz@comspec.ua',
      workingHours: 'Пн-Пт: 8:00-18:00, Сб: 9:00-15:00',
      coordinates: { lat: 50.4501, lng: 30.5234 },
      products: [
        'Асфальтобетонні суміші',
        'Щебінь всіх фракцій',
        'Пісок кар\'єрний та річковий',
        'Мінеральний порошок'
      ],
      services: [
        'Виробництво асфальту на замовлення',
        'Лабораторні випробування',
        'Консультації спеціалістів',
        'Доставка власним транспортом'
      ],
      features: [
        'Власна лабораторія',
        'Сучасне обладнання',
        'Контроль якості',
        'Швидке обслуговування'
      ]
    },
    {
      id: 'boryspil',
      name: 'Роздрібний майданчик "Бориспіль"',
      address: 'м. Бориспіль, вул. Київський шлях, 15А',
      phone: '+380 44 234-56-78',
      email: 'boryspil@comspec.ua',
      workingHours: 'Пн-Сб: 8:00-17:00, Нд: 9:00-14:00',
      coordinates: { lat: 50.3505, lng: 30.9503 },
      products: [
        'Щебінь гранітний та вапняковий',
        'Пісок річковий митий',
        'Цемент М400, М500',
        'Бетонні суміші'
      ],
      services: [
        'Розфасовка в мішки',
        'Навантаження автотранспорту',
        'Зважування на автовагах',
        'Видача сертифікатів'
      ],
      features: [
        'Зручне розташування',
        'Автоваги 60 тонн',
        'Великий асортимент',
        'Конкурентні ціни'
      ]
    },
    {
      id: 'irpin',
      name: 'Склад-магазин "Ірпінь"',
      address: 'м. Ірпінь, вул. Будівельників, 8',
      phone: '+380 44 345-67-89',
      email: 'irpin@comspec.ua',
      workingHours: 'Пн-Пт: 8:00-18:00, Сб: 9:00-16:00',
      coordinates: { lat: 50.5218, lng: 30.2566 },
      products: [
        'Щебінь декоративний',
        'Пісок кварцовий',
        'Керамзит',
        'Будівельні суміші сухі'
      ],
      services: [
        'Роздрібна торгівля',
        'Консультації по застосуванню',
        'Малотоннажна доставка',
        'Самовивіз'
      ],
      features: [
        'Робота з приватними особами',
        'Невеликі партії',
        'Індивідуальний підхід',
        'Професійні консультації'
      ]
    }
  ];

  return (
    <div className="retail-locations-page">
      {/* Hero Section */}
      <section className="hero" style={{padding: '4rem 0'}}>
        <div className="container">
          <h1>Роздрібні майданчики</h1>
          <p>Зручні точки продажу для роздрібних покупців та невеликих партій</p>
        </div>
      </section>

      {/* Locations */}
      <section className="section">
        <div className="container">
          {locations.map((location, index) => (
            <div key={location.id} className="location-card" style={{
              marginBottom: '3rem',
              padding: '2rem',
              background: index % 2 === 0 ? '#fff' : '#f8f9fa',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
              <div className="grid grid-2" style={{gap: '3rem', alignItems: 'start'}}>
                {/* Location Info */}
                <div>
                  <h2 style={{marginBottom: '1rem', color: '#008080'}}>{location.name}</h2>
                  
                  <div className="contact-info" style={{marginBottom: '2rem'}}>
                    <div style={{marginBottom: '0.5rem'}}>
                      <strong>📍 Адреса:</strong> {location.address}
                    </div>
                    <div style={{marginBottom: '0.5rem'}}>
                      <strong>📞 Телефон:</strong> 
                      <a href={`tel:${location.phone.replace(/\s/g, '')}`} style={{color: '#008080', textDecoration: 'none', marginLeft: '0.5rem'}}>
                        {location.phone}
                      </a>
                    </div>
                    <div style={{marginBottom: '0.5rem'}}>
                      <strong>✉️ Email:</strong> 
                      <a href={`mailto:${location.email}`} style={{color: '#008080', textDecoration: 'none', marginLeft: '0.5rem'}}>
                        {location.email}
                      </a>
                    </div>
                    <div>
                      <strong>🕒 Графік роботи:</strong> {location.workingHours}
                    </div>
                  </div>

                  <div className="products-services" style={{marginBottom: '2rem'}}>
                    <div style={{marginBottom: '1.5rem'}}>
                      <h4>📦 Продукція:</h4>
                      <ul>
                        {location.products.map((product, idx) => (
                          <li key={idx}>{product}</li>
                        ))}
                      </ul>
                    </div>

                    <div style={{marginBottom: '1.5rem'}}>
                      <h4>🔧 Послуги:</h4>
                      <ul>
                        {location.services.map((service, idx) => (
                          <li key={idx}>{service}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="actions" style={{display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
                    <a href={`tel:${location.phone.replace(/\s/g, '')}`} className="btn btn-accent">
                      Зателефонувати
                    </a>
                    <Link to="/contacts" className="btn btn-primary">
                      Написати
                    </Link>
                    <a 
                      href={`https://maps.google.com/?q=${location.coordinates.lat},${location.coordinates.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                    >
                      Маршрут
                    </a>
                  </div>
                </div>

                {/* Map and Features */}
                <div>
                  {/* Map Placeholder */}
                  <div style={{
                    height: '250px',
                    backgroundColor: '#e9ecef',
                    borderRadius: '8px',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#6c757d',
                    position: 'relative'
                  }}>
                    <div style={{textAlign: 'center'}}>
                      <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>🗺️</div>
                      <div>Інтерактивна карта</div>
                      <div style={{fontSize: '0.875rem'}}>{location.address}</div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="features">
                    <h4 style={{marginBottom: '1rem'}}>⭐ Особливості:</h4>
                    <div className="features-grid" style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                      gap: '0.5rem'
                    }}>
                      {location.features.map((feature, idx) => (
                        <div key={idx} style={{
                          padding: '0.5rem',
                          background: 'rgba(0,128,128,0.1)',
                          borderRadius: '6px',
                          textAlign: 'center',
                          fontSize: '0.875rem',
                          color: '#008080'
                        }}>
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* General Info */}
      <section className="section dark">
        <div className="container">
          <h2 className="section-title">Загальна інформація</h2>
          <div className="grid grid-3">
            <div className="info-card" style={{
              padding: '2rem',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{fontSize: '3rem', marginBottom: '1rem'}}>💳</div>
              <h3>Способи оплати</h3>
              <ul style={{textAlign: 'left', marginTop: '1rem'}}>
                <li>Готівковий розрахунок</li>
                <li>Банківський переказ</li>
                <li>Картка (Visa, MasterCard)</li>
                <li>Розрахунок для ФОП</li>
              </ul>
            </div>

            <div className="info-card" style={{
              padding: '2rem',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{fontSize: '3rem', marginBottom: '1rem'}}>🚚</div>
              <h3>Доставка</h3>
              <ul style={{textAlign: 'left', marginTop: '1rem'}}>
                <li>Самовивіз безкоштовно</li>
                <li>Доставка по Києву від 500 грн</li>
                <li>Доставка по області від 15 грн/км</li>
                <li>Точне дозування за об'ємом</li>
              </ul>
            </div>

            <div className="info-card" style={{
              padding: '2rem',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{fontSize: '3rem', marginBottom: '1rem'}}>📋</div>
              <h3>Документи</h3>
              <ul style={{textAlign: 'left', marginTop: '1rem'}}>
                <li>Сертифікати якості</li>
                <li>Протоколи випробувань</li>
                <li>Паспорти якості</li>
                <li>Накладні та рахунки</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Часті питання</h2>
          <div className="faq-list" style={{maxWidth: '800px', margin: '0 auto'}}>
            <div className="faq-item" style={{marginBottom: '1.5rem', padding: '1.5rem', background: '#f8f9fa', borderRadius: '8px'}}>
              <h4>Чи можна купити невелику кількість матеріалу?</h4>
              <p>Так, ми працюємо як з великими, так і з малими партіями. Мінімальна кількість залежить від типу матеріалу.</p>
            </div>

            <div className="faq-item" style={{marginBottom: '1.5rem', padding: '1.5rem', background: '#f8f9fa', borderRadius: '8px'}}>
              <h4>Які документи потрібні для покупки?</h4>
              <p>Для приватних осіб - документ, що посвідчує особу. Для ФОП та юридичних осіб - відповідні документи.</p>
            </div>

            <div className="faq-item" style={{marginBottom: '1.5rem', padding: '1.5rem', background: '#f8f9fa', borderRadius: '8px'}}>
              <h4>Чи надається гарантія на матеріали?</h4>
              <p>Всі матеріали відповідають державним стандартам. Надаємо сертифікати якості та гарантію відповідності.</p>
            </div>

            <div className="faq-item" style={{padding: '1.5rem', background: '#f8f9fa', borderRadius: '8px'}}>
              <h4>Як швидко можна отримати матеріал?</h4>
              <p>При наявності на складі - в день звернення. При виробництві на замовлення - 1-3 робочі дні.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="section gray">
        <div className="container" style={{textAlign: 'center'}}>
          <h2>Не знайшли потрібний майданчик?</h2>
          <p style={{marginBottom: '2rem', color: '#6c757d'}}>
            Зв'яжіться з нами, і ми допоможемо знайти найближчий пункт продажу або організуємо доставку
          </p>
          <div style={{display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap'}}>
            <Link to="/contacts" className="btn btn-accent">Зв'язатися з нами</Link>
            <a href="tel:+380739272700" className="btn btn-primary">073 927 27 00</a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RetailLocations;