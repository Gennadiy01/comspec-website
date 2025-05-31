import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  const partners = [
    { name: 'ПАТ "Київавтодор"', logo: '/images/partners/kyivavtodor.png' },
    { name: 'ТОВ "БудІнвест"', logo: '/images/partners/budinvest.png' },
    { name: 'ПрАТ "Дорожник"', logo: '/images/partners/dorozhnik.png' },
    { name: 'КП "Київдорсервіс"', logo: '/images/partners/kyivdorservice.png' },
    { name: 'ТОВ "МегаБуд"', logo: '/images/partners/megabud.png' },
    { name: 'ПАТ "УкрГідроБуд"', logo: '/images/partners/ukrhydrobud.png' }
  ];

  const projects = [
    {
      title: 'Реконструкція траси Київ-Одеса',
      description: 'Постачання 15000 тонн щебню для реконструкції автомобільної траси',
      year: '2023',
      materials: ['Щебінь гранітний 5-20', 'Щебінь гранітний 20-40'],
      image: '/images/projects/kyiv-odesa.jpg'
    },
    {
      title: 'Будівництво ЖК "Сонячний"',
      description: 'Комплексне постачання будівельних матеріалів для житлового комплексу',
      year: '2023',
      materials: ['Бетон М200-М400', 'Пісок річковий', 'Щебінь'],
      image: '/images/projects/sunny-complex.jpg'
    },
    {
      title: 'Розширення аеропорту Бориспіль',
      description: 'Постачання матеріалів для будівництва нової злітно-посадкової смуги',
      year: '2022',
      materials: ['Асфальт', 'Щебінь спеціальний', 'Пісок кварцовий'],
      image: '/images/projects/boryspil-airport.jpg'
    },
    {
      title: 'Міст через Дніпро',
      description: 'Виробництво спеціального високоміцного бетону для мостових конструкцій',
      year: '2022',
      materials: ['Бетон М500', 'Щебінь гранітний', 'Добавки спеціальні'],
      image: '/images/projects/dnipro-bridge.jpg'
    }
  ];

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="hero" style={{padding: '4rem 0'}}>
        <div className="container">
          <h1>Про компанію COMSPEC</h1>
          <p>Надійний партнер у сфері виробництва та постачання будівельних матеріалів з 1995 року</p>
        </div>
      </section>

      {/* Mission and Values */}
      <section className="section">
        <div className="container">
          <div className="grid grid-2" style={{gap: '3rem'}}>
            <div>
              <h2>Місія компанії</h2>
              <p>
                Наша місія полягає у забезпеченні будівельної галузі України високоякісними 
                матеріалами, що відповідають найсуворішим стандартам якості та екологічної безпеки. 
                Ми прагнемо бути надійним партнером для наших клієнтів, забезпечуючи стабільні 
                поставки та професійний сервіс.
              </p>
              
              <h3>Наші цінності</h3>
              <ul>
                <li><strong>Якість</strong> - використання сучасних технологій та контроль на всіх етапах</li>
                <li><strong>Надійність</strong> - дотримання зобов'язань та термінів поставок</li>
                <li><strong>Інновації</strong> - впровадження передових рішень у виробництві</li>
                <li><strong>Відповідальність</strong> - турбота про довкілля та безпеку</li>
                <li><strong>Партнерство</strong> - довготривалі взаємовигідні відносини</li>
              </ul>
            </div>
            
            <div>
              <h2>Наші досягнення</h2>
              <div className="achievements" style={{display: 'grid', gap: '1rem'}}>
                <div className="achievement-item" style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1rem',
                  background: '#f8f9fa',
                  borderRadius: '8px'
                }}>
                  <div style={{fontSize: '2rem', marginRight: '1rem'}}>🏆</div>
                  <div>
                    <h4>28+ років досвіду</h4>
                    <p>Успішна робота на ринку з 1995 року</p>
                  </div>
                </div>
                
                <div className="achievement-item" style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1rem',
                  background: '#f8f9fa',
                  borderRadius: '8px'
                }}>
                  <div style={{fontSize: '2rem', marginRight: '1rem'}}>🏭</div>
                  <div>
                    <h4>5 виробничих майданчиків</h4>
                    <p>Власні кар'єри та виробничі потужності</p>
                  </div>
                </div>
                
                <div className="achievement-item" style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1rem',
                  background: '#f8f9fa',
                  borderRadius: '8px'
                }}>
                  <div style={{fontSize: '2rem', marginRight: '1rem'}}>🚛</div>
                  <div>
                    <h4>50+ одиниць техніки</h4>
                    <p>Власний автопарк для оперативної доставки</p>
                  </div>
                </div>
                
                <div className="achievement-item" style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1rem',
                  background: '#f8f9fa',
                  borderRadius: '8px'
                }}>
                  <div style={{fontSize: '2rem', marginRight: '1rem'}}>👥</div>
                  <div>
                    <h4>200+ задоволених клієнтів</h4>
                    <p>Довіра провідних будівельних компаній</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* History */}
      <section className="section dark">
        <div className="container">
          <h2 className="section-title">Історія компанії</h2>
          <div className="timeline" style={{maxWidth: '800px', margin: '0 auto'}}>
            <div className="timeline-item" style={{marginBottom: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px'}}>
              <h3>1995 - Заснування</h3>
              <p>
                Компанія COMSPEC була заснована як невелике підприємство з видобутку щебню. 
                Початковий капітал склав 50 тисяч доларів, а команда - 15 осіб.
              </p>
            </div>
            
            <div className="timeline-item" style={{marginBottom: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px'}}>
              <h3>2001 - Розширення виробництва</h3>
              <p>
                Придбання нових кар'єрів та сучасного обладнання. Початок виробництва 
                асфальтобетонних сумішей та товарного бетону.
              </p>
            </div>
            
            <div className="timeline-item" style={{marginBottom: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px'}}>
              <h3>2008 - Сертифікація</h3>
              <p>
                Отримання міжнародних сертифікатів якості ISO 9001:2008. 
                Впровадження систем контролю якості на всіх етапах виробництва.
              </p>
            </div>
            
            <div className="timeline-item" style={{marginBottom: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px'}}>
              <h3>2015 - Модернізація</h3>
              <p>
                Повна модернізація виробництва, впровадження екологічно чистих технологій 
                та автоматизація процесів.
              </p>
            </div>
            
            <div className="timeline-item" style={{padding: '1.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px'}}>
              <h3>2020-сьогодні - Цифровізація</h3>
              <p>
                Впровадження цифрових технологій, онлайн-сервісів для клієнтів та 
                системи відстеження якості в реальному часі.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Наші партнери</h2>
          <p style={{textAlign: 'center', marginBottom: '3rem', color: '#6c757d'}}>
            Ми пишаємося довготривалою співпрацею з провідними компаніями України
          </p>
          
          <div className="partners-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            alignItems: 'center'
          }}>
            {partners.map((partner, index) => (
              <div key={index} className="partner-logo" style={{
                padding: '1.5rem',
                background: '#f8f9fa',
                borderRadius: '8px',
                textAlign: 'center',
                transition: 'transform 0.3s ease',
                cursor: 'pointer',
                border: '2px solid transparent'
              }}>
                <div style={{
                  height: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                  color: '#6c757d'
                }}>
                  Логотип
                </div>
                <h4 style={{fontSize: '1rem', color: '#333f4f'}}>{partner.name}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects */}
      <section className="section gray">
        <div className="container">
          <h2 className="section-title">Проекти</h2>
          <div className="grid grid-2">
            {projects.map((project, index) => (
              <div key={index} className="card">
                <div style={{
                  height: '200px',
                  backgroundColor: '#e9ecef',
                  borderRadius: '8px',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6c757d'
                }}>
                  Фото проекту
                </div>
                
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                  <h3>{project.title}</h3>
                  <span style={{
                    background: '#008080',
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.875rem'
                  }}>
                    {project.year}
                  </span>
                </div>
                
                <p>{project.description}</p>
                
                <h4>Використані матеріали:</h4>
                <ul>
                  {project.materials.map((material, idx) => (
                    <li key={idx}>{material}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section">
        <div className="container" style={{textAlign: 'center'}}>
          <h2>Готові стати частиною нашої історії успіху?</h2>
          <p style={{fontSize: '1.125rem', marginBottom: '2rem', color: '#6c757d'}}>
            Зв'яжіться з нами сьогодні та отримайте індивідуальну пропозицію для вашого проекту
          </p>
          <div style={{display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap'}}>
            <Link to="/contacts" className="btn btn-accent">Отримати пропозицію</Link>
            <Link to="/products" className="btn btn-primary">Переглянути продукцію</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;