// src/components/forms/AddressSearch.js
import React, { useState, useEffect, useRef } from 'react';
import '../../styles/address-search.css';

const AddressSearch = ({ 
  value, 
  onChange, 
  onAddressSelect, 
  error, 
  disabled = false,
  placeholder = "Введіть адресу доставки..." 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  
  const inputRef = useRef(null);
  const autocompleteService = useRef(null);
  const geocoder = useRef(null);
  const dropdownRef = useRef(null);

  // Зони доставки COMSPEC
  const deliveryZones = {
    'Київська область': { 
      available: true, 
      note: 'Доставка власним транспортом. Вартість розраховує менеджер' 
    },
    'Житомирська область': { 
      available: true, 
      note: 'Доставка власним транспортом. Вартість розраховує менеджер' 
    },
    'Черкаська область': { 
      available: false, 
      note: 'Доставка в ваш регіон неможлива. Пропонуємо самовивіз' 
    },
    'Вінницька область': { 
      available: false, 
      note: 'Доставка в ваш регіон неможлива. Пропонуємо самовивіз' 
    },
    'Полтавська область': { 
      available: false, 
      note: 'Доставка в ваш регіон неможлива. Пропонуємо самовивіз' 
    }
  };

  // Ініціалізація Google Maps API
  useEffect(() => {
    const initializeGoogleMaps = () => {
      if (window.google && window.google.maps) {
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
        geocoder.current = new window.google.maps.Geocoder();
        setIsLoaded(true);
      }
    };

    // Перевіряємо чи вже завантажено API
    if (window.google) {
      initializeGoogleMaps();
    } else {
      // Завантажуємо Google Maps API
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places&language=uk&region=UA`;
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleMaps;
      script.onerror = () => {
        console.error('Помилка завантаження Google Maps API');
      };
      document.head.appendChild(script);
    }
  }, []);

  // Пошук адрес з затримкою
  useEffect(() => {
    if (!value || value.length < 3 || !isLoaded || !autocompleteService.current) {
      setPredictions([]);
      setIsDropdownOpen(false);
      return;
    }

    const searchTimeout = setTimeout(() => {
      const request = {
        input: value,
        componentRestrictions: { country: 'ua' },
        language: 'uk',
        types: ['address', 'establishment', 'geocode']
      };

      autocompleteService.current.getPlacePredictions(request, (predictions, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setPredictions(predictions.slice(0, 5)); // Обмежуємо 5 результатами
          setIsDropdownOpen(true);
        } else {
          setPredictions([]);
          setIsDropdownOpen(false);
        }
      });
    }, 300); // Затримка 300мс для зменшення API запитів

    return () => clearTimeout(searchTimeout);
  }, [value, isLoaded]);

  // Валідація зони доставки
  const validateDeliveryZone = async (placeId) => {
    if (!geocoder.current) return null;

    setIsValidating(true);
    
    try {
      return new Promise((resolve) => {
        geocoder.current.geocode({ placeId }, (results, status) => {
          if (status === 'OK' && results[0]) {
            const addressComponents = results[0].address_components;
            const location = results[0].geometry.location;
            
            // Знаходимо область
            let region = null;
            for (const component of addressComponents) {
              if (component.types.includes('administrative_area_level_1')) {
                region = component.long_name;
                break;
              }
            }

            if (!region) {
              resolve({
                available: false,
                message: 'Не вдалось визначити регіон доставки',
                address: results[0].formatted_address,
                coordinates: {
                  lat: location.lat(),
                  lng: location.lng()
                }
              });
              return;
            }

            const zone = deliveryZones[region];
            
            resolve({
              available: zone ? zone.available : false,
              message: zone 
                ? (zone.available 
                    ? `Доставка в ${region} доступна` 
                    : `Доставка в ${region} неможлива`)
                : `Доставка в ${region} не визначена`,
              note: zone?.note || 'Зв\'яжіться з менеджером для уточнення',
              region,
              address: results[0].formatted_address,
              coordinates: {
                lat: location.lat(),
                lng: location.lng()
              },
              placeId: results[0].place_id
            });
          } else {
            resolve({
              available: false,
              message: 'Помилка перевірки адреси',
              address: null,
              coordinates: null
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
        coordinates: null
      };
    } finally {
      setIsValidating(false);
    }
  };

  // Вибір адреси зі списку
  const handlePredictionSelect = async (prediction) => {
    const selectedAddress = prediction.description;
    onChange(selectedAddress);
    setIsDropdownOpen(false);
    setPredictions([]);

    // Валідуємо зону доставки
    const validation = await validateDeliveryZone(prediction.place_id);
    setValidationResult(validation);

    // Передаємо дані до батьківського компоненту
    if (onAddressSelect) {
      onAddressSelect({
        address: selectedAddress,
        placeId: prediction.place_id,
        validation: validation
      });
    }
  };

  // Навігація клавіатурою
  const handleKeyDown = (e) => {
    if (!isDropdownOpen || predictions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < predictions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handlePredictionSelect(predictions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsDropdownOpen(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  // Закриття dropdown при кліку поза ним
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="address-search" ref={dropdownRef}>
      <div className="address-search-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`address-search-input ${error ? 'error' : ''} ${validationResult?.available === false ? 'warning' : ''}`}
          autoComplete="off"
        />
        
        {isValidating && (
          <div className="address-search-loading">
            <div className="spinner"></div>
          </div>
        )}
      </div>

      {/* Dropdown зі списком адрес */}
      {isDropdownOpen && predictions.length > 0 && (
        <div className="address-search-dropdown">
          {predictions.map((prediction, index) => (
            <div
              key={prediction.place_id}
              className={`address-search-option ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => handlePredictionSelect(prediction)}
            >
              <div className="address-main">{prediction.structured_formatting.main_text}</div>
              <div className="address-secondary">{prediction.structured_formatting.secondary_text}</div>
            </div>
          ))}
        </div>
      )}

      {/* Результат валідації */}
      {validationResult && (
        <div className={`address-validation-result ${validationResult.available ? 'success' : 'error'}`}>
          <div className="validation-message">
            {validationResult.available ? '✅' : '❌'} {validationResult.message}
          </div>
          {validationResult.note && (
            <div className="validation-note">{validationResult.note}</div>
          )}
        </div>
      )}

      {/* Помилка */}
      {error && (
        <div className="address-search-error">{error}</div>
      )}

      {/* Інформація про API */}
      {!isLoaded && (
        <div className="address-search-loading-api">
          Завантаження сервісу карт...
        </div>
      )}
    </div>
  );
};

export default AddressSearch;