// src/App.js
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { OrderModalProvider } from './context/OrderModalContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import OrderModal from './components/modals/OrderModal';
import Home from './pages/Home';
import Products from './pages/Products';
import Services from './pages/Services';
import About from './pages/About';
import Contacts from './pages/Contacts';
import Articles from './pages/Articles';
import RetailLocations from './pages/RetailLocations';
import Certificates from './pages/Certificates';
import ScrollToTop from './components/ScrollToTop';
import './styles/main.scss';

function App() {
  return (
    <OrderModalProvider>
      <Router>
        <ScrollToTop />
        <div className="App">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/services" element={<Services />} />
              <Route path="/about" element={<About />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/articles" element={<Articles />} />
              <Route path="/retail-locations" element={<RetailLocations />} />
              <Route path="/certificates/:category" element={<Certificates />} />
            </Routes>
          </main>
          <Footer />
          {/* Глобальне модальне вікно замовлення */}
          <OrderModal />
        </div>
      </Router>
    </OrderModalProvider>
  );
}

export default App;