import { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, ActivityIndicator, Pressable, StyleSheet } from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useWardrobe } from "../context/WardrobeContext";
import { Product } from "../types";

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

  if (error) return <View style={s.center}><Text>Failed to load item.</Text></View>;
  if (!product) return <View style={s.center}><ActivityIndicator size="large" /></View>;

  const saved = isSaved(product.id);
  const onToggle = () => (saved ? remove(product.id) : add(product));

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Image source={{ uri: product.image }} style={s.img} resizeMode="contain" />
      <Text style={s.title}>{product.title}</Text>
      <Text style={s.price}>${product.price}</Text>
      <Text style={s.desc}>{product.description}</Text>
      <Pressable style={s.button} onPress={onToggle}>
        <Text style={s.buttonText}>{saved ? 'Remove from wardrobe' : 'Save to wardrobe'}</Text>
      </Pressable>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  img: { height: 260, width: "100%" },
  title: { fontSize: 20, fontWeight: "600", marginTop: 12 },
  price: { fontSize: 18, fontWeight: "700", marginVertical: 8 },
  desc: { fontSize: 14, color: "#444" },
  button: { marginTop: 16, paddingVertical: 10, paddingHorizontal: 16, backgroundColor: "#1e6fb5", borderRadius: 8, alignSelf: "flex-start" },
  buttonText: { color: "#fff", fontWeight: "600" },
});