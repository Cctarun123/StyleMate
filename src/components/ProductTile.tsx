import React, { memo, useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Clothing } from '../types';
import { clothesImages } from '../data/clothesImages';
import { useWardrobe } from '../context/WardrobeContext';
import { radius, text, useTheme } from '../utils/theme';
import { formatPrice } from '../utils/outfit';
import { AppText } from './AppText';

type Props = {
  item: Clothing;
  onPress: (id: number) => void;
};

function ProductTile({ item, onPress }: Props) {
  const { colors } = useTheme();
  const { add, remove, isSaved } = useWardrobe();
  const saved = isSaved(item.id);
  const [imageError, setImageError] = useState(false);
  const imageSource = clothesImages[item.id];

  const styles = StyleSheet.create({
    tile: {
      backgroundColor: colors.tile,
      borderRadius: radius.md,
      padding: 12,
      width: '100%',
      alignItems: 'center',
    },
    imageWrap: {
      position: 'relative',
      width: '100%',
      height: 150,
      backgroundColor: colors.card,
      borderRadius: radius.sm,
      overflow: 'hidden',
      marginBottom: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    image: {
      width: '100%',
      height: 150,
    },
    fallback: {
      fontSize: 40,
      color: colors.subtext,
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
      textAlign: 'left',
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
        {imageSource != null && !imageError ? (
          <Image
            source={imageSource}
            style={styles.image}
            resizeMode="contain"
            onError={() => setImageError(true)}
          />
        ) : (
          <Ionicons name="image-outline" size={44} color={colors.subtext} />
        )}
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
        {formatPrice(item.price)}
      </AppText>
    </Pressable>
  );
}

export default memo(ProductTile);
