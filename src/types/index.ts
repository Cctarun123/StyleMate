export type OutfitCategory = 'jackets' | 'light' | 'casual';

export type Product = {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
};

export type Gender = 'men' | 'women' | 'unisex';

export type ClothingKind =
  | 'jacket'
  | 'sweater'
  | 'hoodie'
  | 'tshirt'
  | 'shirt'
  | 'jeans'
  | 'shorts'
  | 'kurta'
  | 'raincoat'
  | 'dress'
  | 'cap';

export type TemperatureBand =
  | 'below-10'
  | '10-15'
  | '15-20'
  | '20-26'
  | '26-32'
  | 'above-32';

export type Clothing = {
  id: number;
  title: string;
  price: number; // Indian rupees
  gender: Gender;
  kind: ClothingKind;
  minTemp: number;
  maxTemp: number;
  rainOk: boolean;
  image: string;
};

export type Weather = {
  temperature: number;
  condition: string;
  code: number;
};
