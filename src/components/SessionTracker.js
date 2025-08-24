// src/components/SessionTracker.js
/**
 * 📊 Session Tracking System - Повний моніторинг користувацьких сесій
 * 
 * Функціональність:
 * - Відстеження часу на кожній сторінці
 * - Загальна тривалість сесії
 * - Активність користувача (scroll, click, focus/blur)
 * - IP адреса користувача
 * - Детекція неактивності
 * - Bounce rate аналіз
 */

import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import SessionAnalytics from '../analytics/SessionAnalytics';
import { isFeatureEnabled, shouldTrackUser } from '../config/analytics-config';

const SessionTracker = () => {
  const location = useLocation();
  
  // ✅ Всі hooks мають бути викликані завжди
  const currentPageRef = useRef({
    path: null,
    startTime: null,
    isActive: true,
    interactions: 0,
    scrollDepth: 0
  });
  const sessionRef = useRef({
    sessionId: null,
    startTime: null,
    lastActivity: null,
    totalPages: 0,
    userAgent: null,
    ipAddress: null
  });
  
  // 🚫 Перевірки після hooks
  const sessionTrackingEnabled = isFeatureEnabled('sessionTracking');
  const userShouldBeTracked = shouldTrackUser();
  
  if (!sessionTrackingEnabled) {
    console.log('📊 Session tracking вимкнений в конфігурації');
  }
  
  if (!userShouldBeTracked) {
    console.log('📊 Користувач не потрапив в sample для session tracking');
  }

  // Ініціалізація сесії при першому завантаженні
  useEffect(() => {
    // ✅ Перевірка умов всередині useEffect
    if (!sessionTrackingEnabled || !userShouldBeTracked) {
      return;
    }
    
    const initializeSession = async () => {
      const sessionId = SessionAnalytics.generateSessionId();
      const startTime = Date.now();
      
      sessionRef.current = {
        sessionId,
        startTime,
        lastActivity: startTime,
        totalPages: 0,
        userAgent: navigator.userAgent,
        ipAddress: null // Буде отримано асинхронно
      };

      // Отримуємо IP адресу тільки якщо увімкнено
      if (isFeatureEnabled('ipDetection')) {
        try {
          const ipAddress = await SessionAnalytics.getUserIP();
          sessionRef.current.ipAddress = ipAddress;
          console.log('🌐 IP адреса користувача:', ipAddress);
        } catch (error) {
          console.warn('⚠️ Не вдалося отримати IP адресу:', error);
          sessionRef.current.ipAddress = 'unknown';
        }
      } else {
        sessionRef.current.ipAddress = 'disabled';
        console.log('🚫 IP detection вимкнений в конфігурації');
      }

      // Стартуємо нову сесію
      SessionAnalytics.startSession(sessionRef.current);
      
      console.log('🎯 Сесія ініціалізована:', sessionId);
    };

    initializeSession();

    // Cleanup при закритті сторінки (sendBeacon для надійності)
    const handleBeforeUnload = () => {
      if (currentPageRef.current.path) {
        SessionAnalytics.endPageView(
          currentPageRef.current.path,
          currentPageRef.current.startTime,
          currentPageRef.current.interactions,
          currentPageRef.current.scrollDepth
        );
      }
      
      // Використовуємо sendBeacon для надійної відправки при закритті
      SessionAnalytics.endSessionWithBeacon(sessionRef.current);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Зберігаємо дані при переході в фон
        if (currentPageRef.current.path) {
          SessionAnalytics.saveSessionState(sessionRef.current, currentPageRef.current);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [sessionTrackingEnabled, userShouldBeTracked]);

  // Відстеження переходів між сторінками
  useEffect(() => {
    // ✅ Перевірка умов всередині useEffect
    if (!sessionTrackingEnabled || !userShouldBeTracked) {
      return;
    }
    
    const now = Date.now();

    // Завершуємо попередню сторінку якщо була
    if (currentPageRef.current.path) {
      const duration = now - currentPageRef.current.startTime;
      SessionAnalytics.endPageView(
        currentPageRef.current.path,
        currentPageRef.current.startTime,
        currentPageRef.current.interactions,
        currentPageRef.current.scrollDepth,
        duration
      );
      
      console.log(`📄 Завершено перегляд ${currentPageRef.current.path}: ${Math.round(duration/1000)}с`);
    }

    // Починаємо нову сторінку
    currentPageRef.current = {
      path: location.pathname,
      startTime: now,
      isActive: true,
      interactions: 0,
      scrollDepth: 0
    };

    sessionRef.current.totalPages++;
    sessionRef.current.lastActivity = now;

    SessionAnalytics.startPageView(location.pathname, {
      sessionId: sessionRef.current.sessionId,
      pageNumber: sessionRef.current.totalPages,
      referrer: document.referrer,
      title: document.title,
      timestamp: now
    });

    console.log(`📄 Почато перегляд ${location.pathname}`);
  }, [location.pathname, sessionTrackingEnabled, userShouldBeTracked]);

  // Відстеження активності користувача
  useEffect(() => {
    // ✅ Перевірка умов всередині useEffect
    if (!sessionTrackingEnabled || !userShouldBeTracked) {
      return;
    }
    
    let inactivityTimer;
    const INACTIVITY_TIMEOUT = 30000; // 30 секунд неактивності

    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      sessionRef.current.lastActivity = Date.now();
      
      if (!currentPageRef.current.isActive) {
        currentPageRef.current.isActive = true;
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (!isLocalhost) {
          console.log('🔄 Користувач став активним');
        }
      }

      inactivityTimer = setTimeout(() => {
        currentPageRef.current.isActive = false;
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (!isLocalhost) {
          console.log('😴 Користувач неактивний');
        }
      }, INACTIVITY_TIMEOUT);
    };

    // Обробники подій активності
    const handleInteraction = (eventType) => {
      currentPageRef.current.interactions++;
      resetInactivityTimer();
      
      // Логуємо тільки кожну 50-ту взаємодію, і тільки якщо не localhost
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (!isLocalhost && currentPageRef.current.interactions % 50 === 0) {
        console.log(`🖱️ Взаємодій на сторінці: ${currentPageRef.current.interactions}`);
      }
    };

    const handleScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      
      if (scrollPercent > currentPageRef.current.scrollDepth) {
        currentPageRef.current.scrollDepth = scrollPercent;
      }
      
      handleInteraction('scroll');
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        resetInactivityTimer();
        console.log('👁️ Користувач повернувся на таб');
      } else {
        clearTimeout(inactivityTimer);
        console.log('👁️ Користувач переключився з табу');
      }
    };

    // Додаємо слухачі подій
    const events = [
      ['click', () => handleInteraction('click')],
      ['scroll', handleScroll, { passive: true }],
      ['mousemove', () => handleInteraction('mousemove')],
      ['keydown', () => handleInteraction('keydown')],
      ['touchstart', () => handleInteraction('touch'), { passive: true }]
    ];

    events.forEach(([event, handler, options]) => {
      window.addEventListener(event, handler, options);
    });

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Ініціалізуємо таймер
    resetInactivityTimer();

    return () => {
      clearTimeout(inactivityTimer);
      events.forEach(([event, handler]) => {
        window.removeEventListener(event, handler);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [sessionTrackingEnabled, userShouldBeTracked]);

  // Періодичне збереження стану сесії (кожні 30 секунд) + автоматичне завершення довгих сесій
  useEffect(() => {
    // ✅ Перевірка умов всередині useEffect
    if (!sessionTrackingEnabled || !userShouldBeTracked) {
      return;
    }
    
    const saveInterval = setInterval(() => {
      if (currentPageRef.current.path && currentPageRef.current.isActive) {
        const currentDuration = Date.now() - currentPageRef.current.startTime;
        
        // Оновлюємо дані сторінки
        SessionAnalytics.updatePageView(currentPageRef.current.path, {
          duration: currentDuration,
          interactions: currentPageRef.current.interactions,
          scrollDepth: currentPageRef.current.scrollDepth,
          isActive: currentPageRef.current.isActive
        });

        // Зберігаємо стан сесії
        SessionAnalytics.saveSessionState(sessionRef.current, currentPageRef.current);

        // Автоматично завершуємо дуже довгі сесії (більше 30 хвилин)
        const sessionDuration = Date.now() - sessionRef.current.startTime;
        if (sessionDuration > 30 * 60 * 1000) { // 30 хвилин
          SessionAnalytics.endSessionWithBeacon(sessionRef.current);
          console.log('⏰ Сесія автоматично завершена після 30 хвилин');
        }
        
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (!isLocalhost) {
          console.log(`💾 Збережено стан сесії (${Math.round(currentDuration/1000)}с)`);
        }
      }
    }, 30000); // Кожні 30 секунд

    return () => clearInterval(saveInterval);
  }, [sessionTrackingEnabled, userShouldBeTracked]);

  return null;
};

export default SessionTracker;