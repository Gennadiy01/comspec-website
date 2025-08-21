// src/components/AnalyticsTest.jsx
import React, { useState } from 'react';
import GoogleSheetsAnalytics from '../analytics/GoogleSheetsAnalytics';

const AnalyticsTest = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  };

  const testConnection = async () => {
    setLoading(true);
    setResults(null);
    addLog('🧪 Початок тесту підключення з redirect підтримкою...');
    
    try {
      const result = await GoogleSheetsAnalytics.testConnection();
      addLog('✅ Тест підключення завершено');
      setResults({ success: true, data: result });
    } catch (error) {
      addLog(`❌ Помилка: ${error.message}`);
      setResults({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testPageView = async () => {
    setLoading(true);
    addLog('📄 Тестування page view з redirect...');
    
    try {
      const result = await GoogleSheetsAnalytics.trackPageView('/test-page', 'test-product', {
        testType: 'redirect-support',
        userAgent: navigator.userAgent.substring(0, 50)
      });
      addLog('✅ Page view записано успішно');
      setResults({ success: true, data: result });
    } catch (error) {
      addLog(`❌ Помилка page view: ${error.message}`);
      setResults({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testProductEvent = async () => {
    setLoading(true);
    addLog('🛍️ Тестування product event з redirect...');
    
    try {
      const result = await GoogleSheetsAnalytics.trackProductEvent(
        'product_view', 
        'gravel-0516', 
        { 
          category: 'gravel', 
          testType: 'redirect-support',
          price: '500' 
        }
      );
      addLog('✅ Product event записано успішно');
      setResults({ success: true, data: result });
    } catch (error) {
      addLog(`❌ Помилка product event: ${error.message}`);
      setResults({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testBatch = async () => {
    setLoading(true);
    addLog('📦 Тестування batch відправки з redirect...');
    
    try {
      const events = [
        {
          timestamp: Date.now(),
          date: new Date().toISOString().split('T')[0],
          event_type: 'batch_test_1',
          product_id: 'batch-product-1',
          user_id: 'batch-user',
          source: 'react-test',
          extra_data: JSON.stringify({ batch: true, index: 1, redirect: true })
        },
        {
          timestamp: Date.now() + 1,
          date: new Date().toISOString().split('T')[0],
          event_type: 'batch_test_2', 
          product_id: 'batch-product-2',
          user_id: 'batch-user',
          source: 'react-test',
          extra_data: JSON.stringify({ batch: true, index: 2, redirect: true })
        }
      ];

      const result = await GoogleSheetsAnalytics.sendEvents(events);
      addLog(`✅ Batch з ${events.length} подій записано успішно`);
      setResults({ success: true, data: result });
    } catch (error) {
      addLog(`❌ Помилка batch: ${error.message}`);
      setResults({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🧪 Тестування аналітики з redirect підтримкою</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>📋 Конфігурація</h3>
        <p><strong>Script URL:</strong> {process.env.REACT_APP_ANALYTICS_SCRIPT_URL}</p>
        <p><strong>Enabled:</strong> {process.env.REACT_APP_ANALYTICS_ENABLED}</p>
        <p><strong>Redirect Support:</strong> ✅ Увімкнено в fetch запитах</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>🔧 Тести</h3>
        <button 
          onClick={testConnection} 
          disabled={loading}
          style={{ padding: '10px 20px', margin: '5px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Тест підключення
        </button>
        <button 
          onClick={testPageView} 
          disabled={loading}
          style={{ padding: '10px 20px', margin: '5px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Тест Page View
        </button>
        <button 
          onClick={testProductEvent} 
          disabled={loading}
          style={{ padding: '10px 20px', margin: '5px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Тест Product Event
        </button>
        <button 
          onClick={testBatch} 
          disabled={loading}
          style={{ padding: '10px 20px', margin: '5px', backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: '4px' }}
        >
          Тест Batch
        </button>
      </div>

      {loading && (
        <div style={{ padding: '10px', backgroundColor: '#fff3cd', borderRadius: '5px', marginBottom: '20px' }}>
          🔄 Виконується тест...
        </div>
      )}

      {results && (
        <div style={{ marginBottom: '20px' }}>
          <h3>📊 Результати</h3>
          <div 
            style={{ 
              padding: '15px', 
              borderRadius: '5px', 
              backgroundColor: results.success ? '#d4edda' : '#f8d7da',
              color: results.success ? '#155724' : '#721c24'
            }}
          >
            <h4>{results.success ? '✅ SUCCESS' : '❌ ERROR'}</h4>
            <pre style={{ whiteSpace: 'pre-wrap', overflow: 'auto' }}>
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        </div>
      )}

      <div>
        <h3>📝 Лог</h3>
        <div 
          style={{ 
            height: '300px', 
            overflow: 'auto', 
            backgroundColor: '#f8f9fa', 
            padding: '10px', 
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '12px'
          }}
        >
          {logs.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
        </div>
        <button 
          onClick={() => setLogs([])}
          style={{ marginTop: '10px', padding: '5px 10px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Очистити лог
        </button>
      </div>
    </div>
  );
};

export default AnalyticsTest;