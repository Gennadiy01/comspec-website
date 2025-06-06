import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <Link to="/" className="footer-logo-link">
              <img 
                src={process.env.PUBLIC_URL + '/images/logo.svg'}  
                alt="COMSPEC" 
                className="footer-logo"
              />
            </Link>
            <p>Високоякісні будівельні матеріали з доставкою по всій Україні</p>
          </div>
          
          <div className="footer-section">
            <h3>Контакти</h3>
            <p>Телефон: <a href="tel:+380739272700">073 927 27 00</a></p>
            <p>Email: <a href="mailto:info@comspec.ua">comspec@comspec.ua</a></p>
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