import React from 'react';
import { useParams, Link } from 'react-router-dom';

const Certificates = () => {
  const { category } = useParams();

  const categories = {
    gravel: {
      name: 'Щебінь',
      title: 'Сертифікати на щебінь гранітний',
      description: 'Всі види щебню COMSPEC сертифіковані згідно з діючими державними стандартами України'
    },
    sand: {
      name: 'Пісок',
      title: 'Сертифікати на пісок будівельний',
      description: 'Пісок річковий та кар\'єрний відповідає всім вимогам ДСТУ та технічним умовам'
    },
    asphalt: {
      name: 'Асфальт',
      title: 'Сертифікати на асфальтобетонні суміші',
      description: 'Асфальтобетонні суміші виробляються згідно ДСТУ Б В.2.7-119 та ТУ У 23.5-31323949'
    },
    concrete: {
      name: 'Бетон',
      title: 'Сертифікати на бетонні суміші',
      description: 'Товарний бетон виробляється відповідно до ДСТУ Б В.2.7-214 з контролем якості'
    }
  };

  const currentCategory = categories[category] || categories.gravel;

  const certificates = [
    {
      id: 1,
      title: 'Сертифікат відповідності ДСТУ',
      number: 'UA.TR.093.2018',
      validUntil: '15.08.2025',
      issuedBy: 'ДП "Український науково-дослідний інститут будівельних матеріалів"',
      products: ['Щебінь гранітний фракції 5-20 мм', 'Щебінь гранітний фракції 20-40 мм'],
      standards: ['ДСТУ Б В.2.7-75-98', 'ДСТУ Б В.2.7-71-98'],
      file: '/certificates/dstu-gravel-2024.pdf'
    },
    {
      id: 2,
      title: 'Протокол лабораторних випробувань',
      number: 'ПВ-2024-001',
      validUntil: '01.03.2025',
      issuedBy: 'Атестована лабораторія COMSPEC',
      products: ['Щебінь гранітний всіх фракцій'],
      standards: ['ДСТУ Б В.2.7-75-98'],
      file: '/certificates/lab-test-gravel-2024.pdf'
    },
    {
      id: 3,
      title: 'Санітарно-епідеміологічний висновок',
      number: 'СЕВ-2024-15',
      validUntil: '20.12.2025',
      issuedBy: 'Центр громадського здоров\'я МОЗ України',
      products: ['Продукція з природного каменю'],
      standards: ['ДСанПіН 2.2.7.029-99'],
      file: '/certificates/sanitary-conclusion-2024.pdf'
    },
    {
      id: 4,
      title: 'Сертифікат системи управління якістю',
      number: 'ISO 9001:2015',
      validUntil: '10.06.2026',
      issuedBy: 'TÜV SÜD Czech s.r.o.',
      products: ['Система управління якістю'],
      standards: ['ISO 9001:2015'],
      file: '/certificates/iso-9001-2024.pdf'
    }
  ];

  const relatedProducts = [
    { category: 'gravel', name: 'Щебінь', link: '/products?category=gravel' },
    { category: 'sand', name: 'Пісок', link: '/products?category=sand' },
    { category: 'asphalt', name: 'Асфальт', link: '/products?category=asphalt' },
    { category: 'concrete', name: 'Бетон', link: '/products?category=concrete' }
  ];

  const standards = [
    {
      code: 'ДСТУ Б В.2.7-75-98',
      title: 'Щебінь і гравій з природного каменю для будівельних робіт',
      description: 'Технічні умови на щебінь для дорожнього будівництва'
    },
    {
      code: 'ДСТУ Б В.2.7-71-98',
      title: 'Пісок для будівельних робіт',
      description: 'Технічні умови на будівельний пісок'
    },
    {
      code: 'ДСТУ Б В.2.7-119',
      title: 'Суміші асфальтобетонні дорожні',
      description: 'Технічні умови на асфальтобетонні суміші'
    },
    {
      code: 'ДСТУ Б В.2.7-214',
      title: 'Бетони. Загальні технічні умови',
      description: 'Вимоги до товарного бетону'
    }
  ];

  return (
    <div className="certificates-page">
      {/* Hero Section */}
      <section className="hero" style={{padding: '4rem 0'}}>
        <div className="container">
          <div style={{display: 'flex', alignItems: 'center', marginBottom: '1rem'}}>
            <Link to="/products" style={{color: 'rgba(255,255,255,0.7)', textDecoration: 'none', marginRight: '1rem'}}>
              Продукція
            </Link>
            <span style={{color: 'rgba(255,255,255,0.7)'}}>→</span>
            <span style={{marginLeft: '1rem'}}>{currentCategory.name}</span>
          </div>
          <h1>{currentCategory.title}</h1>
          <p>{currentCategory.description}</p>
        </div>
      </section>

      {/* Category Navigation */}
      <section className="section">
        <div className="container">
          <div className="category-nav" style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '3rem',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            {Object.entries(categories).map(([key, cat]) => (
              <Link
                key={key}
                to={`/certificates/${key}`}
                className={`btn ${category === key ? 'btn-primary' : 'btn-outline'}`}
                style={{textDecoration: 'none'}}
              >
                {cat.name}
              </Link>
            ))}
          </div>

          {/* Certificates List */}
          <div className="certificates-list">
            <h2 style={{marginBottom: '2rem'}}>Сертифікати та документи</h2>
            <div className="grid grid-2">
              {certificates.map(cert => (
                <div key={cert.id} className="certificate-card" style={{
                  padding: '2rem',
                  background: '#fff',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  border: '1px solid #e9ecef'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '1rem'
                  }}>
                    <div style={{
                      width: '50px',
                      height: '50px',
                      background: '#008080',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '1rem'
                    }}>
                      <span style={{color: 'white', fontSize: '1.5rem'}}>📋</span>
                    </div>
                    <div>
                      <h3 style={{margin: '0', fontSize: '1.125rem'}}>{cert.title}</h3>
                      <p style={{margin: '0', color: '#6c757d', fontSize: '0.875rem'}}>
                        № {cert.number}
                      </p>
                    </div>
                  </div>

                  <div className="cert-details" style={{marginBottom: '1.5rem'}}>
                    <div style={{marginBottom: '0.5rem'}}>
                      <strong>Діє до:</strong> {cert.validUntil}
                    </div>
                    <div style={{marginBottom: '1rem'}}>
                      <strong>Видано:</strong> {cert.issuedBy}
                    </div>

                    <div style={{marginBottom: '1rem'}}>
                      <strong>Продукція:</strong>
                      <ul style={{margin: '0.5rem 0', paddingLeft: '1rem'}}>
                        {cert.products.map((product, idx) => (
                          <li key={idx}>{product}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <strong>Стандарти:</strong>
                      <div style={{marginTop: '0.5rem'}}>
                        {cert.standards.map((standard, idx) => (
                          <span
                            key={idx}
                            style={{
                              display: 'inline-block',
                              background: '#e9ecef',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              marginRight: '0.5rem',
                              marginBottom: '0.25rem'
                            }}
                          >
                            {standard}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="cert-actions" style={{
                    display: 'flex',
                    gap: '0.5rem',
                    flexWrap: 'wrap'
                  }}>
                    <a
                      href={cert.file}
                      download
                      className="btn btn-primary"
                      style={{textDecoration: 'none', fontSize: '0.875rem'}}
                    >
                      📥 Завантажити PDF
                    </a>
                    <button
                      className="btn btn-outline"
                      style={{fontSize: '0.875rem'}}
                      onClick={() => window.print()}
                    >
                      🖨️ Друк
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Standards Information */}
      <section className="section dark">
        <div className="container">
          <h2 className="section-title">Стандарти та нормативи</h2>
          <div className="standards-list" style={{
            display: 'grid',
            gap: '1rem',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            {standards.map((standard, index) => (
              <div key={index} className="standard-item" style={{
                padding: '1.5rem',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '8px'
              }}>
                <h4 style={{color: '#FFA500', marginBottom: '0.5rem'}}>
                  {standard.code}
                </h4>
                <h5 style={{marginBottom: '0.5rem'}}>{standard.title}</h5>
                <p style={{color: 'rgba(255,255,255,0.8)', margin: '0'}}>
                  {standard.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quality Control */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Контроль якості</h2>
          <div className="grid grid-3">
            <div className="quality-step" style={{textAlign: 'center'}}>
              <div style={{
                width: '80px',
                height: '80px',
                background: '#008080',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                color: 'white',
                fontSize: '2rem'
              }}>
                🔬
              </div>
              <h3>Лабораторні випробування</h3>
              <p>
                Кожна партія проходить випробування в атестованій лабораторії
                з використанням сучасного обладнання.
              </p>
            </div>

            <div className="quality-step" style={{textAlign: 'center'}}>
              <div style={{
                width: '80px',
                height: '80px',
                background: '#008080',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                color: 'white',
                fontSize: '2rem'
              }}>
                📊
              </div>
              <h3>Статистичний контроль</h3>
              <p>
                Ведемо статистику всіх показників якості та постійно
                аналізуємо тенденції для покращення виробництва.
              </p>
            </div>

            <div className="quality-step" style={{textAlign: 'center'}}>
              <div style={{
                width: '80px',
                height: '80px',
                background: '#008080',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                color: 'white',
                fontSize: '2rem'
              }}>
                ✅
              </div>
              <h3>Сертифікація продукції</h3>
              <p>
                Вся продукція сертифікована згідно державних стандартів
                з регулярним оновленням документів.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      <section className="section gray">
        <div className="container">
          <h2 className="section-title">Переглянути продукцію</h2>
          <div className="grid grid-4">
            {relatedProducts.map((product, index) => (
              <Link
                key={index}
                to={product.link}
                className="product-link"
                style={{
                  display: 'block',
                  padding: '2rem',
                  background: 'white',
                  borderRadius: '8px',
                  textAlign: 'center',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}
              >
                <h3 style={{color: '#008080'}}>{product.name}</h3>
                <p style={{color: '#6c757d', fontSize: '0.875rem'}}>
                  Переглянути сертифікати
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="section">
        <div className="container" style={{textAlign: 'center'}}>
          <h2>Потрібна додаткова інформація?</h2>
          <p style={{marginBottom: '2rem', color: '#6c757d'}}>
            Наші спеціалісти готові надати детальні консультації щодо сертифікатів та стандартів
          </p>
          <div style={{display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap'}}>
            <Link to="/contacts" className="btn btn-accent">Зв'язатися з нами</Link>
            <a href="mailto:quality@comspec.ua" className="btn btn-primary">
              quality@comspec.ua
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Certificates;