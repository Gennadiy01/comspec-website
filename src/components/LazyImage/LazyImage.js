import React, { useState, useRef, useEffect } from 'react';
import { getDesktopImageUrl, getMobileImageUrl, getPlaceholderImageUrl } from '../../data/products/productsAPI.js';
import './LazyImage.scss';

const LazyImage = ({ 
  src, 
  alt = '', 
  placeholder,
  width = 'auto',
  height = 'auto',
  className = '',
  priority = false, // Для критичних зображень (hero, логотипи)
  objectFit = 'cover',
  responsive = false, // Чи використовувати responsive зображення
  ...props 
}) => {
  // Автоматично генеруємо placeholder якщо не передано
  const placeholderSrc = placeholder || (responsive && src ? getPlaceholderImageUrl(src) : '/images/placeholder.jpg');
  
  // Генеруємо URLs для responsive зображень
  const mobileImageUrl = responsive && src ? getMobileImageUrl(src) : null;
  const desktopImageUrl = responsive && src ? getDesktopImageUrl(src) : null;
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [inView, setInView] = useState(priority); // Якщо priority - завантажувати одразу
  const imgRef = useRef();

  // Intersection Observer для lazy loading
  useEffect(() => {
    if (priority) return; // Пропустити для пріоритетних зображень

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setLoaded(true);
    setError(false);
  };

  const handleError = () => {
    setError(true);
    setLoaded(false);
  };

  return (
    <div 
      ref={imgRef}
      className={`lazy-image ${className}`}
      style={{ 
        width, 
        height,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Placeholder поки завантажується */}
      {!loaded && !error && (
        <div className="lazy-image__placeholder">
          {placeholderSrc ? (
            <img 
              src={placeholderSrc}
              alt=""
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit,
                filter: 'blur(5px)',
                opacity: 0.7
              }}
            />
          ) : (
            <div className="lazy-image__loading">
              <div className="spinner"></div>
              <span>Завантаження...</span>
            </div>
          )}
        </div>
      )}

      {/* Основне зображення */}
      {inView && (
        responsive && desktopImageUrl ? (
          <picture className={`lazy-image__picture ${loaded ? 'loaded' : ''}`}>
            {mobileImageUrl && (
              <source 
                media="(max-width: 768px)" 
                srcSet={mobileImageUrl}
              />
            )}
            <img 
              src={desktopImageUrl}
              alt={alt}
              onLoad={handleLoad}
              onError={handleError}
              className="lazy-image__img"
              style={{ 
                width: '100%',
                height: '100%',
                objectFit,
                transition: 'opacity 0.3s ease-in-out',
                opacity: loaded ? 1 : 0
              }}
              {...props}
            />
          </picture>
        ) : (
          <img 
            src={src}
            alt={alt}
            onLoad={handleLoad}
            onError={handleError}
            className={`lazy-image__img ${loaded ? 'loaded' : ''}`}
            style={{ 
              width: '100%',
              height: '100%',
              objectFit,
              transition: 'opacity 0.3s ease-in-out',
              opacity: loaded ? 1 : 0
            }}
            {...props}
          />
        )
      )}

      {/* Fallback при помилці */}
      {error && (
        <div className="lazy-image__error">
          <div className="error-icon">📷</div>
          <span>Зображення недоступне</span>
        </div>
      )}
    </div>
  );
};

export default LazyImage;