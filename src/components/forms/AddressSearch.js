// src/components/forms/AddressSearch.js
import React, { useState, useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import config from '../../config/environment'; // ЗМІНА: використовуємо нашу конфігурацію
import '../../styles/address-search.css';

const AddressSearch = ({
  value,
  onChange,
  onAddressSelect,
  error,
  disabled = false,
  placeholder = 'Введіть адресу доставки...',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [lastValidatedValue, setLastValidatedValue] = useState('');

  const inputRef = useRef(null);
  const geocoder = useRef(null);
  const dropdownRef = useRef(null);
  const loaderRef = useRef(null);
  const googleRef = useRef(null);

  // Зони доставки
  const deliveryZones = {
    'Київська область': {
      available: true,
      note: 'Доставка власним транспортом. Вартість розраховує менеджер',
    },
    'Житомирська область': {
      available: true,
      note: 'Доставка власним транспортом. Вартість розраховує менеджер',
    },
    'Черкаська область': {
      available: false,
      note: 'Доставка в ваш регіон неможлива. Пропонуємо самовивіз',
    },
    'Вінницька область': {
      available: false,
      note: 'Доставка в ваш регіон неможлива. Пропонуємо самовивіз',
    },
    'Полтавська область': {
      available: false,
      note: 'Доставка в ваш регіон неможлива. Пропонуємо самовивіз',
    },
    'Київ': {
      available: true,
      note: 'Доставка по місту Київ. Вартість розраховує менеджер',
    },
    'Kiev Oblast': {
      available: true,
      note: 'Доставка власним транспортом. Вартість розраховує менеджер',
    },
    'Kyiv Oblast': {
      available: true,
      note: 'Доставка власним транспортом. Вартість розраховує менеджер',
    },
  };

  useEffect(() => {
    let isMounted = true;

    // ЗМІНА: використовуємо config замість process.env
    if (!config.GOOGLE_MAPS_API_KEY) {
      console.error('❌ Google Maps API ключ не знайдено в конфігурації');
      setLoadError('Google Maps API ключ не налаштований');
      return;
    }

    loaderRef.current = new Loader({
      apiKey: config.GOOGLE_MAPS_API_KEY, // ЗМІНА: використовуємо config
      version: 'weekly',
      libraries: ['places'],
      language: 'uk',
      region: 'UA',
    });

    loaderRef.current
      .load()
      .then((google) => {
        if (isMounted) {
          try {
            googleRef.current = google;
            geocoder.current = new google.maps.Geocoder();
            setIsLoaded(true);
            console.log('✅ Google Maps API ініціалізовано');
            
            // ДОДАНО: логування для налагодження
            if (config.DEBUG_MODE) {
              console.log('🗺️ Google Maps завантажено з конфігурації:', config.ENVIRONMENT);
            }
          } catch (error) {
            console.error('❌ Помилка ініціалізації сервісу:', error);
            setLoadError('Не вдалося ініціалізувати сервіс карт');
            setIsLoaded(false);
          }
        }
      })
      .catch((error) => {
        if (isMounted) {
          console.error('❌ Помилка завантаження Google Maps API:', error);
          setLoadError('Не вдалося завантажити сервіс карт');
          setIsLoaded(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []); // ЗМІНА: видалено config з dependencies, оскільки він статичний

  // Пошук адрес
  useEffect(() => {
    if (!value || value.length < 3 || !isLoaded || !googleRef.current || value === lastValidatedValue) {
      if (value === lastValidatedValue && isDropdownOpen) {
        setIsDropdownOpen(false);
        setPredictions([]);
        setSelectedIndex(-1);
      } else if (value !== lastValidatedValue) {
        setPredictions([]);
        setIsDropdownOpen(false);
      }
      return;
    }

    const searchTimeout = setTimeout(async () => {
      try {
        const request = {
          address: value,
          region: 'ua',
          language: 'uk'
        };

        geocoder.current.geocode(request, (results, status) => {
          if (status === 'OK' && results && results.length > 0) {
            const formattedPredictions = results.slice(0, 5).map(result => ({
              place_id: result.place_id,
              description: result.formatted_address,
              structured_formatting: {
                main_text: result.address_components[0]?.long_name || result.formatted_address.split(',')[0],
                secondary_text: result.formatted_address,
              }
            }));
            
            setPredictions(formattedPredictions);
            setIsDropdownOpen(true);
          } else {
            console.warn('geocode: немає результатів або помилка', status);
            setPredictions([]);
            setIsDropdownOpen(false);
          }
        });
      } catch (error) {
        console.error('Помилка виконання пошуку:', error);
        setPredictions([]);
        setIsDropdownOpen(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [value, isLoaded, lastValidatedValue, isDropdownOpen]);

  // Валідація зони доставки
  const validateDeliveryZone = async (placeId) => {
    if (!geocoder.current) {
      console.warn('Geocoder недоступний');
      return {
        available: false,
        message: 'Сервіс геокодування недоступний',
        address: null,
        coordinates: null,
      };
    }

    setIsValidating(true);

    try {
      return new Promise((resolve) => {
        geocoder.current.geocode({ placeId }, (results, status) => {
          if (config.DEBUG_MODE) {
            console.log('Geocode result:', { results, status });
          }
          
          if (status === 'OK' && results[0]) {
            const addressComponents = results[0].address_components;
            const location = results[0].geometry.location;
            const fullAddress = results[0].formatted_address;

            let region = null;
            let locality = null;
            let isKyivCity = false;

            for (const component of addressComponents) {
              if (config.DEBUG_MODE) {
                console.log('Address component:', component.types, component.long_name);
              }
              
              if (component.types.includes('locality') && 
                  (component.long_name === 'Київ' || component.long_name === 'Kiev' || component.long_name === 'Kyiv')) {
                locality = component.long_name;
                isKyivCity = true;
              }
              
              if (component.types.includes('administrative_area_level_1')) {
                region = component.long_name;
              }
            }

            if (config.DEBUG_MODE) {
              console.log('Parsed location data:', { region, locality, isKyivCity });
            }

            let finalRegion = null;
            let zone = null;

            if (isKyivCity || locality === 'Київ') {
              finalRegion = 'Київ';
              zone = deliveryZones['Київ'];
              if (config.DEBUG_MODE) {
                console.log('Визначено як місто Київ');
              }
            } else if (region) {
              const possibleRegionNames = [
                region,
                region.replace('Oblast', 'область'),
                region.replace('Region', 'область'),
                region + ' область'
              ];

              for (const regionName of possibleRegionNames) {
                if (deliveryZones[regionName]) {
                  finalRegion = regionName;
                  zone = deliveryZones[regionName];
                  break;
                }
              }
              
              if (config.DEBUG_MODE) {
                console.log('Перевірено регіон:', region, 'Результат:', zone);
              }
            }

            if (!zone) {
              if (config.DEBUG_MODE) {
                console.log('Зона доставки не визначена для:', region || locality);
              }
              resolve({
                available: false,
                message: region ? `Автомобільна доставка в ${region} не визначена` : 'Не вдалось визначити регіон доставки',
                note: "Зв'яжіться з менеджером для уточнення можливості доставки автомобільним або залізничним транспортом",
                region: finalRegion || region || locality,
                address: fullAddress,
                coordinates: {
                  lat: location.lat(),
                  lng: location.lng(),
                },
                placeId: results[0].place_id,
              });
              return;
            }

            resolve({
              available: zone.available,
              message: zone.available 
                ? `Доставка в ${finalRegion} доступна`
                : `Доставка в ${finalRegion} недоступна`,
              note: zone.note,
              region: finalRegion,
              address: fullAddress,
              coordinates: {
                lat: location.lat(),
                lng: location.lng(),
              },
              placeId: results[0].place_id,
            });
          } else {
            console.warn('Помилка геокодування:', status);
            resolve({
              available: false,
              message: 'Помилка перевірки адреси',
              address: null,
              coordinates: null,
            });
          }
        });
      });
    } catch (error) {
      console.error('Помилка валідації:', error);
      return {
        available: false,
        message: 'Помилка перевірки зони доставки',
        address: null,
        coordinates: null,
      };
    } finally {
      setIsValidating(false);
    }
  };

  // Вибір адреси
  const handlePredictionSelect = async (prediction) => {
    try {
      const selectedAddress = prediction.description;
      
      setIsDropdownOpen(false);
      setPredictions([]);
      setSelectedIndex(-1);
      
      onChange(selectedAddress);
      setLastValidatedValue(selectedAddress);
      
      setTimeout(() => {
        setIsDropdownOpen(false);
        setPredictions([]);
      }, 50);
      
      const validation = await validateDeliveryZone(prediction.place_id);
      setValidationResult(validation);

      if (config.DEBUG_MODE) {
        console.log('Результат валідації адреси:', validation);
      }

      if (onAddressSelect) {
        onAddressSelect({
          address: selectedAddress,
          placeId: prediction.place_id,
          validation,
        });
      }
    } catch (error) {
      console.error('Помилка вибору адреси:', error);
      setIsDropdownOpen(false);
      setPredictions([]);
      setSelectedIndex(-1);
    }
  };

  // Обробка зміни input
  const handleInputChange = (newValue) => {
    onChange(newValue);
    
    if (newValue !== lastValidatedValue && validationResult) {
      setValidationResult(null);
      setLastValidatedValue('');
    }
    
    if (newValue !== lastValidatedValue && lastValidatedValue) {
      setIsDropdownOpen(false);
      setPredictions([]);
      setSelectedIndex(-1);
    }
  };

  // Обробка клавіш
  const handleKeyDown = (e) => {
    if (!isDropdownOpen || predictions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < predictions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > -1 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handlePredictionSelect(predictions[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsDropdownOpen(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  // Обробка кліків поза компонентом
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setPredictions([]);
        setSelectedIndex(-1);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
        setPredictions([]);
        setSelectedIndex(-1);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isDropdownOpen]);

  if (loadError) {
    return (
      <div className="address-search-error">
        {loadError}. Спробуйте оновити сторінку або зверніться до підтримки.
      </div>
    );
  }

  return (
    <div className="address-search" ref={dropdownRef}>
      <div className="address-search-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || !isLoaded}
          className={`address-search-input ${error ? 'error' : ''} ${
            validationResult?.available === false ? 'warning' : ''
          }`}
          autoComplete="off"
        />
        {isValidating && (
          <div className="address-search-loading">
            <div className="spinner"></div>
          </div>
        )}
      </div>

      {isDropdownOpen && predictions.length > 0 && (
        <div className="address-search-dropdown">
          {predictions.map((prediction, index) => (
            <div
              key={prediction.place_id}
              className={`address-search-option ${
                index === selectedIndex ? 'selected' : ''
              }`}
              onClick={() => handlePredictionSelect(prediction)}
            >
              <div className="address-main">
                {prediction.structured_formatting.main_text}
              </div>
              <div className="address-secondary">
                {prediction.structured_formatting.secondary_text}
              </div>
            </div>
          ))}
        </div>
      )}

{/* Закомеетована  дублююча нотифікація можливості доставки */}

      {validationResult && (
        <div
          className="address-validation"
          style={{
            marginTop: '8px',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '0.875rem',
            lineHeight: '1.4',
            border: '1px solid',
            backgroundColor: validationResult.available 
              ? 'rgba(40, 167, 69, 0.1)'
              : 'rgba(255, 193, 7, 0.1)',
            borderColor: validationResult.available 
              ? '#28a745'
              : '#ffc107',
            color: validationResult.available 
              ? '#155724'
              : '#856404',
          }}
        >
          <div style={{ 
            fontWeight: '600', 
            marginBottom: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              style={{ 
                color: validationResult.available ? '#28a745' : '#ffc107',
                flexShrink: 0 
              }}
            >
              {validationResult.available ? (
                <path 
                  d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-2.99" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              ) : (
                <>
                  <path 
                    d="M12 9v4M12 17h.01" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                  <path 
                    d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </>
              )}
            </svg>
            <span>{validationResult.message}</span>
          </div>
          {validationResult.note && (
            <div style={{ 
              opacity: 0.9,
              fontSize: '0.825rem' 
            }}>
              {validationResult.note}
            </div>
          )}
        </div>
      )}
      
      {/*===========================================*/}

      {error && <div className="address-search-error">{error}</div>}

      {!isLoaded && !loadError && (
        <div className="address-search-loading-api">
          Завантаження сервісу карт...
        </div>
      )}
    </div>
  );
};

export default AddressSearch;