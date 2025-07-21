import React from 'react';
import { useOrderModal } from '../context/OrderModalContext';
import useComspecSearch from '../hooks/useSearchNavigation'; // ✅ Імпорт хука

const Services = () => {
  const { openOrderModal } = useOrderModal();
  
  // ✅ ПРАВИЛЬНО: Хук викликається ВСЕРЕДИНІ компонента
  const { search, highlight, clearHighlights } = useComspecSearch();

  // Функція для відкриття модального вікна з консультацією
  const handleConsultationClick = (serviceType) => {
    openOrderModal({
      source: 'services-page',
      serviceType: serviceType // передаємо тип послуги для аналітики
    });
  };

  const deliveryServices = [
    {
      title: 'Доставка залізницею',
      description: 'Економна доставка великих партій залізничними вагонами по всій Україні',
      features: [
        'Великі об\'єми (від 50 тонн)',
        'Економна ціна',
        'Доставка в будь-який регіон',
        'Надійність транспортування'
      ],
      image: '/images/railway-delivery.jpg'
    },
    {
      title: 'Доставка автотранспортом',
      description: 'Швидка та гнучка доставка власним автопарком',
      features: [
        'Оперативна доставка',
        'Гнучкий графік',
        'Точне дозування',
        'Доставка на об\'єкт'
      ],
      image: '/images/truck-delivery.jpg'
    }
  ];

  const equipmentServices = [
    {
      title: 'Буріння',
      description: 'Професійне буріння свердловин різного призначення',
      equipment: 'Бурові установки СБУ-125, УРБ-2А2',
      image: '/images/drilling.jpg'
    },
    {
      title: 'Екскавація',
      description: 'Земляні роботи та розробка котлованів',
      equipment: 'Екскаватори Caterpillar, Komatsu',
      image: '/images/excavation.jpg'
    },
    {
      title: 'Навантаження',
      description: 'Навантаження матеріалів на транспорт',
      equipment: 'Навантажувачі CAT, JCB',
      image: '/images/loading.jpg'
    },
    {
      title: 'Дроблення',
      description: 'Дроблення каменю та виробництво щебню',
      equipment: 'Дробильні комплекси Sandvik',
      image: '/images/crushing.jpg'
    }
  ];

  const miningServices = [
    {
      title: 'Маркшейдерські роботи',
      description: 'Топографічні зйомки та планування робіт',
      includes: [
        'Топографічна зйомка',
        'Підрахунок запасів',
        'Планування робіт',
        'Контроль якості'
      ],
      image: '/images/surveying.jpg'
    },
    {
      title: 'Бурові роботи',
      description: 'Буріння розвідувальних та підривних свердловин',
      includes: [
        'Розвідувальне буріння',
        'Підривні свердловини',
        'Інженерно-геологічні дослідження',
        'Контроль якості робіт'
      ],
      image: '/images/boring.jpg'
    },
    {
      title: 'Вибухові роботи',
      description: 'Професійне проведення підривних робіт',
      includes: [
        'Проектування підривів',
        'Підготовка зарядів',
        'Проведення підриву',
        'Забезпечення безпеки'
      ],
      image: '/images/blasting.jpg'
    }
  ];

  return (
    <div className="services-page">
      {/* Hero Section */}
      <section className="hero" style={{padding: '4rem 0'}}>
        <div className="container">
          <h1>Послуги COMSPEC</h1>
          <p>Повний спектр послуг від видобутку до доставки будівельних матеріалів</p>
        </div>
      </section>

      {/* Delivery Services */}
      <section className="section" id="delivery-services">
        <div className="container">
          <h2 className="section-title">Доставка</h2>
          <div className="grid grid-2">
            {deliveryServices.map((service, index) => (
              <div key={index} className="card" id={`delivery-service-${index}`}>
                <div style={{
                  height: '200px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6c757d'
                }}>
                  Фото послуги
                </div>
                
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                
                <h4>Переваги:</h4>
                <ul style={{marginBottom: '1.5rem'}}>
                  {service.features.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
                
                <button 
                  className="btn btn-accent"
                  onClick={() => handleConsultationClick('delivery')}
                >
                  Замовити консультацію
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Equipment Rental */}
      <section className="section dark" id="equipment-services">
        <div className="container">
          <h2 className="section-title">Оренда спецтехніки</h2>
          <div className="grid grid-4">
            {equipmentServices.map((service, index) => (
              <div key={index} className="card" id={`equipment-service-${index}`}>
                <div style={{
                  height: '150px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6c757d'
                }}>
                  Фото техніки
                </div>
                
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <p><strong>Обладнання:</strong> {service.equipment}</p>
                
                <button 
                  className="btn btn-accent"
                  onClick={() => handleConsultationClick('equipment')}
                >
                  Замовити консультацію
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mining Services */}
      <section className="section" id="mining-services">
        <div className="container">
          <h2 className="section-title">Розробка родовищ</h2>
          <div className="grid grid-3">
            {miningServices.map((service, index) => (
              <div key={index} className="card" id={`mining-service-${index}`}>
                <div style={{
                  height: '180px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6c757d'
                }}>
                  Фото робіт
                </div>
                
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                
                <h4>Включає:</h4>
                <ul style={{marginBottom: '1.5rem'}}>
                  {service.includes.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
                
                <button 
                  className="btn btn-accent"
                  onClick={() => handleConsultationClick('mining')}
                >
                  Замовити консультацію
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Info */}
      <section className="section gray" id="additional-services">
        <div className="container">
          <div className="grid grid-2">
            <div>
              <h3>Чому обирають наші послуги?</h3>
              <ul>
                <li>✓ Власний парк сучасної техніки</li>
                <li>✓ Кваліфіковані спеціалісти</li>
                <li>✓ Дотримання термінів</li>
                <li>✓ Конкурентні ціни</li>
                <li>✓ Повний пакет документів</li>
                <li>✓ Гарантія якості робіт</li>
              </ul>
            </div>
            
            <div>
              <h3>Додаткові послуги</h3>
              <ul>
                <li>- Консультації спеціалістів</li>
                <li>- Розрахунок потреби в матеріалах</li>
                <li>- Логістичне планування</li>
                <li>- Оформлення документації</li>
                <li>- Контроль якості</li>
                <li>- Технічна підтримка</li>
              </ul>
            </div>
          </div>
          
          <div style={{textAlign: 'center', marginTop: '2rem'}}>
            <button 
              className="btn btn-primary"
              onClick={() => handleConsultationClick('general')}
            >
              Отримати консультацію
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Services;