import React from "react";
import { Pressable, Image, StyleSheet } from "react-native";
import { Product } from "../types";
import { theme, surface, text } from "../utils/theme";
import { AppText } from "./AppText";

type Props = { item: Product; onPress: (id: number) => void; index?: number };

function ProductCard({ item, onPress, index }: Props) {
  return (
    <Pressable style={s.card} onPress={() => onPress(item.id)}>
      {index !== undefined && (
        <AppText variant="label" style={s.index}>
          {String(index + 1).padStart(2, '0')}
        </AppText>
      )}
      <Image source={{ uri: item.image }} style={s.img} resizeMode="cover" />
      <AppText variant="mono" style={s.price}>
        ${item.price}
      </AppText>
      <AppText variant="heading" style={s.title}>
        {item.title.toUpperCase()}
      </AppText>
      <AppText variant="mono" color={theme.colors.accent} style={s.view}>
        VIEW PIECE ↗
      </AppText>
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
    fontSize: 11,
    zIndex: 1,
  },
  img: { height: 170, width: '100%', backgroundColor: theme.colors.surface, marginBottom: 10 },
  price: {
    ...text.label(),
    fontSize: 14,
    marginBottom: 4,
  },
  title: {
    ...text.heading(),
    fontSize: 14,
    marginBottom: 10,
  },
  view: {
    ...text.label(),
    fontSize: 10,
    color: theme.colors.accent,
  },
});
