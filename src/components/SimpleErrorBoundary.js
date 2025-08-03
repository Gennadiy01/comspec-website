import React from 'react';
import { handleError } from '../utils/simpleErrorHandler';

class SimpleErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    handleError(error, 'React Error Boundary');
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center',
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          margin: '20px 0'
        }}>
          <h3 style={{ 
            color: '#495057',
            marginBottom: '15px',
            fontSize: '1.5rem'
          }}>
            🔧 Щось пішло не так
          </h3>
          <p style={{ 
            color: '#6c757d',
            marginBottom: '20px',
            fontSize: '1rem'
          }}>
            Перезавантажте сторінку або зверніться до адміністратора
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
          >
            Перезавантажити
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default SimpleErrorBoundary;