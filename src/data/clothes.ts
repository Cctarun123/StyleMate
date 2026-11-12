import { Clothing, TemperatureBand } from '../types';

const image = (id: string) => `https://images.unsplash.com/photo-${id}?q=80&w=600&fit=auto&fm=jpg`;

export const CLOTHES: Clothing[] = [
  // Below 10°C — puffer jackets, thermal wear, wool sweaters
  { id: 1, title: 'Puffer Jacket', price: 3499, gender: 'unisex', kind: 'jacket', minTemp: -5, maxTemp: 10, rainOk: true, query: 'puffer jacket', image: image('1599944785031-3750a0e2239f') },
  { id: 2, title: 'Wool Overcoat', price: 5999, gender: 'men', kind: 'jacket', minTemp: 0, maxTemp: 12, rainOk: true, query: 'wool coat', image: image('1515886657611-9608a3a50f72') },
  { id: 3, title: 'Thermal Innerwear Set', price: 899, gender: 'unisex', kind: 'sweater', minTemp: -5, maxTemp: 10, rainOk: false, query: 'thermal wear', image: image('1570945976777-9b1a57380cb7') },
  { id: 4, title: 'Wool Cardigan', price: 2499, gender: 'women', kind: 'sweater', minTemp: 0, maxTemp: 12, rainOk: false, query: 'wool sweater', image: image('1517829657187-e589e43441f6') },
  { id: 5, title: 'Knit Sweater', price: 1799, gender: 'men', kind: 'sweater', minTemp: 2, maxTemp: 12, rainOk: false, query: 'knit sweater', image: image('1552248881-a1e4e2c6d33b') },
  { id: 6, title: 'Fleece Hoodie', price: 2199, gender: 'unisex', kind: 'hoodie', minTemp: 2, maxTemp: 14, rainOk: false, query: 'fleece hoodie', image: image('1556912157-6b70e3e8e3e9') },

  // 10–15°C — hoodies, denim jackets, sweatshirts
  { id: 7, title: 'Denim Jacket', price: 2999, gender: 'unisex', kind: 'jacket', minTemp: 10, maxTemp: 16, rainOk: false, query: 'denim jacket', image: image('1576782753325-5bf3702579da') },
  { id: 8, title: 'Sweatshirt', price: 1599, gender: 'men', kind: 'hoodie', minTemp: 10, maxTemp: 17, rainOk: false, query: 'sweatshirt', image: image('1536599363-d3a0f9f5e3b5') },
  { id: 9, title: 'Zip Hoodie', price: 1899, gender: 'women', kind: 'hoodie', minTemp: 10, maxTemp: 18, rainOk: false, query: 'zip hoodie', image: image('1583394788625-a3d3a9a0f7a2') },
  { id: 10, title: 'Trench Coat', price: 4499, gender: 'unisex', kind: 'jacket', minTemp: 8, maxTemp: 16, rainOk: true, query: 'trench coat', image: image('1591437195679-531536aef3d4') },
  { id: 11, title: 'Light Wool Sweater', price: 1699, gender: 'men', kind: 'sweater', minTemp: 10, maxTemp: 18, rainOk: false, query: 'wool sweater', image: image('1599566150159-3b99a964297c') },
  { id: 12, title: 'Quilted Jacket', price: 3199, gender: 'women', kind: 'jacket', minTemp: 8, maxTemp: 16, rainOk: true, query: 'quilted jacket', image: image('1607082348722-785da847522f') },

  // 15–20°C — light jackets, full-sleeve tees, shirts
  { id: 13, title: 'Bomber Jacket', price: 2799, gender: 'men', kind: 'jacket', minTemp: 15, maxTemp: 22, rainOk: false, query: 'bomber jacket', image: image('1563267806-56172a420e3a') },
  { id: 14, title: 'Full Sleeve Tee', price: 799, gender: 'unisex', kind: 'tshirt', minTemp: 15, maxTemp: 24, rainOk: false, query: 'full sleeve tee', image: image('1521592712012-82996836a47e') },
  { id: 15, title: 'Oxford Shirt', price: 1999, gender: 'men', kind: 'shirt', minTemp: 16, maxTemp: 24, rainOk: false, query: 'oxford shirt', image: image('1595794994620-81258764f3c1') },
  { id: 16, title: 'Light Blazer', price: 3599, gender: 'unisex', kind: 'jacket', minTemp: 16, maxTemp: 24, rainOk: false, query: 'light blazer', image: image('1581654353545-d0bb8788f8d5') },
  { id: 17, title: 'Chino Trousers', price: 1799, gender: 'men', kind: 'jeans', minTemp: 15, maxTemp: 26, rainOk: false, query: 'chino trousers', image: image('1578942672669-3e7c0541c6b4') },
  { id: 18, title: 'Silk Blouse', price: 2299, gender: 'women', kind: 'shirt', minTemp: 18, maxTemp: 26, rainOk: false, query: 'silk blouse', image: image('1515378770-5004a7c4024c') },

  // 20–26°C — cotton tees, casual shirts, kurtas, jeans
  { id: 19, title: 'Cotton Tee', price: 599, gender: 'unisex', kind: 'tshirt', minTemp: 20, maxTemp: 28, rainOk: false, query: 'cotton tee', image: image('1555306645-3998c33c36b5') },
  { id: 20, title: 'Casual Shirt', price: 1299, gender: 'men', kind: 'shirt', minTemp: 20, maxTemp: 28, rainOk: false, query: 'casual shirt', image: image('1602814314685-c7650804590f') },
  { id: 21, title: 'Cotton Kurta', price: 1499, gender: 'men', kind: 'kurta', minTemp: 20, maxTemp: 30, rainOk: false, query: 'cotton kurta', image: image('1597496168627-4c1e1c7b9b10') },
  { id: 22, title: 'Printed Kurta', price: 1699, gender: 'women', kind: 'kurta', minTemp: 20, maxTemp: 30, rainOk: false, query: 'printed kurta', image: image('1572717387277-a7093b6e624b') },
  { id: 23, title: 'Denim Jeans', price: 2499, gender: 'unisex', kind: 'jeans', minTemp: 18, maxTemp: 28, rainOk: false, query: 'denim jeans', image: image('1542003748-c5c2a46c0bf1') },
  { id: 24, title: 'Linen Shirt', price: 1799, gender: 'men', kind: 'shirt', minTemp: 22, maxTemp: 30, rainOk: false, query: 'linen shirt', image: image('1583639113934-018f449c9f5e') },

  // 26–32°C — linen shirts, half-sleeve tees, light kurtas
  { id: 25, title: 'Half Sleeve Tee', price: 549, gender: 'unisex', kind: 'tshirt', minTemp: 26, maxTemp: 34, rainOk: false, query: 'half sleeve tee', image: image('1586765480782-47f3c2dae3a1') },
  { id: 26, title: 'Linen Kurta', price: 1599, gender: 'men', kind: 'kurta', minTemp: 26, maxTemp: 34, rainOk: false, query: 'linen kurta', image: image('1565243231435-206408593844') },
  { id: 27, title: 'Tank Top', price: 499, gender: 'unisex', kind: 'tshirt', minTemp: 28, maxTemp: 36, rainOk: false, query: 'tank top', image: image('1534528741775-53994a69daeb') },
  { id: 28, title: 'Cotton Dress', price: 1999, gender: 'women', kind: 'dress', minTemp: 26, maxTemp: 34, rainOk: false, query: 'summer dress', image: image('1572638789199-33425b09d1e9') },
  { id: 29, title: 'Short Sleeve Shirt', price: 1299, gender: 'men', kind: 'shirt', minTemp: 26, maxTemp: 34, rainOk: false, query: 'short sleeve shirt', image: image('1592944294018-6c7a8a4e3067') },
  { id: 30, title: 'Chiffon Top', price: 1399, gender: 'women', kind: 'shirt', minTemp: 26, maxTemp: 34, rainOk: false, query: 'chiffon top', image: image('1525965602561-92288d33c975') },

  // Above 32°C — shorts, tank tops, cotton dresses, caps
  { id: 31, title: 'Cotton Shorts', price: 899, gender: 'unisex', kind: 'shorts', minTemp: 30, maxTemp: 42, rainOk: false, query: 'cotton shorts', image: image('1579685134770-e7d3b8d3c603') },
  { id: 32, title: 'Denim Shorts', price: 1099, gender: 'men', kind: 'shorts', minTemp: 30, maxTemp: 42, rainOk: false, query: 'denim shorts', image: image('1595366710039-98875e5e9a06') },
  { id: 33, title: 'Cotton Dress', price: 1799, gender: 'women', kind: 'dress', minTemp: 30, maxTemp: 42, rainOk: false, query: 'cotton dress', image: image('1572770611395-84f9c294329f') },
  { id: 34, title: 'Tank Top', price: 449, gender: 'women', kind: 'tshirt', minTemp: 30, maxTemp: 42, rainOk: false, query: 'tank top', image: image('1526230293547-84a7f5c7e109') },
  { id: 35, title: 'Sun Cap', price: 399, gender: 'unisex', kind: 'cap', minTemp: 28, maxTemp: 42, rainOk: false, query: 'sun cap', image: image('1592187445815-16a22a2bdc9d') },
  { id: 36, title: 'Linen Shorts', price: 1199, gender: 'men', kind: 'shorts', minTemp: 28, maxTemp: 40, rainOk: false, query: 'linen shorts', image: image('1600585154334-be6197b22a62') },

  // Rain items (rainOk)
  { id: 37, title: 'Raincoat', price: 1299, gender: 'unisex', kind: 'raincoat', minTemp: 18, maxTemp: 28, rainOk: true, query: 'raincoat', image: image('1573150954053-7269d3da8c04') },
  { id: 38, title: 'Windcheater', price: 1499, gender: 'men', kind: 'raincoat', minTemp: 16, maxTemp: 26, rainOk: true, query: 'windcheater', image: image('1594623286655-3c47c6b5e6e5') },
  { id: 39, title: 'Waterproof Jacket', price: 2699, gender: 'women', kind: 'raincoat', minTemp: 14, maxTemp: 24, rainOk: true, query: 'waterproof jacket', image: image('1578690297241-963339350b2d') },
  { id: 40, title: 'Travel Poncho', price: 699, gender: 'unisex', kind: 'raincoat', minTemp: 18, maxTemp: 30, rainOk: true, query: 'travel poncho', image: image('1569604780738-353dd0a07e9c') },
];

export const BAND_LABELS: Record<TemperatureBand, string> = {
  'below-10': 'Cold',
  '10-15': 'Chilly',
  '15-20': 'Cool',
  '20-26': 'Pleasant',
  '26-32': 'Warm',
  'above-32': 'Hot',
};
