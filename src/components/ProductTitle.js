import React from 'react';
import { wrapFractionsInTitle } from '../data/products/productsAPI';

/**
 * Компонент для відображення заголовку товару з захистом фракцій від розривів
 * @param {Object} props
 * @param {string} props.title - Заголовок товару
 * @param {string} props.tag - HTML тег (h1, h2, h3, тощо)
 * @param {Object} props.style - Додаткові CSS стилі
 * @param {string} props.className - CSS класи
 * @returns {JSX.Element}
 */
const ProductTitle = ({ 
  title, 
  tag: Tag = 'h3', 
  style = {}, 
  className = '',
  ...props 
}) => {
  if (!title) return null;

  const titleParts = wrapFractionsInTitle(title);
  
  // Якщо функція повернула рядок (немає фракцій), відображаємо як є
  if (typeof titleParts === 'string') {
    return (
      <Tag className={className} style={style} {...props}>
        {titleParts}
      </Tag>
    );
  }
  
  // Якщо є фракції, рендеримо з no-wrap обгортками
  return (
    <Tag className={className} style={style} {...props}>
      {titleParts.map((part, index) => {
        if (typeof part === 'string') {
          return part;
        }
        
        if (part.type === 'nowrap') {
          return (
            <span 
              key={index} 
              style={{ whiteSpace: 'nowrap' }}
            >
              {part.content}
            </span>
          );
        }
        
        return part;
      })}
    </Tag>
  );
};

export default ProductTitle;