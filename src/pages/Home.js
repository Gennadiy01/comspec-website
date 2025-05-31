import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const products = [
    {
      title: 'Щебінь',
      description: 'Високоякісний щебінь різних фракцій для будівництва',
      icon: (
        <svg className="card-icon" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M2 7L12 12L22 7" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M12 22V12" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      )
    },
    {
      title: 'Пісок',
      description: 'Карьерний та річковий пісок для різних видів робіт',
      icon: (
        <svg className="card-icon" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="6" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="18" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="6" cy="16" r="2" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="18" cy="16" r="2" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      )
    },
    {
      title: 'Асфальт',
      description: 'Асфальтобетонні суміші для дорожнього покриття',
      icon: (
        <svg className="card-icon" viewBox="0 0 24 24" fill="none">
          <path d="M3 12H21" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M3 8H21" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M3 16H21" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="7" cy="12" r="1" fill="currentColor"/>
          <circle cx="17" cy="8" r="1" fill="currentColor"/>
          <circle cx="12" cy="16" r="1" fill="currentColor"/>
        </svg>
      )
    },
    {
      title: 'Бетон',
      description: 'Готові бетонні суміші різних марок міцності',
      icon: (
        <svg className="card-icon" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M9 9H15V15H9V9Z" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M3 9H9" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M15 9H21" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M9 3V9" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M15 3V9" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      )
    }
  ];

  const services = [
    {
      title: 'Доставка',
      description: 'Власним автотранспортом та залізничними вагонами'
    },
    {
      title: 'Розробка родовищ',
      description: 'Повний цикл розробки кар\'єрів та видобутку'
    },
    {
      title: 'Оренда спецтехніки',
      description: 'Сучасна техніка для будівельних робіт'
    }
  ];

  const benefits = [
    {
      title: 'Експертиза для Вашого успіху',
      description: 'Багаторічний досвід у галузі видобутку та постачання',
      icon: (
        <svg className="card-icon" viewBox="0 0 24 24" fill="none">
          <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      )
    },
    {
      title: 'Гарантія якості',
      description: 'Вся продукція сертифікована та відповідає стандартам',
      icon: (
        <svg className="card-icon" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L3 7V13C3 17 12 22 12 22S21 17 21 13V7L12 2Z" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      )
    },
    {
      title: 'Прозорі ціни',
      description: 'Чесне ціноутворення без прихованих платежів',
      icon: (
        <svg className="card-icon" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M19.4 15A7.5 7.5 0 0 0 15 19.4" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M4.6 9A7.5 7.5 0 0 1 9 4.6" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      )
    },
    {
      title: 'Швидка доставка',
      description: 'Оперативна доставка в зручний для вас час',
      icon: (
        <svg className="card-icon" viewBox="0 0 24 24" fill="none">
          <path d="M16 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H16C17.1 21 18 20.1 18 19V5C18 3.9 17.1 3 16 3Z" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M21 7V17" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      )
    }
  ];

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1>Час будувати разом!</h1>
          <p>Високоякісні будівельні матеріали з доставкою по всій Україні</p>
          <div className="hero-buttons">
            <Link to="/contacts" className="btn btn-accent">Замовити</Link>
            <Link to="/products" className="btn btn-primary">Каталог</Link>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Основні продукти</h2>
          <div className="grid grid-4">
            {products.map((product, index) => (
              <div key={index} className="card">
                {product.icon}
                <h3>{product.title}</h3>
                <p>{product.description}</p>
                <Link to="/contacts" className="btn btn-accent">Замовити</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="section dark">
        <div className="container">
          <h2 className="section-title">Послуги</h2>
          <div className="grid grid-3">
            {services.map((service, index) => (
              <div key={index} className="card">
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
            ))}
          </div>
          <div style={{textAlign: 'center', marginTop: '2rem'}}>
            <Link to="/services" className="btn btn-primary">Дізнатись більше</Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Переваги</h2>
          <div className="grid grid-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="card">
                {benefit.icon}
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Segments Section */}
      <section className="section gray">
        <div className="container">
          <h2 className="section-title">Пропозиції</h2>
          <div className="grid grid-2">
            <div className="card">
              <h3>Для компаній</h3>
              <ul>
                <li>Оптові ціни</li>
                <li>Індивідуальні умови</li>
                <li>Постійна підтримка</li>
                <li>Гнучка система оплати</li>
              </ul>
              <Link to="/contacts" className="btn btn-primary">Отримати пропозицію</Link>
            </div>
            <div className="card">
              <h3>Для приватних осіб</h3>
              <ul>
                <li>Роздрібні майданчики</li>
                <li>Зручне розташування</li>
                <li>Доступні ціни</li>
                <li>Консультації фахівців</li>
              </ul>
              <Link to="/retail-locations" className="btn btn-primary">Знайти майданчик</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Відгуки клієнтів</h2>
          <div className="grid grid-3">
            <div className="card">
              <h3>ТОВ "БудІнвест"</h3>
              <p>"Співпрацюємо з COMSPEC вже 3 роки. Завжди якісна продукція та своєчасна доставка."</p>
            </div>
            <div className="card">
              <h3>Приватний підрядник</h3>
              <p>"Відмінна якість щебню, використовую для фундаментних робіт. Рекомендую!"</p>
            </div>
            <div className="card">
              <h3>ПрАТ "Дорожник"</h3>
              <p>"Професійний підхід та конкурентні ціни. Надійний партнер для великих проектів."</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;