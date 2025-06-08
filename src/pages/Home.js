import React from 'react';
import { Link } from 'react-router-dom';

// Імпорт зображень з src/assets для секції Продукція
import gravelIcon from '../assets/icons/gravel.png';
import sandIcon from '../assets/icons/sand.png';
import asphaltIcon from '../assets/icons/asphalt.png';
import concreteIcon from '../assets/icons/concrete.png';

// Імпорт зображень для секції Переваги
import expertiseIcon from '../assets/icons/expertise.png';
import qualityIcon from '../assets/icons/quality.png';
import priceIcon from '../assets/icons/price.png';
import deliveryIcon from '../assets/icons/delivery.png';

const Home = () => {
  const products = [
    {
      title: 'Щебінь',
      description: 'Високоякісний щебінь різних фракцій для будівництва',
      icon: gravelIcon,
      category: 'gravel'
    },
    {
      title: 'Пісок',
      description: 'Річковий та кар\'єрний та пісок для різних видів робіт',
      icon: sandIcon,
      category: 'sand'
    },
    {
      title: 'Асфальт',
      description: 'Асфальтобетонні суміші для дорожнього покриття',
      icon: asphaltIcon,
      category: 'asphalt'
    },
    {
      title: 'Бетон',
      description: 'Готові бетонні суміші різних марок міцності',
      icon: concreteIcon,
      category: 'concrete'
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
      icon: expertiseIcon
    },
    {
      title: 'Гарантія якості',
      description: 'Вся продукція сертифікована та відповідає стандартам',
      icon: qualityIcon
    },
    {
      title: 'Прозорі ціни',
      description: 'Чесне ціноутворення без прихованих платежів',
      icon: priceIcon
    },
    {
      title: 'Швидка доставка',
      description: 'Оперативна доставка в зручний для вас час',
      icon: deliveryIcon
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
      <section className="section products-section">
        <div className="container">
          <h2 className="section-title">Наша продукція</h2>
          <div className="grid grid-4">
            {products.map((product, index) => (
              <div key={index} className="card">
                {/* Клікабельна іконка тільки для продукції */}
                <Link to={`/products?category=${product.category}`}>
                  <img 
                    src={product.icon} 
                    alt={product.title}
                    className="card-icon clickable-icon"
                  />
                </Link>
                
                {/* Клікабельна назва тільки для продукції */}
                <Link 
                  to={`/products?category=${product.category}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <h3 className="clickable-title" style={{ cursor: 'pointer' }}>
                    {product.title}
                  </h3>
                </Link>
                
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
                <img 
                  src={benefit.icon} 
                  alt={benefit.title}
                  className="card-icon"
                />
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