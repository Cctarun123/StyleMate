import { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useWardrobe } from "../context/WardrobeContext";
import { Product } from "../types";
import { theme, text, sheet } from "../utils/theme";
import { Button } from "../components/Button";

type ProductDetailRouteParams = {
  ProductDetail: { id: number };
};

export default function ProductDetailScreen() {
  const { params } = useRoute<RouteProp<ProductDetailRouteParams, "ProductDetail">>();
  const { add, remove, isSaved } = useWardrobe();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`https://fakestoreapi.com/products/${params.id}`)
      .then((r) => r.json())
      .then(setProduct)
      .catch(() => setError(true));
  }, [params.id]);

  if (error) return <View style={sheet.center()}><Text style={[text.label(), { color: theme.colors.accent }]}>Failed to load item.</Text></View>;
  if (!product) return <View style={sheet.center()}><ActivityIndicator size="large" color={theme.colors.text} /></View>;

  const saved = isSaved(product.id);

  return (
    <ScrollView style={sheet.page()} contentContainerStyle={s.content}>
      <Image source={{ uri: product.image }} style={s.img} resizeMode="cover" />
      <View style={s.pad}>
        <Text style={[text.heading(), s.title]}>{product.title.toUpperCase()}</Text>
        <Text style={[text.label(), s.price]}>${product.price}</Text>
        <Button
          title={saved ? 'REMOVE ↗' : 'SAVE TO LOCKER ↗'}
          onPress={() => (saved ? remove(product.id) : add(product))}
          variant={saved ? 'outline' : 'primary'}
          fullWidth
        />
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  content: { paddingBottom: 90 },
  img: { height: 420, width: '100%', backgroundColor: theme.colors.surface },
  pad: { padding: 20 },
  title: { fontSize: 40, letterSpacing: -1, marginBottom: 8 },
  price: { fontSize: 16, marginBottom: 22 },
});
