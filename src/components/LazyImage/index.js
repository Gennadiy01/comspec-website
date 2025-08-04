import LazyImage from './LazyImage';

export { default } from './LazyImage';

// Готові варіанти для різних випадків використання
export const ProductImage = (props) => (
  <LazyImage 
    width="300px" 
    height="200px" 
    objectFit="cover"
    placeholder="/images/product-placeholder.jpg"
    {...props} 
  />
);

export const HeroImage = (props) => (
  <LazyImage 
    priority={true} // Завантажувати одразу
    width="100%" 
    height="400px"
    objectFit="cover"
    {...props} 
  />
);

export const AvatarImage = (props) => (
  <LazyImage 
    width="50px" 
    height="50px" 
    objectFit="cover"
    placeholder="/images/avatar-placeholder.svg"
    className="rounded-circle"
    {...props} 
  />
);