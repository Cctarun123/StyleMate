import { useCallback } from 'react';
import { FlatList, Image, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, CartItem } from '../types';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/outfit';
import { text, useTheme } from '../utils/theme';
import { clothesImages } from '../data/clothesImages';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import Screen from '../components/Screen';
import {
  CART_TITLE,
  CART_EMPTY,
  CART_SUBTOTAL,
  CART_DELIVERY,
  CART_DELIVERY_FREE,
  CART_TOTAL,
  CART_CHECKOUT,
  ORDER_CONTINUE_SHOPPING,
  SIZE_LABEL,
} from '../constants/strings';

type CartNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Cart'>;

export default function CartScreen() {
  const navigation = useNavigation<CartNavigationProp>();
  const { items, remove, setQty, total } = useCart();
  const { colors } = useTheme();

  const subtotal = total;
  const delivery = subtotal >= 999 ? 0 : 49;
  const grandTotal = subtotal + delivery;

  const onSetQty = useCallback(
    (id: number, size: string, quantity: number) => setQty(id, size, quantity),
    [setQty]
  );
  const onRemove = useCallback((id: number, size: string) => remove(id, size), [remove]);
  const onCheckout = useCallback(() => navigation.navigate('Checkout'), [navigation]);

  const renderItem = useCallback(
    ({ item }: { item: CartItem }) => (
      <View style={s.row}>
        <View style={s.thumbWrap}>
          {clothesImages[item.id] != null ? (
            <Image source={clothesImages[item.id]} style={s.thumb} resizeMode="cover" />
          ) : (
            <View style={s.thumbWrap}>
              <Ionicons name="image-outline" size={30} color={colors.subtext} />
            </View>
          )}
        </View>
        <View style={s.info}>
          <AppText variant="body" style={s.title}>
            {item.title}
          </AppText>
          <AppText variant="label" style={s.size}>
            {SIZE_LABEL}: {item.size}
          </AppText>
          <AppText variant="price" style={s.price}>
            {formatPrice(item.price)}
          </AppText>
        </View>
        <View style={s.controls}>
          <Pressable
            style={s.qtyButton}
            onPress={() => onSetQty(item.id, item.size, item.quantity - 1)}
          >
            <AppText variant="label">−</AppText>
          </Pressable>
          <AppText variant="body" style={s.qtyText}>
            {item.quantity}
          </AppText>
          <Pressable
            style={s.qtyButton}
            onPress={() => onSetQty(item.id, item.size, item.quantity + 1)}
          >
            <AppText variant="label">+</AppText>
          </Pressable>
          <Pressable style={s.remove} onPress={() => onRemove(item.id, item.size)}>
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
          </Pressable>
        </View>
      </View>
    ),
    [onSetQty, onRemove]
  );

  const s = StyleSheet.create({
    titleText: { paddingHorizontal: 16, paddingBottom: 12 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    thumbWrap: {
      width: 70,
      height: 70,
      borderRadius: 12,
      backgroundColor: colors.tile,
      overflow: 'hidden',
      marginRight: 12,
    },
    thumb: { width: '100%', height: '100%' },
    info: { flex: 1 },
    title: { marginBottom: 2 },
    size: {
      ...text.label(colors),
      color: colors.subtext,
      fontSize: 11,
      marginBottom: 2,
    },
    price: { ...text.price(colors) },
    controls: { flexDirection: 'row', alignItems: 'center' },
    qtyButton: { padding: 8 },
    qtyText: {
      ...text.body(colors),
      fontSize: 14,
      marginHorizontal: 6,
      minWidth: 24,
      textAlign: 'center',
    },
    remove: { padding: 6 },
    listContent: { paddingHorizontal: 20, paddingBottom: 16 },
    empty: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 60,
    },
    emptyText: { textAlign: 'center', marginTop: 16 },
    totals: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.bg,
    },
    totalsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    totalsRowTotal: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    totalsValue: {},
  });

  return (
    <Screen>
      <AppText variant="heading" style={s.titleText}>{CART_TITLE}</AppText>
      {items.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="cart-outline" size={64} color={colors.subtext} />
          <AppText variant="heading" style={s.emptyText}>
            {CART_EMPTY}
          </AppText>
          <Button
            title={ORDER_CONTINUE_SHOPPING}
            onPress={() => navigation.goBack()}
            variant="outline"
          />
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => `${item.id}-${item.size}`}
            renderItem={renderItem}
            contentContainerStyle={s.listContent}
          />
          <View style={s.totals}>
            <View style={s.totalsRow}>
              <AppText variant="body">{CART_SUBTOTAL}</AppText>
              <AppText variant="body" style={s.totalsValue}>
                {formatPrice(subtotal)}
              </AppText>
            </View>
            <View style={s.totalsRow}>
              <AppText variant="label">{CART_DELIVERY}</AppText>
              <AppText variant="label" style={s.totalsValue}>
                {delivery === 0 ? CART_DELIVERY_FREE : formatPrice(delivery)}
              </AppText>
            </View>
            <View style={s.totalsRowTotal}>
              <AppText variant="heading">{CART_TOTAL}</AppText>
              <AppText variant="heading" style={s.totalsValue}>
                {formatPrice(grandTotal)}
              </AppText>
            </View>
            <Button title={CART_CHECKOUT} onPress={onCheckout} />
          </View>
        </>
      )}
    </Screen>
  );
}
