import React, { memo } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../types';
import { useWardrobe } from '../context/WardrobeContext';
import { radius, text, useTheme } from '../utils/theme';
import { AppText } from './AppText';

type Props = {
  item: Product;
  onPress: (id: number) => void;
};

function ProductTile({ item, onPress }: Props) {
  const { colors } = useTheme();
  const { add, remove, isSaved } = useWardrobe();
  const saved = isSaved(item.id);

  const styles = StyleSheet.create({
    tile: {
      backgroundColor: colors.tile,
      borderRadius: radius.md,
      padding: 12,
      width: '48%',
      alignItems: 'center',
    },
    imageWrap: {
      position: 'relative',
      width: '100%',
      aspectRatio: 1,
      backgroundColor: colors.card,
      borderRadius: radius.sm,
      overflow: 'hidden',
      marginBottom: 8,
    },
    image: {
      width: '100%',
      height: '100%',
    },
    heart: {
      position: 'absolute',
      top: 6,
      right: 6,
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      ...text.body(colors),
      fontSize: 13,
      lineHeight: 18,
      textAlign: 'center',
      marginBottom: 6,
    },
    price: {
      ...text.price(colors),
      textAlign: 'center',
    },
  });

  return (
    <Pressable style={styles.tile} onPress={() => onPress(item.id)}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: item.image }} style={styles.image} resizeMode="contain" />
        <Pressable
          style={styles.heart}
          onPress={(e) => {
            e.stopPropagation();
            if (saved) {
              remove(item.id);
            } else {
              add(item);
            }
          }}
        >
          <Ionicons
            name={saved ? 'heart' : 'heart-outline'}
            size={22}
            color={saved ? colors.dark : colors.subtext}
          />
        </Pressable>
      </View>
      <AppText variant="body" style={styles.title} numberOfLines={2}>
        {item.title}
      </AppText>
      <AppText variant="price" style={styles.price}>
        ${item.price}
      </AppText>
    </Pressable>
  );
}

export default memo(ProductTile);
