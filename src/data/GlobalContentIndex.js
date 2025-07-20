// GlobalContentIndex.js - Статичний індекс з усім контентом сайту COMSPEC
export const globalContentIndex = [
  // ========================================
  // ГОЛОВНА СТОРІНКА (/) 
  // ========================================
  
  // Hero секція
  {
    id: 'hero-main-heading',
    title: 'Час будувати разом!',
    content: 'Високоякісні будівельні матеріали з доставкою по всій Україні',
    category: 'Головна',
    page: '/',
    section: '#hero',
    url: '/#hero',
    keywords: ['будувати', 'матеріали', 'доставка', 'україна', 'comspec', 'час', 'разом'],
    type: 'hero',
    weight: 10
  },

  // Продукція на головній сторінці
  {
    id: 'home-product-gravel',
    title: 'Щебінь',
    content: 'Високоякісний щебінь різних фракцій для будівництва',
    category: 'Продукція',
    page: '/',
    section: '#products',
    url: '/#products',
    keywords: ['щебінь', 'фракції', 'будівництво', 'високоякісний', 'гранітний'],
    type: 'product',
    weight: 8
  },
  {
    id: 'home-product-sand',
    title: 'Пісок',
    content: 'Річковий та кар\'єрний пісок для різних видів робіт',
    category: 'Продукція',
    page: '/',
    section: '#products',
    url: '/#products',
    keywords: ['пісок', 'річковий', 'кар\'єрний', 'роботи', 'будівельний'],
    type: 'product',
    weight: 8
  },
  {
    id: 'home-product-asphalt',
    title: 'Асфальт',
    content: 'Асфальтобетонні суміші для дорожнього покриття',
    category: 'Продукція',
    page: '/',
    section: '#products',
    url: '/#products',
    keywords: ['асфальт', 'асфальтобетонні', 'суміші', 'дорожній', 'покриття'],
    type: 'product',
    weight: 8
  },
  {
    id: 'home-product-concrete',
    title: 'Бетон',
    content: 'Готові бетонні суміші різних марок міцності',
    category: 'Продукція',
    page: '/',
    section: '#products',
    url: '/#products',
    keywords: ['бетон', 'готові', 'суміші', 'марки', 'міцність', 'товарний'],
    type: 'product',
    weight: 8
  },

  // Послуги на головній сторінці
  {
    id: 'home-service-delivery',
    title: 'Доставка',
    content: 'Власним автотранспортом та залізничними вагонами',
    category: 'Послуги',
    page: '/',
    section: '#services',
    url: '/#services',
    keywords: ['доставка', 'автотранспорт', 'залізниця', 'вагони', 'власний'],
    type: 'service',
    weight: 7
  },
  {
    id: 'home-service-mining',
    title: 'Розробка родовищ',
    content: 'Повний цикл розробки кар\'єрів та видобутку',
    category: 'Послуги',
    page: '/',
    section: '#services',
    url: '/#services',
    keywords: ['розробка', 'родовища', 'кар\'єри', 'видобуток', 'цикл'],
    type: 'service',
    weight: 7
  },
  {
    id: 'home-service-equipment',
    title: 'Оренда спецтехніки',
    content: 'Сучасна техніка для будівельних робіт',
    category: 'Послуги',
    page: '/',
    section: '#services',
    url: '/#services',
    keywords: ['оренда', 'спецтехніка', 'сучасна', 'техніка', 'будівельні'],
    type: 'service',
    weight: 7
  },

  // Переваги
  {
    id: 'home-benefit-expertise',
    title: 'Експертиза для Вашого успіху',
    content: 'Багаторічний досвід у галузі видобутку та постачання',
    category: 'Переваги',
    page: '/',
    section: '#benefits',
    url: '/#benefits',
    keywords: ['експертиза', 'успіх', 'досвід', 'видобуток', 'постачання'],
    type: 'benefit',
    weight: 6
  },
  {
    id: 'home-benefit-quality',
    title: 'Гарантія якості',
    content: 'Вся продукція сертифікована та відповідає стандартам',
    category: 'Переваги',
    page: '/',
    section: '#benefits',
    url: '/#benefits',
    keywords: ['гарантія', 'якість', 'сертифікована', 'стандарти'],
    type: 'benefit',
    weight: 6
  },
  {
    id: 'home-benefit-pricing',
    title: 'Прозорі ціни',
    content: 'Чесне ціноутворення без прихованих платежів',
    category: 'Переваги',
    page: '/',
    section: '#benefits',
    url: '/#benefits',
    keywords: ['прозорі', 'ціни', 'чесне', 'ціноутворення', 'платежі'],
    type: 'benefit',
    weight: 6
  },
  {
    id: 'home-benefit-delivery',
    title: 'Швидка доставка',
    content: 'Оперативна доставка в зручний для вас час',
    category: 'Переваги',
    page: '/',
    section: '#benefits',
    url: '/#benefits',
    keywords: ['швидка', 'доставка', 'оперативна', 'зручний', 'час'],
    type: 'benefit',
    weight: 6
  },

  // Відгуки клієнтів
  {
    id: 'review-budinvest',
    title: 'Відгук ТОВ "БудІнвест"',
    content: 'Співпрацюємо з COMSPEC вже 3 роки. Завжди якісна продукція та своєчасна доставка.',
    category: 'Відгуки',
    page: '/',
    section: '#reviews',
    url: '/#reviews',
    keywords: ['відгук', 'буд інвест', 'співпраця', 'якість', 'доставка', 'роки'],
    type: 'review',
    weight: 5
  },
  {
    id: 'review-contractor',
    title: 'Відгук приватного підрядника',
    content: 'Відмінна якість щебню, використовую для фундаментних робіт. Рекомендую!',
    category: 'Відгуки',
    page: '/',
    section: '#reviews',
    url: '/#reviews',
    keywords: ['відгук', 'щебінь', 'якість', 'фундамент', 'підрядник', 'рекомендую'],
    type: 'review',
    weight: 5
  },
  {
    id: 'review-dorozhnik',
    title: 'Відгук ПрАТ "Дорожник"',
    content: 'Професійний підхід та конкурентні ціни. Надійний партнер для великих проектів.',
    category: 'Відгуки',
    page: '/',
    section: '#reviews',
    url: '/#reviews',
    keywords: ['відгук', 'дорожник', 'професійний', 'ціни', 'партнер', 'проекти'],
    type: 'review',
    weight: 5
  },

  // ========================================
  // СТОРІНКА ПРОДУКЦІЇ (/products)
  // ========================================

  // Щебінь
  {
    id: 'product-granite-5-20',
    title: 'Щебінь гранітний 5-20',
    content: 'Високоміцний щебінь для будівництва доріг та фундаментів. Морозостійкий, високої міцності, фракція 5-20 мм. Ціна: 850 грн/тонна.',
    category: 'Продукція',
    page: '/products',
    section: '#granite-5-20',
    url: '/products#granite-5-20',
    keywords: ['щебінь', 'гранітний', '5-20', 'фракція', 'морозостійкий', 'міцність', 'дороги', 'фундамент'],
    type: 'product',
    weight: 9
  },
  {
    id: 'product-granite-5-10',
    title: 'Щебінь гранітний 5-10',
    content: 'Високоміцний щебінь для будівництва доріг та фундаментів. Морозостійкий, високої міцності, фракція 5-10 мм. Ціна: 350 грн/тонна.',
    category: 'Продукція',
    page: '/products',
    section: '#granite-5-10',
    url: '/products#granite-5-10',
    keywords: ['щебінь', 'гранітний', '5-10', 'фракція', 'морозостійкий'],
    type: 'product',
    weight: 9
  },
  {
    id: 'product-granite-20-40',
    title: 'Щебінь гранітний 20-40',
    content: 'Крупний щебінь для масивних конструкцій. Морозостійкий, високої міцності, фракція 20-40 мм. Ціна: 820 грн/тонна.',
    category: 'Продукція',
    page: '/products',
    section: '#granite-20-40',
    url: '/products#granite-20-40',
    keywords: ['щебінь', 'гранітний', '20-40', 'крупний', 'конструкції', 'масивні'],
    type: 'product',
    weight: 9
  },
  {
    id: 'product-limestone-10-20',
    title: 'Щебінь вапняковий 10-20',
    content: 'Вапняковий щебінь для дорожнього будівництва. Економний, середньої міцності, фракція 10-20 мм. Ціна: 750 грн/тонна.',
    category: 'Продукція',
    page: '/products',
    section: '#limestone-10-20',
    url: '/products#limestone-10-20',
    keywords: ['щебінь', 'вапняковий', '10-20', 'дорожній', 'економний'],
    type: 'product',
    weight: 9
  },

  // Пісок
  {
    id: 'product-sand-river',
    title: 'Пісок річковий митий',
    content: 'Чистий річковий пісок для будівельних робіт. Митий, без глинистих домішок, фракція 0-5 мм. Ціна: 420 грн/тонна.',
    category: 'Продукція',
    page: '/products',
    section: '#sand-river',
    url: '/products#sand-river',
    keywords: ['пісок', 'річковий', 'митий', 'чистий', 'домішки', 'будівельні'],
    type: 'product',
    weight: 9
  },
  {
    id: 'product-sand-quarry',
    title: 'Пісок кар\'єрний',
    content: 'Кар\'єрний пісок для різних видів робіт. Природний, економний, фракція 0-5 мм. Ціна: 380 грн/тонна.',
    category: 'Продукція',
    page: '/products',
    section: '#sand-quarry',
    url: '/products#sand-quarry',
    keywords: ['пісок', 'кар\'єрний', 'природний', 'економний'],
    type: 'product',
    weight: 9
  },
  {
    id: 'product-sand-construction',
    title: 'Пісок будівельний',
    content: 'Універсальний будівельний пісок. Сертифікований, універсальний, фракція 0-3 мм. Ціна: 400 грн/тонна.',
    category: 'Продукція',
    page: '/products',
    section: '#sand-construction',
    url: '/products#sand-construction',
    keywords: ['пісок', 'будівельний', 'універсальний', 'сертифікований'],
    type: 'product',
    weight: 9
  },

  // Асфальт
  {
    id: 'product-asphalt-hot',
    title: 'Асфальт гарячий',
    content: 'Гаряча асфальтобетонна суміш для дорожнього покриття. Тип А, гарячий, високої якості. Ціна: 1200 грн/тонна.',
    category: 'Продукція',
    page: '/products',
    section: '#asphalt-hot',
    url: '/products#asphalt-hot',
    keywords: ['асфальт', 'гарячий', 'асфальтобетонна', 'суміш', 'дорожній'],
    type: 'product',
    weight: 9
  },
  {
    id: 'product-asphalt-cold',
    title: 'Асфальт холодний',
    content: 'Холодна асфальтобетонна суміш для ремонтних робіт. Тип Б, холодний, для ремонту. Ціна: 1100 грн/тонна.',
    category: 'Продукція',
    page: '/products',
    section: '#asphalt-cold',
    url: '/products#asphalt-cold',
    keywords: ['асфальт', 'холодний', 'ремонтні', 'ремонт'],
    type: 'product',
    weight: 9
  },

  // Бетон
  {
    id: 'product-concrete-m200',
    title: 'Бетон М200',
    content: 'Товарний бетон марки М200 для загального будівництва. Марка М200, B15, морозостійкий F100. Ціна: 1800 грн/м³.',
    category: 'Продукція',
    page: '/products',
    section: '#concrete-m200',
    url: '/products#concrete-m200',
    keywords: ['бетон', 'м200', 'товарний', 'будівництво', 'морозостійкий'],
    type: 'product',
    weight: 9
  },
  {
    id: 'product-concrete-m300',
    title: 'Бетон М300',
    content: 'Товарний бетон марки М300 для відповідальних конструкцій. Марка М300, B22.5, морозостійкий F150. Ціна: 2000 грн/м³.',
    category: 'Продукція',
    page: '/products',
    section: '#concrete-m300',
    url: '/products#concrete-m300',
    keywords: ['бетон', 'м300', 'відповідальні', 'конструкції'],
    type: 'product',
    weight: 9
  },
  {
    id: 'product-concrete-m400',
    title: 'Бетон М400',
    content: 'Високоміцний бетон для спеціальних конструкцій. Марка М400, B30, морозостійкий F200. Ціна: 2200 грн/м³.',
    category: 'Продукція',
    page: '/products',
    section: '#concrete-m400',
    url: '/products#concrete-m400',
    keywords: ['бетон', 'м400', 'високоміцний', 'спеціальні', 'конструкції'],
    type: 'product',
    weight: 9
  },

  // ========================================
  // СТОРІНКА ПОСЛУГ (/services)
  // ========================================

  // Доставка
  {
    id: 'service-railway-delivery',
    title: 'Доставка залізницею',
    content: 'Економна доставка великих партій залізничними вагонами по всій Україні. Великі об\'єми від 50 тонн, економна ціна, доставка в будь-який регіон.',
    category: 'Послуги',
    page: '/services',
    section: '#railway-delivery',
    url: '/services#railway-delivery',
    keywords: ['доставка', 'залізниця', 'вагони', 'партії', 'економна', 'регіон'],
    type: 'service',
    weight: 8
  },
  {
    id: 'service-truck-delivery',
    title: 'Доставка автотранспортом',
    content: 'Швидка та гнучка доставка власним автопарком. Оперативна доставка, гнучкий графік, точне дозування, доставка на об\'єкт.',
    category: 'Послуги',
    page: '/services',
    section: '#truck-delivery',
    url: '/services#truck-delivery',
    keywords: ['доставка', 'автотранспорт', 'автопарк', 'оперативна', 'графік', 'об\'єкт'],
    type: 'service',
    weight: 8
  },

  // Спецтехніка
  {
    id: 'service-drilling',
    title: 'Буріння',
    content: 'Професійне буріння свердловин різного призначення. Бурові установки СБУ-125, УРБ-2А2.',
    category: 'Послуги',
    page: '/services',
    section: '#drilling',
    url: '/services#drilling',
    keywords: ['буріння', 'свердловини', 'професійне', 'установки'],
    type: 'service',
    weight: 7
  },
  {
    id: 'service-excavation',
    title: 'Екскавація',
    content: 'Земляні роботи та розробка котлованів. Екскаватори Caterpillar, Komatsu.',
    category: 'Послуги',
    page: '/services',
    section: '#excavation',
    url: '/services#excavation',
    keywords: ['екскавація', 'земляні', 'роботи', 'котловани', 'екскаватори'],
    type: 'service',
    weight: 7
  },
  {
    id: 'service-loading',
    title: 'Навантаження',
    content: 'Навантаження матеріалів на транспорт. Навантажувачі CAT, JCB.',
    category: 'Послуги',
    page: '/services',
    section: '#loading',
    url: '/services#loading',
    keywords: ['навантаження', 'матеріали', 'транспорт', 'навантажувачі'],
    type: 'service',
    weight: 7
  },
  {
    id: 'service-crushing',
    title: 'Дроблення',
    content: 'Дроблення каменю та виробництво щебню. Дробильні комплекси Sandvik.',
    category: 'Послуги',
    page: '/services',
    section: '#crushing',
    url: '/services#crushing',
    keywords: ['дроблення', 'камінь', 'виробництво', 'щебінь', 'комплекси'],
    type: 'service',
    weight: 7
  },

  // Розробка родовищ
  {
    id: 'service-surveying',
    title: 'Маркшейдерські роботи',
    content: 'Топографічні зйомки та планування робіт. Включає топографічну зйомку, підрахунок запасів, планування робіт, контроль якості.',
    category: 'Послуги',
    page: '/services',
    section: '#surveying',
    url: '/services#surveying',
    keywords: ['маркшейдерські', 'топографічні', 'зйомки', 'планування', 'запаси'],
    type: 'service',
    weight: 7
  },
  {
    id: 'service-boring',
    title: 'Бурові роботи',
    content: 'Буріння розвідувальних та підривних свердловин. Розвідувальне буріння, підривні свердловини, інженерно-геологічні дослідження.',
    category: 'Послуги',
    page: '/services',
    section: '#boring',
    url: '/services#boring',
    keywords: ['бурові', 'розвідувальні', 'підривні', 'свердловини', 'дослідження'],
    type: 'service',
    weight: 7
  },
  {
    id: 'service-blasting',
    title: 'Вибухові роботи',
    content: 'Професійне проведення підривних робіт. Проектування підривів, підготовка зарядів, проведення підриву, забезпечення безпеки.',
    category: 'Послуги',
    page: '/services',
    section: '#blasting',
    url: '/services#blasting',
    keywords: ['вибухові', 'підривні', 'заряди', 'підрив', 'безпека'],
    type: 'service',
    weight: 7
  },

  // ========================================
  // СТОРІНКА ПРО НАС (/about)
  // ========================================

  {
    id: 'about-mission',
    title: 'Місія COMSPEC',
    content: 'Забезпечення будівельної галузі України високоякісними матеріалами, що відповідають найсуворішим стандартам якості та екологічної безпеки.',
    category: 'Про нас',
    page: '/about',
    section: '#mission',
    url: '/about#mission',
    keywords: ['місія', 'галузь', 'україни', 'стандарти', 'екологічна', 'безпека'],
    type: 'about',
    weight: 8
  },
  {
    id: 'about-history-1995',
    title: 'Заснування 1995',
    content: 'Компанія COMSPEC була заснована як невелике підприємство з видобутку щебню. Початковий капітал склав 50 тисяч доларів.',
    category: 'Про нас',
    page: '/about',
    section: '#history',
    url: '/about#history',
    keywords: ['заснування', '1995', 'підприємство', 'видобуток', 'капітал'],
    type: 'about',
    weight: 7
  },

  // ========================================
  // СТОРІНКА СТАТЕЙ (/articles)
  // ========================================

  {
    id: 'article-gravel-foundation',
    title: 'Як вибрати правильний щебінь для фундаменту',
    content: 'Детальний гід по вибору щебню для різних типів фундаментів. Розглядаємо фракції, марки міцності та особливості застосування.',
    category: 'Статті',
    page: '/articles',
    section: '#article-1',
    url: '/articles/1',
    keywords: ['вибрати', 'щебінь', 'фундамент', 'фракції', 'міцність', 'застосування'],
    type: 'article',
    weight: 8
  },
  {
    id: 'article-asphalt-production',
    title: 'Технологія виробництва асфальтобетонних сумішей',
    content: 'Сучасні технології виробництва асфальту, контроль якості та особливості застосування різних типів сумішей.',
    category: 'Статті',
    page: '/articles',
    section: '#article-2',
    url: '/articles/2',
    keywords: ['технологія', 'виробництво', 'асфальтобетонні', 'суміші', 'контроль'],
    type: 'article',
    weight: 8
  },

  // ========================================
  // СТОРІНКА КОНТАКТІВ (/contacts)
  // ========================================

  {
    id: 'contacts-sales-office',
    title: 'Відділ продажів',
    content: 'Адреса, Київ, Харківське шосе, 17-А. Телефони: 073 927 27 00, 044 527 47 00. Email: sales@comspec.ua',
    category: 'Контакти',
    page: '/contacts',
    section: '#sales',
    url: '/contacts#sales',
    keywords: ['відділ', 'продажів', 'київ', 'промислова', 'телефон', 'email'],
    type: 'contact',
    weight: 9
  },
  {
    id: 'contacts-main-office',
    title: 'Головний офіс',
    content: 'Адреса, 02090, Київ, Харківське шосе, 17-А., оф. 3. Телефон: 044 527 47 00. Email: comspec@comspec.ua',
    category: 'Контакти',
    page: '/contacts',
    section: '#office',
    url: '/contacts#office',
    keywords: ['головний', 'офіс', 'перемоги', 'київ', 'телефон', 'інфо'],
    type: 'contact',
    weight: 9
  },

  // ========================================
  // ЗАГАЛЬНІ ЗАПИСИ ПРО КОМПАНІЮ
  // ========================================

  {
    id: 'company-overview',
    title: 'COMSPEC - будівельні матеріали',
    content: 'Виробництво та постачання щебню, піску, асфальту, бетону. Власні кар\'єри, сучасне обладнання, доставка по Україні.',
    category: 'Компанія',
    page: '/',
    section: '#company',
    url: '/',
    keywords: ['comspec', 'виробництво', 'постачання', 'обладнання', 'україна'],
    type: 'general',
    weight: 10
  },
  {
    id: 'company-quality',
    title: 'Контроль якості',
    content: 'Власна лабораторія, сертифікація ISO 9001, паспорти якості на кожну партію, відповідність державним стандартам.',
    category: 'Якість',
    page: '/about',
    section: '#quality',
    url: '/about#quality',
    keywords: ['контроль', 'якість', 'лабораторія', 'сертифікація', 'стандарти'],
    type: 'quality',
    weight: 8
  },
  {
    id: 'company-ecology',
    title: 'Екологічна відповідальність',
    content: 'Сертифікат ISO 14001:2015, екологічний менеджмент, дотримання природоохоронних норм, рекультивація земель.',
    category: 'Екологія',
    page: '/about',
    section: '#ecology',
    url: '/about#ecology',
    keywords: ['екологічна', 'відповідальність', 'природоохоронні', 'рекультивація'],
    type: 'ecology',
    weight: 7
  },

  // ========================================
  // ДОДАТКОВІ ЗАПИСИ ДЛЯ ПОВНОГО ПОКРИТТЯ
  // ========================================

  // Сегменти бізнесу (з Home.js)
  {
    id: 'segment-companies',
    title: 'Для компаній',
    content: 'Оптові ціни, індивідуальні умови, постійна підтримка, гнучка система оплати',
    category: 'Сегменти',
    page: '/',
    section: '#segments',
    url: '/#segments',
    keywords: ['компанії', 'оптові', 'ціни', 'індивідуальні', 'підтримка'],
    type: 'segment',
    weight: 6
  },
  {
    id: 'segment-individuals',
    title: 'Для приватних осіб',
    content: 'Роздрібні майданчики, зручне розташування, доступні ціни, консультації фахівців',
    category: 'Сегменти',
    page: '/',
    section: '#segments',
    url: '/#segments',
    keywords: ['приватні', 'роздрібні', 'майданчики', 'доступні', 'консультації'],
    type: 'segment',
    weight: 6
  },

  // Новини компанії (з Articles.js)
  {
    id: 'news-iso-certificate',
    title: 'COMSPEC отримала сертифікат ISO 14001:2015',
    content: 'Наша компанія успішно пройшла сертифікацію системи екологічного менеджменту згідно міжнародного стандарту.',
    category: 'Новини',
    page: '/articles',
    section: '#news',
    url: '/articles/4',
    keywords: ['новини', 'сертифікат', 'iso', 'екологічний', 'менеджмент'],
    type: 'news',
    weight: 7
  },
  {
    id: 'news-new-equipment',
    title: 'Нове обладнання на заводі в Броварах',
    content: 'Введено в експлуатацію нову лінію з виробництва бетону потужністю 120 м³/год. Підвищення якості та продуктивності.',
    category: 'Новини',
    page: '/articles',
    section: '#news',
    url: '/articles/6',
    keywords: ['обладнання', 'бровари', 'бетон', 'потужність', 'продуктивність'],
    type: 'news',
    weight: 7
  },

  // Додаткові статті (з Articles.js)
  {
    id: 'article-sand-types',
    title: 'Класифікація та властивості будівельного піску',
    content: 'Детальний огляд типів піску, їх характеристик та сфер застосування в сучасному будівництві.',
    category: 'Статті',
    page: '/articles',
    section: '#article-7',
    url: '/articles/7',
    keywords: ['класифікація', 'властивості', 'пісок', 'характеристики', 'застосування'],
    type: 'article',
    weight: 8
  },
  {
    id: 'article-paving-stones',
    title: 'Поради з укладання тротуарної плитки',
    content: 'Технологія підготовки основи, правильне укладання та догляд за тротуарною плиткою.',
    category: 'Статті',
    page: '/articles',
    section: '#article-8',
    url: '/articles/8',
    keywords: ['поради', 'укладання', 'тротуарна', 'плитка', 'технологія'],
    type: 'article',
    weight: 8
  },
  {
    id: 'article-winter-concrete',
    title: 'Секрети якісного бетонування в зимовий період',
    content: 'Практичні поради щодо роботи з бетоном при низьких температурах. Добавки, обігрів та контроль твердіння.',
    category: 'Статті',
    page: '/articles',
    section: '#article-3',
    url: '/articles/3',
    keywords: ['бетонування', 'зимовий', 'температури', 'добавки', 'обігрів'],
    type: 'article',
    weight: 8
  },
  {
    id: 'article-sand-calculation',
    title: 'Розрахунок необхідної кількості піску для стяжки',
    content: 'Покрокова інструкція для розрахунку об\'єму піску, цементу та інших матеріалів для різних типів стяжки.',
    category: 'Статті',
    page: '/articles',
    section: '#article-5',
    url: '/articles/5',
    keywords: ['розрахунок', 'пісок', 'стяжка', 'об\'єм', 'цемент', 'інструкція'],
    type: 'article',
    weight: 8
  },

  // Калькулятор (з Contacts.js)
  {
    id: 'calculator-cost',
    title: 'Калькулятор вартості',
    content: 'Розрахунок вартості матеріалів з урахуванням типу продукції, кількості та відстані доставки.',
    category: 'Інструменти',
    page: '/contacts',
    section: '#calculator',
    url: '/contacts#calculator',
    keywords: ['калькулятор', 'вартість', 'розрахунок', 'продукція', 'доставка'],
    type: 'tool',
    weight: 8
  },

  // Партнери (з About.js)
  {
    id: 'partners-overview',
    title: 'Наші партнери',
    content: 'Довготривала співпраця з провідними компаніями України: ПАТ "Київавтодор", ТОВ "БудІнвест", ПрАТ "Дорожник"',
    category: 'Партнери',
    page: '/about',
    section: '#partners',
    url: '/about#partners',
    keywords: ['партнери', 'співпраця', 'київавтодор', 'провідні', 'компанії'],
    type: 'partners',
    weight: 7
  },

  // Цінності компанії (з About.js)
  {
    id: 'values-quality',
    title: 'Якість',
    content: 'Використання сучасних технологій та контроль на всіх етапах виробництва',
    category: 'Цінності',
    page: '/about',
    section: '#values',
    url: '/about#values',
    keywords: ['якість', 'технології', 'контроль', 'етапи', 'виробництво'],
    type: 'value',
    weight: 6
  },
  {
    id: 'values-reliability',
    title: 'Надійність',
    content: 'Дотримання зобов\'язань та термінів поставок',
    category: 'Цінності',
    page: '/about',
    section: '#values',
    url: '/about#values',
    keywords: ['надійність', 'зобов\'язання', 'терміни', 'поставки'],
    type: 'value',
    weight: 6
  },
  {
    id: 'values-innovation',
    title: 'Інновації',
    content: 'Впровадження передових рішень у виробництві',
    category: 'Цінності',
    page: '/about',
    section: '#values',
    url: '/about#values',
    keywords: ['інновації', 'передові', 'рішення', 'впровадження'],
    type: 'value',
    weight: 6
  },

  // Історія компанії - додаткові етапи (з About.js)
  {
    id: 'history-2001-expansion',
    title: 'Розширення виробництва 2001',
    content: 'Придбання нових кар\'єрів та сучасного обладнання. Початок виробництва асфальтобетонних сумішей та товарного бетону.',
    category: 'Історія',
    page: '/about',
    section: '#history',
    url: '/about#history',
    keywords: ['розширення', '2001', 'обладнання', 'асфальтобетонні', 'товарний'],
    type: 'history',
    weight: 6
  },
  {
    id: 'history-2008-certification',
    title: 'Сертифікація 2008',
    content: 'Отримання міжнародних сертифікатів якості ISO 9001:2008. Впровадження систем контролю якості.',
    category: 'Історія',
    page: '/about',
    section: '#history',
    url: '/about#history',
    keywords: ['сертифікація', '2008', 'міжнародні', 'системи', 'контроль'],
    type: 'history',
    weight: 6
  },
  {
    id: 'history-2015-modernization',
    title: 'Модернізація 2015',
    content: 'Повна модернізація виробництва, впровадження екологічно чистих технологій та автоматизація процесів.',
    category: 'Історія',
    page: '/about',
    section: '#history',
    url: '/about#history',
    keywords: ['модернізація', '2015', 'екологічно', 'автоматизація'],
    type: 'history',
    weight: 6
  },
  {
    id: 'history-2020-digitalization',
    title: 'Цифровізація 2020',
    content: 'Впровадження цифрових технологій, онлайн-сервісів для клієнтів та системи відстеження якості в реальному часі.',
    category: 'Історія',
    page: '/about',
    section: '#history',
    url: '/about#history',
    keywords: ['цифровізація', '2020', 'онлайн', 'відстеження', 'реальний'],
    type: 'history',
    weight: 6
  },

  // Проекти компанії
  {
    id: 'about-project-kyiv-odesa',
    title: 'Реконструкція траси Київ-Одеса',
    content: 'Постачання 15000 тонн щебню для реконструкції автомобільної траси. Використані матеріали: щебінь гранітний 5-20, щебінь гранітний 20-40.',
    category: 'Проекти',
    page: '/about',
    section: '#projects',
    url: '/about#projects',
    keywords: ['реконструкція', 'траса', 'київ', 'одеса', 'щебінь', 'автомобільна'],
    type: 'project',
    weight: 7
  },
  {
    id: 'about-project-sunny-complex',
    title: 'Будівництво ЖК "Сонячний"',
    content: 'Комплексне постачання будівельних матеріалів для житлового комплексу. Бетон М200-М400, пісок річковий, щебінь.',
    category: 'Проекти',
    page: '/about',
    section: '#projects',
    url: '/about#projects',
    keywords: ['будівництво', 'житловий', 'комплекс', 'сонячний', 'комплексне'],
    type: 'project',
    weight: 7
  },
  {
    id: 'project-boryspil-airport',
    title: 'Розширення аеропорту Бориспіль',
    content: 'Постачання матеріалів для будівництва нової злітно-посадкової смуги. Асфальт, щебінь спеціальний, пісок кварцовий.',
    category: 'Проекти',
    page: '/about',
    section: '#projects',
    url: '/about#projects',
    keywords: ['аеропорт', 'бориспіль', 'злітно-посадкова', 'смуга', 'кварцовий'],
    type: 'project',
    weight: 7
  },
  {
    id: 'project-dnipro-bridge',
    title: 'Міст через Дніпро',
    content: 'Виробництво спеціального високоміцного бетону для мостових конструкцій. Бетон М500, добавки спеціальні.',
    category: 'Проекти',
    page: '/about',
    section: '#projects',
    url: '/about#projects',
    keywords: ['міст', 'дніпро', 'високоміцний', 'мостові', 'конструкції'],
    type: 'project',
    weight: 7
  },

  // Технічні характеристики (додаткова інформація)
  {
    id: 'technical-laboratory',
    title: 'Власна лабораторія',
    content: 'Сучасна лабораторія з контролю якості продукції. Сертифікація та паспорти якості на кожну партію.',
    category: 'Технології',
    page: '/about',
    section: '#laboratory',
    url: '/about#laboratory',
    keywords: ['лабораторія', 'сучасна', 'сертифікація', 'паспорти', 'партія'],
    type: 'technical',
    weight: 7
  },
  {
    id: 'technical-equipment',
    title: 'Сучасне обладнання',
    content: 'Власний парк техніки: 50+ одиниць автотранспорту, сучасні дробильні комплекси, бетонні заводи.',
    category: 'Технології',
    page: '/about',
    section: '#equipment',
    url: '/about#equipment',
    keywords: ['обладнання', 'парк', 'техніки', 'дробильні', 'заводи'],
    type: 'technical',
    weight: 7
  },

  // Географічне покриття
  {
    id: 'geography-ukraine',
    title: 'Доставка по всій Україні',
    content: 'Доставка будівельних матеріалів у всі регіони України. Автомобільний та залізничний транспорт.',
    category: 'Логістика',
    page: '/services',
    section: '#geography',
    url: '/services#geography',
    keywords: ['україна', 'регіони', 'автомобільний', 'залізничний', 'логістика'],
    type: 'geography',
    weight: 7
  },

  // Сертифікати та стандарти
  {
    id: 'certificates-iso9001',
    title: 'Сертифікат ISO 9001',
    content: 'Міжнародний стандарт системи менеджменту якості. Гарантія високих стандартів виробництва.',
    category: 'Сертифікати',
    page: '/about',
    section: '#certificates',
    url: '/about#certificates',
    keywords: ['сертифікат', 'iso', '9001', 'менеджмент', 'стандарти'],
    type: 'certificate',
    weight: 7
  },
  {
    id: 'certificates-iso14001',
    title: 'Сертифікат ISO 14001',
    content: 'Міжнародний стандарт екологічного менеджменту. Відповідальність за навколишнє середовище.',
    category: 'Сертифікати',
    page: '/about',
    section: '#certificates',
    url: '/about#certificates',
    keywords: ['iso', '14001', 'екологічний', 'навколишнє', 'середовище'],
    type: 'certificate',
    weight: 7
  },

  // Підписка на новини (з Articles.js)
  {
    id: 'newsletter-subscription',
    title: 'Підписка на новини',
    content: 'Отримуйте найсвіжіші статті, поради та новини компанії на свою електронну пошту',
    category: 'Сервіси',
    page: '/articles',
    section: '#newsletter',
    url: '/articles#newsletter',
    keywords: ['підписка', 'новини', 'статті', 'поради', 'пошта'],
    type: 'service',
    weight: 5
  },

  // Форма зворотного зв'язку (з Contacts.js)
  {
    id: 'feedback-form',
    title: 'Форма зворотного зв\'язку',
    content: 'Заповніть форму і ми зв\'яжемося з вами протягом 15 хвилин. Ім\'я, телефон, email, повідомлення.',
    category: 'Контакти',
    page: '/contacts',
    section: '#feedback',
    url: '/contacts#feedback',
    keywords: ['форма', 'зворотний', 'зв\'язок', 'хвилин', 'повідомлення'],
    type: 'contact',
    weight: 8
  },

  // Контакти - месенджери
  {
    id: 'contacts-messengers',
    title: 'Месенджери',
    content: 'Viber: +380739272700, Telegram: @comspec_ua. Швидкий зв\'язок через месенджери.',
    category: 'Контакти',
    page: '/contacts',
    section: '#messengers',
    url: '/contacts#messengers',
    keywords: ['месенджери', 'viber', 'telegram', 'швидкий', 'зв\'язок'],
    type: 'contact',
    weight: 8
  },

  // Додаткові досягнення компанії
  {
    id: 'about-achievement-experience',
    title: '28+ років досвіду',
    content: 'Успішна робота на ринку з 1995 року',
    category: 'Про нас',
    page: '/about',
    section: '#achievements',
    url: '/about#achievements',
    keywords: ['досвід', 'роки', 'успішна', 'ринок'],
    type: 'about',
    weight: 6
  },
  {
    id: 'about-achievement-facilities',
    title: '5 виробничих майданчиків',
    content: 'Власні кар\'єри та виробничі потужності',
    category: 'Про нас',
    page: '/about',
    section: '#achievements',
    url: '/about#achievements',
    keywords: ['виробничі', 'майданчики', 'кар\'єри', 'потужності'],
    type: 'about',
    weight: 6
  }
];

// Експорт додаткової інформації про індекс
export const indexStats = {
  totalRecords: globalContentIndex.length,
  lastUpdated: new Date().toISOString(),
  version: '3.1',
  categories: [...new Set(globalContentIndex.map(item => item.category))].length,
  pages: [...new Set(globalContentIndex.map(item => item.page))].length
};
