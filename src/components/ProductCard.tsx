import React from "react";
import { Pressable, Image, Text, StyleSheet } from "react-native";
import { Product } from "../types";
import { theme, surface, border, text } from "../utils/theme";

type Props = { item: Product; onPress: (id: number) => void; index?: number };

function ProductCard({ item, onPress, index }: Props) {
  return (
    <Pressable style={s.card} onPress={() => onPress(item.id)}>
      {index !== undefined && (
        <Text style={s.index}>{String(index + 1).padStart(2, '0')}</Text>
      )}
      <Image source={{ uri: item.image }} style={s.img} resizeMode="cover" />
      <Text style={s.price}>${item.price}</Text>
      <Text style={s.title}>{item.title}</Text>
      <Text style={s.view}>VIEW ↗</Text>
    </Pressable>
  );
}

export default React.memo(ProductCard);

const s = StyleSheet.create({
  card: {
    ...surface,
    width: '100%',
    padding: 14,
    marginBottom: 14,
  },
  index: {
    ...text.label(),
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: theme.colors.bg,
    color: theme.colors.subtext,
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontSize: 10,
  },
  img: { height: 170, width: '100%', backgroundColor: theme.colors.surface, marginBottom: 10 },
  price: {
    ...text.label(),
    fontSize: 12,
    marginBottom: 4,
  },
  title: {
    ...text.heading(),
    fontSize: 15,
    marginBottom: 10,
  },
  view: {
    ...text.label(),
    fontSize: 10,
  },
});
