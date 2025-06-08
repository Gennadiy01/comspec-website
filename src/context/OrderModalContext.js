// src/contexts/OrderModalContext.js
import React, { createContext, useContext, useState } from 'react';

// Створюємо контекст
const OrderModalContext = createContext();

// Хук для використання контексту
export const useOrderModal = () => {
  const context = useContext(OrderModalContext);
  if (!context) {
    throw new Error('useOrderModal must be used within an OrderModalProvider');
  }
  return context;
};

// Провайдер контексту
export const OrderModalProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [orderData, setOrderData] = useState({
    product: '',
    source: '',
    preSelectedProduct: ''
  });

  // Функція відкриття модального вікна
  const openOrderModal = (data = {}) => {
    setOrderData({
      product: data.product || '',
      source: data.source || '',
      preSelectedProduct: data.product || ''
    });
    setIsOpen(true);
    
    // Блокуємо прокрутку сторінки
    document.body.style.overflow = 'hidden';
  };

  // Функція закриття модального вікна
  const closeOrderModal = () => {
    setIsOpen(false);
    setOrderData({
      product: '',
      source: '',
      preSelectedProduct: ''
    });
    
    // Відновлюємо прокрутку сторінки
    document.body.style.overflow = 'auto';
  };

  const value = {
    isOpen,
    orderData,
    openOrderModal,
    closeOrderModal
  };

  return (
    <OrderModalContext.Provider value={value}>
      {children}
    </OrderModalContext.Provider>
  );
};