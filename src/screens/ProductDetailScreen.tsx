import { useState } from 'react';
import { View, Image, ScrollView, StyleSheet, Pressable } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useWardrobe } from '../context/WardrobeContext';
import { sheet, text, useTheme } from '../utils/theme';
import { formatPrice } from '../utils/outfit';
import { Button } from '../components/Button';
import { AppText } from '../components/AppText';
import { CLOTHES } from '../data/clothes';
import {
  SAVE_TO_WARDROBE,
  REMOVE_FROM_WARDROBE,
  BACK_TO_SHOP,
  DETAILS_HEADING,
} from '../constants/strings';

type ProductDetailRouteParams = {
  ProductDetail: { id: number };
};

export default function ProductDetailScreen() {
  const navigation = useNavigation();
  const { params } = useRoute<RouteProp<ProductDetailRouteParams, 'ProductDetail'>>();
  const { add, remove, isSaved } = useWardrobe();
  const { colors } = useTheme();
  const [imageError, setImageError] = useState(false);

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
