import { Product, OutfitCategory } from '../types';

const OUTFIT_KEYWORDS: Record<OutfitCategory, string[]> = {
  jackets: ['jacket', 'coat', 'windbreaker'],
  light: ['t-shirt', 'tee', 'short sleeve', 'tank'],
  casual: [],
};

export function filterProductsByOutfit(products: Product[], category: OutfitCategory): Product[] {
  const keywords = OUTFIT_KEYWORDS[category];
  if (keywords.length === 0) {
    // 'casual' matches everything else.
    return products.slice();
  }
  const filtered = products.filter((product) =>
    keywords.some((keyword) => product.title.toLowerCase().includes(keyword))
  );
  return filtered.length > 0 ? filtered : products.slice();
}
