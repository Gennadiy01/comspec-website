import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo-link">
            <img 
              src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjUwIiB2aWV3Qm94PSIwIDAgMjAwIDUwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjMTQxYzFjIi8+Cjx0ZXh0IHg9IjEwIiB5PSIzNSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI4IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iIzAwODA4MCI+Q09NU1BFQzwvdGV4dD4KPC9zdmc+" 
              alt="COMSPEC" 
              className="logo"
            />
          </Link>
          
          <nav className="nav">
            <Link to="/">Головна</Link>
            <Link to="/products">Продукція</Link>
            <Link to="/services">Послуги</Link>
            <Link to="/about">Про нас</Link>
            <Link to="/contacts">Контакти</Link>
            <Link to="/articles">Статті</Link>
          </nav>
          
          <div className="header-contact">
            <a href="tel:+380739272700" className="phone">
              073 927 27 00
            </a>
            <Link to="/contacts" className="btn btn-accent">
              Замовити
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;