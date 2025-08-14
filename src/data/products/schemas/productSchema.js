// Схема структури товару COMSPEC
// Визначає всі можливі поля товару та їх типи

export const ProductSchema = {
  // === БАЗОВА ІНФОРМАЦІЯ ===
  id: {
    type: "string",
    required: true,
    unique: true,
    example: "gravel-granite-5-20-premium"
  },
  
  title: {
    type: "string", 
    required: true,
    example: "Щебінь гранітний 5-20 преміум"
  },
  
  shortTitle: {
    type: "string",
    required: false,
    example: "Щебінь 5-20", // Для карток товарів
    maxLength: 25
  },

  category: {
    type: "string",
    required: true,
    enum: ["gravel", "sand", "asphalt", "concrete"],
    example: "gravel"
  },

  categoryName: {
    type: "string",
    required: true,
    example: "Щебінь"
  },

  subcategory: {
    type: "string",
    required: false,
    example: "granite", // granite, limestone, decorative
    filtereable: true
  },

  // === ЦІНА ТА НАЯВНІСТЬ ===
  price: {
    type: "number",
    required: true,
    example: 850,
    filterable: true,
    min: 0,
    max: 10000
  },

  currency: {
    type: "string",
    required: true,
    default: "грн/тонна",
    example: "грн/т", // Для щебеню використовується "грн/т", для інших категорій свої формати
    description: "Одиниця виміру ціни. Для щебеню - 'грн/т', для бетону - 'грн/м³', тощо"
  },

  priceValidUntil: {
    type: "string",
    required: false,
    format: "YYYY-MM-DD",
    example: "2025-08-20", // Дата до якої діє поточна ціна
    description: "Дата до якої діє поточна ціна. При null - ціна без обмежень"
  },

  inStock: {
    type: "boolean",
    required: true,
    default: true,
    filterable: true
  },

  availability: {
    type: "string",
    required: false,
    enum: ["in_stock", "on_order", "out_of_stock"],
    default: "in_stock",
    filterable: true
  },

  // === ОСНОВНІ ХАРАКТЕРИСТИКИ (ФІЛЬТРОВАНІ) ===
  specifications: {
    type: "object",
    required: true,
    properties: {
      // УНІВЕРСАЛЬНІ ХАРАКТЕРИСТИКИ
      fraction: {
        type: "string",
        example: "5-20 мм",
        filterable: true,
        category: "all"
      },
      
      density: {
        type: "string", 
        example: "1.4-1.5 т/м³",
        filterable: true,
        category: "all"
      },

      // ЩЕБІНЬ
      strength: {
        type: "string",
        example: "М1200",
        filterable: true,
        category: "gravel",
        enum: ["М800", "М1000", "М1200", "М1400"]
      },

      frost_resistance: {
        type: "string",
        example: "F300",
        filterable: true,
        category: "gravel",
        enum: ["F50", "F100", "F150", "F200", "F300", "F400"]
      },

      rock_type: {
        type: "string",
        example: "granite",
        filterable: true,
        category: "gravel",
        enum: ["granite", "limestone", "gravel", "decorative"]
      },

      // ПІСОК
      sand_type: {
        type: "string",
        example: "river",
        filterable: true,
        category: "sand",
        enum: ["river", "quarry", "construction", "fine", "coarse"]
      },

      module_size: {
        type: "number",
        example: 2.5,
        filterable: true,
        category: "sand",
        min: 1.0,
        max: 4.0
      },

      clay_content: {
        type: "string",
        example: "< 3%",
        filterable: true,
        category: "sand"
      },

      // БЕТОН
      concrete_grade: {
        type: "string",
        example: "М200",
        filterable: true,
        category: "concrete",
        enum: ["М100", "М150", "М200", "М250", "М300", "М350", "М400", "М450", "М500"]
      },

      concrete_class: {
        type: "string",
        example: "B15",
        filterable: true,
        category: "concrete",
        enum: ["B7.5", "B10", "B12.5", "B15", "B20", "B22.5", "B25", "B30", "B35"]
      },

      workability: {
        type: "string",
        example: "П3",
        filterable: true,
        category: "concrete",
        enum: ["П1", "П2", "П3", "П4", "П5"]
      },

      // АСФАЛЬТ
      asphalt_type: {
        type: "string",
        example: "hot",
        filterable: true,
        category: "asphalt",
        enum: ["hot", "cold", "warm"]
      },

      asphalt_grade: {
        type: "string", 
        example: "Тип А",
        filterable: true,
        category: "asphalt",
        enum: ["Тип А", "Тип Б", "Тип В", "Тип Г"]
      },

      max_grain_size: {
        type: "string",
        example: "20 мм",
        filterable: true,
        category: "asphalt"
      }
    }
  },

  // === ВЛАСТИВОСТІ ДЛЯ ВІДОБРАЖЕННЯ ===
  properties: {
    type: "array",
    required: true,
    example: ["Морозостійкий", "Високої міцності", "Фракція 5-20 мм"],
    maxItems: 5
  },

  description: {
    type: "string",
    required: true,
    example: "Високоміцний щебінь для будівництва доріг та фундаментів",
    maxLength: 200
  },

  detailedDescription: {
    type: "string",
    required: false,
    example: "Детальний опис для сторінки товару...",
    maxLength: 1000
  },

  // === ЗОБРАЖЕННЯ ===
  image: {
    type: "string",
    required: true,
    example: "/images/products/gravel-granite-5-20.jpg"
  },

  imageAlt: {
    type: "string",
    required: false,
    example: "Щебінь гранітний фракції 5-20 мм"
  },


  // === СЕРТИФІКАТИ ===
  certificates: {
    type: "array",
    required: false,
    example: ["dstu", "iso_9001", "quality_certificate"],
    filterable: true
  },

  // === ДОДАТКОВІ ФІЛЬТРИ ===
  tags: {
    type: "array",
    required: false,
    example: ["premium", "eco_friendly", "fast_delivery"],
    filterable: true
  },

  isPopular: {
    type: "boolean",
    required: false,
    default: false,
    filterable: true
  },

  isNew: {
    type: "boolean", 
    required: false,
    default: false,
    filterable: true
  },

  isRecommended: {
    type: "boolean",
    required: false,
    default: false,
    filterable: true
  },

  // === МЕТАДАНІ ===
  createdAt: {
    type: "string",
    required: false,
    format: "ISO 8601",
    example: "2025-08-12T10:00:00Z"
  },

  updatedAt: {
    type: "string",
    required: false,
    format: "ISO 8601",
    example: "2025-08-12T15:30:00Z"
  },

  sortOrder: {
    type: "number",
    required: false,
    example: 100,
    description: "Порядок відображення в категорії"
  },

  // === SEO ===
  seo: {
    type: "object",
    required: false,
    properties: {
      metaTitle: {
        type: "string",
        maxLength: 60,
        example: "Щебінь гранітний 5-20 - купити в Києві | COMSPEC"
      },
      metaDescription: {
        type: "string", 
        maxLength: 160,
        example: "Високоякісний щебінь гранітний фракції 5-20 мм. Доставка по Києву та області. Сертифікована продукція. ☎ 073 9 27 27 00"
      },
      keywords: {
        type: "array",
        example: ["щебінь", "гранітний", "5-20", "будівельний матеріал"]
      }
    }
  }
};

// === КОНФІГУРАЦІЯ ФІЛЬТРІВ ===
export const FilterConfig = {
  // Фільтри, які відображаються для всіх категорій
  global: [
    "price",
    "inStock", 
    "availability",
    "isPopular",
    "isNew"
  ],

  // Фільтри специфічні для категорій
  byCategory: {
    gravel: [
      "specifications.fraction",
      "specifications.strength", 
      "specifications.frost_resistance",
      "specifications.rock_type",
      "subcategory"
    ],
    sand: [
      "specifications.fraction",
      "specifications.sand_type",
      "specifications.module_size",
      "specifications.clay_content"
    ],
    concrete: [
      "specifications.concrete_grade",
      "specifications.concrete_class", 
      "specifications.workability",
      "specifications.frost_resistance"
    ],
    asphalt: [
      "specifications.asphalt_type",
      "specifications.asphalt_grade",
      "specifications.max_grain_size"
    ]
  }
};

// === ПРИКЛАДИ ПОВНИХ ТОВАРІВ ===
export const ExampleProducts = {
  gravel: {
    id: "gravel-granite-5-20-premium",
    title: "Щебінь гранітний 5-20 преміум",
    shortTitle: "Щебінь 5-20",
    category: "gravel",
    categoryName: "Щебінь", 
    subcategory: "granite",
    price: 850,
    currency: "грн/т",
    priceValidUntil: "2025-09-01",
    inStock: true,
    availability: "in_stock",
    specifications: {
      fraction: "5-20 мм",
      density: "1.4-1.5 т/м³",
      strength: "М1200",
      frost_resistance: "F300",
      rock_type: "granite"
    },
    properties: ["Морозостійкий", "Високої міцності", "Фракція 5-20 мм"],
    description: "Високоміцний щебінь для будівництва доріг та фундаментів",
    image: "/images/products/gravel-granite-5-20.jpg",
    certificates: ["dstu", "iso_9001"],
    isPopular: true,
    sortOrder: 100
  },

  concrete: {
    id: "concrete-m200-b15", 
    title: "Бетон М200 (B15)",
    shortTitle: "Бетон М200",
    category: "concrete",
    categoryName: "Бетон",
    price: 1800,
    currency: "грн/м³",
    priceValidUntil: null,
    inStock: true,
    availability: "in_stock",
    specifications: {
      concrete_grade: "М200",
      concrete_class: "B15",
      workability: "П3",
      frost_resistance: "F100",
      density: "2.3-2.5 т/м³"
    },
    properties: ["Марка М200", "B15", "Морозостійкий F100"],
    description: "Товарний бетон марки М200 для загального будівництва",
    image: "/images/products/concrete-m200.jpg",
    certificates: ["dstu"],
    isRecommended: true,
    sortOrder: 200
  }
};

export default ProductSchema;