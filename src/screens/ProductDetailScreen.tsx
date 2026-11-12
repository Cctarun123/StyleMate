import { useState } from 'react';
import { View, Image, ScrollView, StyleSheet, Pressable } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useWardrobe } from '../context/WardrobeContext';
import { useCart } from '../context/CartContext';
import { sheet, text, useTheme, radius } from '../utils/theme';
import { formatPrice } from '../utils/outfit';
import { Button } from '../components/Button';
import { AppText } from '../components/AppText';
import { CLOTHES } from '../data/clothes';
import {
  SAVE_TO_WARDROBE,
  REMOVE_FROM_WARDROBE,
  BACK_TO_SHOP,
  DETAILS_HEADING,
  ADD_TO_CART,
  SIZE_LABEL,
} from '../constants/strings';

type ProductDetailRouteParams = {
  ProductDetail: { id: number };
};

export default function ProductDetailScreen() {
  const navigation = useNavigation();
  const { params } = useRoute<RouteProp<ProductDetailRouteParams, 'ProductDetail'>>();
  const { add, remove, isSaved } = useWardrobe();
  const { add: addToCart } = useCart();
  const { colors } = useTheme();
  const [imageError, setImageError] = useState(false);
  const [size, setSize] = useState('M');

  const product = CLOTHES.find((item) => item.id === params.id);

  if (!product)
    return (
      <View style={sheet.center(colors)}>
        <AppText variant="label" color={colors.text}>
          Item not found.
        </AppText>
      </View>
    );

  const saved = isSaved(product.id);

  const styles = StyleSheet.create({
    content: { paddingBottom: 80 },
    imageCard: {
      backgroundColor: colors.tile,
      borderRadius: 24,
      overflow: 'hidden',
      marginHorizontal: 20,
      marginTop: 10,
      marginBottom: 16,
      height: 420,
      alignItems: 'center',
      justifyContent: 'center',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    fallback: {
      fontSize: 40,
      color: colors.subtext,
    },
    heart: {
      position: 'absolute',
      top: 14,
      right: 14,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    pad: { paddingHorizontal: 20 },
    title: {
      ...text.title(colors),
      fontSize: 24,
      lineHeight: 32,
      marginBottom: 8,
    },
    price: {
      ...text.price(colors),
      fontSize: 18,
      lineHeight: 24,
      marginBottom: 14,
    },
    sizeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 10,
      marginBottom: 14,
    },
    sizeLabel: {
      ...text.label(colors),
      color: colors.subtext,
      marginRight: 8,
      fontSize: 12,
    },
    chip: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: 8,
      alignItems: 'center',
    },
    chipSelected: {
      backgroundColor: colors.dark,
      borderColor: colors.dark,
    },
    chipText: { color: colors.subtext, fontSize: 12 },
    chipTextSelected: { color: colors.onDark, fontWeight: '700' as const },
    detailsHeading: {
      ...text.heading(colors),
      marginBottom: 8,
    },
    description: {
      ...text.body(colors),
      lineHeight: 22,
    },
    bottomBar: {
      flexDirection: 'row',
      backgroundColor: colors.bg,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      padding: 10,
      gap: 8,
    },
  });

  return (
    <>
      <ScrollView style={sheet.page(colors)} contentContainerStyle={styles.content}>
        <View style={styles.imageCard}>
          {!imageError ? (
            <Image
              source={{ uri: product.image }}
              style={styles.image}
              resizeMode="cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <Ionicons name="image-outline" size={60} color={colors.subtext} />
          )}
          <Pressable
            style={styles.heart}
            onPress={(e: any) => {
              e.stopPropagation();
              if (saved) {
                remove(product.id);
              } else {
                add(product);
              }
            }}
          >
            <Ionicons
              name={saved ? 'heart' : 'heart-outline'}
              size={24}
              color={saved ? colors.dark : colors.subtext}
            />
          </Pressable>
        </View>
        <View style={styles.pad}>
          <AppText variant="title" style={styles.title}>
            {product.title}
          </AppText>
          <AppText variant="price" style={styles.price}>
            {formatPrice(product.price)}
          </AppText>
          <View style={styles.sizeRow}>
            <AppText variant="label" style={styles.sizeLabel}>
              {SIZE_LABEL}
            </AppText>
            {['S', 'M', 'L', 'XL'].map((sz) => (
              <Pressable
                key={sz}
                style={[styles.chip, size === sz && styles.chipSelected]}
                onPress={() => setSize(sz)}
              >
                <AppText
                  variant="label"
                  style={size === sz ? [styles.chipText, styles.chipTextSelected] : styles.chipText}
                >
                  {sz}
                </AppText>
              </Pressable>
            ))}
          </View>
          <Button title={ADD_TO_CART} onPress={() => addToCart(product, size)} variant="primary" fullWidth />
          <AppText variant="heading" style={styles.detailsHeading}>
            {DETAILS_HEADING}
          </AppText>
          <AppText variant="body" style={styles.description}>
            {product.title} — {formatPrice(product.price)}. Weather-appropriate pick for your wardrobe.
          </AppText>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button
          title={saved ? REMOVE_FROM_WARDROBE : SAVE_TO_WARDROBE}
          onPress={() => (saved ? remove(product.id) : add(product))}
          variant={saved ? 'outline' : 'primary'}
          style={{ flex: 1 }}
        />
        <Button
          title={BACK_TO_SHOP}
          onPress={() => navigation.goBack()}
          variant="outline"
          style={{ flex: 1 }}
        />
      </View>
    </>
  );
}
