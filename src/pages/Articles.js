import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Articles = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'all', name: 'Всі статті' },
    { id: 'products', name: 'Про продукцію' },
    { id: 'construction', name: 'Поради з будівництва' },
    { id: 'news', name: 'Новини компанії' }
  ];

  const articles = [
    {
      id: 1,
      title: 'Як вибрати правильний щебінь для фундаменту',
      category: 'products',
      excerpt: 'Детальний гід по вибору щебню для різних типів фундаментів. Розглядаємо фракції, марки міцності та особливості застосування.',
      date: '2024-01-15',
      readTime: '5 хв',
      image: '/images/articles/gravel-foundation.jpg',
      tags: ['щебінь', 'фундамент', 'будівництво']
    },
    {
      id: 2,
      title: 'Технологія виробництва асфальтобетонних сумішей',
      category: 'products',
      excerpt: 'Сучасні технології виробництва асфальту, контроль якості та особливості застосування різних типів сумішей.',
      date: '2024-01-10',
      readTime: '7 хв',
      image: '/images/articles/asphalt-production.jpg',
      tags: ['асфальт', 'технологія', 'виробництво']
    },
    {
      id: 3,
      title: 'Секрети якісного бетонування в зимовий період',
      category: 'construction',
      excerpt: 'Практичні поради щодо роботи з бетоном при низьких температурах. Добавки, обігрів та контроль твердіння.',
      date: '2024-01-05',
      readTime: '6 хв',
      image: '/images/articles/winter-concrete.jpg',
      tags: ['бетон', 'зима', 'будівництво']
    },
    {
      id: 4,
      title: 'COMSPEC отримала сертифікат ISO 14001:2015',
      category: 'news',
      excerpt: 'Наша компанія успішно пройшла сертифікацію системи екологічного менеджменту згідно міжнародного стандарту.',
      date: '2023-12-20',
      readTime: '3 хв',
      image: '/images/articles/iso-certificate.jpg',
      tags: ['новини', 'сертифікація', 'екологія']
    },
    {
      id: 5,
      title: 'Розрахунок необхідної кількості піску для стяжки',
      category: 'construction',
      excerpt: 'Покрокова інструкція для розрахунку об\'єму піску, цементу та інших матеріалів для різних типів стяжки.',
      date: '2023-12-15',
      readTime: '4 хв',
      image: '/images/articles/sand-calculation.jpg',
      tags: ['пісок', 'стяжка', 'розрахунок']
    },
    {
      id: 6,
      title: 'Нове обладнання на заводі в Броварах',
      category: 'news',
      excerpt: 'Введено в експлуатацію нову лінію з виробництва бетону потужністю 120 м³/год. Підвищення якості та продуктивності.',
      date: '2023-12-10',
      readTime: '3 хв',
      image: '/images/articles/new-equipment.jpg',
      tags: ['новини', 'обладнання', 'модернізація']
    },
    {
      id: 7,
      title: 'Класифікація та властивості будівельного піску',
      category: 'products',
      excerpt: 'Детальний огляд типів піску, їх характеристик та сфер застосування в сучасному будівництві.',
      date: '2023-12-05',
      readTime: '8 хв',
      image: '/images/articles/sand-types.jpg',
      tags: ['пісок', 'класифікація', 'властивості']
    },
    {
      id: 8,
      title: 'Поради з укладання тротуарної плитки',
      category: 'construction',
      excerpt: 'Технологія підготовки основи, правильне укладання та догляд за тротуарною плиткою.',
      date: '2023-11-30',
      readTime: '6 хв',
      image: '/images/articles/paving-stones.jpg',
      tags: ['плитка', 'тротуар', 'укладання']
    }
  ];

  const filteredArticles = articles.filter(article => {
    const matchesCategory = activeCategory === 'all' || article.category === activeCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="articles-page">
      {/* Hero Section */}
      <section className="hero" style={{padding: '4rem 0'}}>
        <div className="container">
          <h1>Статті та поради</h1>
          <p>Корисна інформація про будівельні матеріали, технології та новини компанії</p>
        </div>
      </section>

      {/* Filters */}
      <section className="section">
        <div className="container">
          <div className="filters" style={{marginBottom: '3rem'}}>
            <div className="category-filters" style={{marginBottom: '1rem'}}>
              {categories.map(category => (
                <button
                  key={category.id}
                  className={`btn ${activeCategory === category.id ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setActiveCategory(category.id)}
                  style={{marginRight: '0.5rem', marginBottom: '0.5rem'}}
                >
                  {category.name}
                </button>
              ))}
            </div>
            
            <div className="search-filter">
              <input
                type="text"
                placeholder="Пошук статей..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: '0.75rem',
                  border: '2px solid #e9ecef',
                  borderRadius: '6px',
                  width: '300px',
                  maxWidth: '100%'
                }}
              />
            </div>
          </div>

          {/* Articles Grid */}
          <div className="grid grid-3">
            {filteredArticles.map(article => (
              <article key={article.id} className="card">
                <div style={{
                  height: '200px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6c757d'
                }}>
                  Фото статті
                </div>
                
                <div className="article-meta" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem',
                  fontSize: '0.875rem',
                  color: '#6c757d'
                }}>
                  <span>{formatDate(article.date)}</span>
                  <span>{article.readTime}</span>
                </div>
                
                <h3 style={{marginBottom: '1rem', lineHeight: '1.4'}}>
                  <Link 
                    to={`/articles/${article.id}`}
                    style={{textDecoration: 'none', color: 'inherit'}}
                  >
                    {article.title}
                  </Link>
                </h3>
                
                <p style={{marginBottom: '1rem', color: '#6c757d'}}>
                  {article.excerpt}
                </p>
                
                <div className="article-tags" style={{marginBottom: '1.5rem'}}>
                  {article.tags.map((tag, index) => (
                    <span
                      key={index}
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
                      #{tag}
                    </span>
                  ))}
                </div>
                
                <Link 
                  to={`/articles/${article.id}`}
                  className="btn btn-primary"
                  style={{width: '100%', textAlign: 'center'}}
                >
                  Читати далі
                </Link>
              </article>
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div style={{textAlign: 'center', padding: '3rem', color: '#6c757d'}}>
              <h3>Статті не знайдено</h3>
              <p>Спробуйте змінити фільтри або пошукову фразу</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Subscribe */}
      <section className="section dark">
        <div className="container">
          <div style={{textAlign: 'center', maxWidth: '600px', margin: '0 auto'}}>
            <h2>Підписка на новини</h2>
            <p style={{marginBottom: '2rem'}}>
              Отримуйте найсвіжіші статті, поради та новини компанії на свою електронну пошту
            </p>
            
            <form style={{
              display: 'flex',
              gap: '1rem',
              maxWidth: '400px',
              margin: '0 auto',
              flexWrap: 'wrap'
            }}>
              <input
                type="email"
                placeholder="Ваша електронна пошта"
                style={{
                  flex: '1',
                  padding: '0.75rem',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderRadius: '6px',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  minWidth: '200px'
                }}
              />
              <button type="submit" className="btn btn-accent">
                Підписатися
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      <section className="section gray">
        <div className="container">
          <h2 className="section-title">Рекомендовані статті</h2>
          <div className="grid grid-3">
            {articles.slice(0, 3).map(article => (
              <div key={article.id} className="card">
                <h4>{article.title}</h4>
                <p style={{color: '#6c757d', fontSize: '0.875rem'}}>
                  {formatDate(article.date)} • {article.readTime}
                </p>
                <Link to={`/articles/${article.id}`} className="btn btn-primary" style={{marginTop: '1rem'}}>
                  Читати
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Articles;