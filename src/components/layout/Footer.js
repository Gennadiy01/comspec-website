import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <img 
              src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjUwIiB2aWV3Qm94PSIwIDAgMjAwIDUwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjMTQxYzFjIi8+Cjx0ZXh0IHg9IjEwIiB5PSIzNSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI4IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iIzAwODA4MCI+Q09NU1BFQzwvdGV4dD4KPC9zdmc+" 
              alt="COMSPEC" 
              className="logo"
              style={{height: '40px', marginBottom: '1rem'}}
            />
            <p>Високоякісні будівельні матеріали з доставкою по всій Україні</p>
          </div>
          
          <div className="footer-section">
            <h3>Контакти</h3>
            <p>Телефон: <a href="tel:+380739272700">073 927 27 00</a></p>
            <p>Email: <a href="mailto:info@comspec.ua">info@comspec.ua</a></p>
            <p>Сайт: <a href="https://comspec.ua">comspec.ua</a></p>
          </div>
          
          <div className="footer-section">
            <h3>Навігація</h3>
            <p><Link to="/products">Продукція</Link></p>
            <p><Link to="/services">Послуги</Link></p>
            <p><Link to="/about">Про компанію</Link></p>
            <p><Link to="/contacts">Контакти</Link></p>
            <p><Link to="/articles">Статті</Link></p>
          </div>
          
          <div className="footer-section">
            <h3>Документи</h3>
            <p><a href="/privacy-policy">Privacy Policy</a></p>
            <p><Link to="/certificates/gravel">Сертифікати</Link></p>
            <p><a href="/price-list.pdf">Прайс-лист</a></p>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2025 COMSPEC. Всі права захищені.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;