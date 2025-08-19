// src/App.js
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { OrderModalProvider } from './context/OrderModalContext';
import SimpleErrorBoundary from './components/SimpleErrorBoundary';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import OrderModal from './components/modals/OrderModal';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Services from './pages/Services';
import About from './pages/About';
import Contacts from './pages/Contacts';
import Articles from './pages/Articles';
import RetailLocations from './pages/RetailLocations';
import Certificates from './pages/Certificates';
import ScrollToTop from './components/ScrollToTop';

// 🔧 PRODUCTION OPTIMIZATION: Тестові інструменти завантажуються умовно  
// Імпортуємо напряму - логіка контролю всередині файлів
import './utils/testingTools';
import './utils/limitChecker';

// 📊 Система аналітики
import ProductAnalytics from './analytics/ProductAnalytics';

import './styles/main.scss';

function App() {
  // Ініціалізуємо систему аналітики при завантаженні App
  React.useEffect(() => {
    ProductAnalytics.init();
  }, []);

  return (
    <SimpleErrorBoundary>
      <OrderModalProvider>
        <Router>
          <ScrollToTop />
          <div className="App">
            <SimpleErrorBoundary>
              <Header />
            </SimpleErrorBoundary>
                      
            <main>
              <Routes>
                <Route path="/" element={
                  <SimpleErrorBoundary>
                    <Home />
                  </SimpleErrorBoundary>
                } />
                <Route path="/products" element={
                  <SimpleErrorBoundary><Products /></SimpleErrorBoundary>
                } />
                <Route path="/products/:category/:id" element={
                  <SimpleErrorBoundary><ProductDetail /></SimpleErrorBoundary>
                } />
                <Route path="/services" element={
                  <SimpleErrorBoundary><Services /></SimpleErrorBoundary>
                } />
                <Route path="/about" element={
                  <SimpleErrorBoundary><About /></SimpleErrorBoundary>
                } />
                <Route path="/contacts" element={
                  <SimpleErrorBoundary><Contacts /></SimpleErrorBoundary>
                } />
                <Route path="/articles" element={
                  <SimpleErrorBoundary><Articles /></SimpleErrorBoundary>
                } />
                <Route path="/retail-locations" element={
                  <SimpleErrorBoundary><RetailLocations /></SimpleErrorBoundary>
                } />
                <Route path="/certificates/:category" element={
                  <SimpleErrorBoundary><Certificates /></SimpleErrorBoundary>
                } />
              </Routes>
            </main>
            
            <SimpleErrorBoundary>
              <Footer />
            </SimpleErrorBoundary>
            
            {/* Глобальне модальне вікно замовлення */}
            <SimpleErrorBoundary>
              <OrderModal />
            </SimpleErrorBoundary>
          </div>
        </Router>
      </OrderModalProvider>
    </SimpleErrorBoundary>
  );
}

export default App;