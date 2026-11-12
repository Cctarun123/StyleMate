import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Order } from '../types';
import { useCart } from '../context/CartContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sheet, text, useTheme, radius } from '../utils/theme';
import { formatPrice } from '../utils/outfit';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import Screen from '../components/Screen';
import {
  CHECKOUT_TITLE,
  CHECKOUT_PLACE_ORDER,
  CHECKOUT_NAME,
  CHECKOUT_PHONE,
  CHECKOUT_ADDRESS,
  CHECKOUT_PINCODE,
  PAYMENT_LABEL,
  PAYMENT_COD,
  PAYMENT_UPI,
  PAYMENT_CARD,
  PAYMENT_NOTE,
  CART_TOTAL,
} from '../constants/strings';

type CheckoutNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Checkout'>;

type Form = {
  name: string;
  phone: string;
  address: string;
  pincode: string;
};

type PaymentMethod = 'cod' | 'upi' | 'card';

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: 'cod', label: PAYMENT_COD },
  { value: 'upi', label: PAYMENT_UPI },
  { value: 'card', label: PAYMENT_CARD },
];

const ORDERS_STORAGE_KEY = '@stylemate:orders';

export default function CheckoutScreen() {
  const navigation = useNavigation<CheckoutNavigationProp>();
  const { items, total, clear } = useCart();
  const { colors } = useTheme();

  const [form, setForm] = useState<Form>({ name: '', phone: '', address: '', pincode: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [payment, setPayment] = useState<PaymentMethod>('cod');
  const [submitting, setSubmitting] = useState(false);

  const subtotal = total;
  const delivery = subtotal >= 999 ? 0 : 49;
  const grandTotal = subtotal + delivery;

  const setField = useCallback(
    (key: keyof Form, value: string) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    []
  );

  const selectPayment = useCallback((method: PaymentMethod) => setPayment(method), []);

  const validate = useCallback((): boolean => {
    const next: Partial<Record<keyof Form, string>> = {};
    if (!form.name.trim()) next.name = 'Name is required.';
    if (!/^\d{10}$/.test(form.phone)) next.phone = 'Enter a valid 10-digit phone number.';
    if (!form.address.trim()) next.address = 'Address is required.';
    if (!/^\d{6}$/.test(form.pincode)) next.pincode = 'Enter a valid 6-digit pincode.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }, [form]);

  const placeOrder = useCallback(async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const order: Order = {
        id: 'ORD-' + Date.now(),
        items,
        total: grandTotal,
        date: new Date().toISOString(),
        address: form.address,
        method: payment,
      };
      try {
        const raw = await AsyncStorage.getItem(ORDERS_STORAGE_KEY);
        let orders: Order[] = [];
        if (raw !== null) {
          const parsed = JSON.parse(raw) as unknown;
          orders = Array.isArray(parsed) ? (parsed as Order[]) : [];
        }
        await AsyncStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify([...orders, order]));
      } catch {
        // Persistence failed — order still completed in-memory.
      }
      clear();
      navigation.navigate('OrderSuccess', { order });
    } finally {
      setSubmitting(false);
    }
  }, [validate, items, grandTotal, form, payment, clear, navigation]);

  const s = StyleSheet.create({
    content: { paddingBottom: 120 },
    title: { ...text.heading(colors), fontSize: 22, paddingHorizontal: 20, marginTop: 8 },
    section: { paddingHorizontal: 20, marginBottom: 16 },
    sectionLabel: {
      ...text.label(colors),
      color: colors.subtext,
      marginBottom: 10,
    },
    field: { marginBottom: 16 },
    fieldLabel: { ...text.label(colors), marginBottom: 6 },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.sm,
      paddingHorizontal: 12,
      paddingVertical: 12,
      color: colors.text,
      fontSize: 14,
    },
    error: { color: colors.danger, marginTop: 4, fontSize: 12 },
    paymentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      padding: 12,
      marginBottom: 8,
      backgroundColor: colors.bg,
    },
    paymentRowSelected: { borderColor: colors.dark },
    radioOuter: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.subtext,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },
    radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.dark },
    paymentLabel: { ...text.body(colors) },
    note: { ...text.label(colors), color: colors.subtext, marginTop: 6 },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      marginVertical: 12,
    },
    totalValue: { ...text.heading(colors) },
  });

  return (
    <Screen>
      <ScrollView style={sheet.page(colors)} contentContainerStyle={s.content}>
        <AppText variant="heading" style={s.title}>{CHECKOUT_TITLE}</AppText>

        <View style={s.section}>
          <AppText variant="label" style={s.sectionLabel}>Details</AppText>
          {[
            { key: 'name' as const, label: CHECKOUT_NAME },
            { key: 'phone' as const, label: CHECKOUT_PHONE },
            { key: 'address' as const, label: CHECKOUT_ADDRESS },
            { key: 'pincode' as const, label: CHECKOUT_PINCODE },
          ].map((field) => (
            <View key={field.key} style={s.field}>
              <AppText variant="label" style={s.fieldLabel}>
                {field.label}
              </AppText>
              <TextInput
                style={s.input}
                value={form[field.key]}
                onChangeText={(value) => setField(field.key, value)}
                placeholder={field.label}
                keyboardType={
                  field.key === 'phone' || field.key === 'pincode' ? 'numeric' : 'default'
                }
              />
              {errors[field.key] && (
                <AppText variant="label" style={s.error}>
                  {errors[field.key]}
                </AppText>
              )}
            </View>
          ))}
        </View>

        <View style={s.section}>
          <AppText variant="label" style={s.sectionLabel}>{PAYMENT_LABEL}</AppText>
          {PAYMENT_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              style={[s.paymentRow, payment === option.value && s.paymentRowSelected]}
              onPress={() => selectPayment(option.value)}
            >
              <Pressable style={s.radioOuter}>
                {payment === option.value && <Pressable style={s.radioInner} />}
              </Pressable>
              <AppText variant="body" style={s.paymentLabel}>
                {option.label}
              </AppText>
            </Pressable>
          ))}
          {(payment === 'upi' || payment === 'card') && (
            <AppText variant="label" style={s.note}>{PAYMENT_NOTE}</AppText>
          )}
        </View>

        <View style={s.totalRow}>
          <AppText variant="body">{CART_TOTAL}</AppText>
          <AppText variant="heading" style={s.totalValue}>
            {formatPrice(grandTotal)}
          </AppText>
        </View>

        <Button
          title={submitting ? 'PLACING…' : CHECKOUT_PLACE_ORDER}
          onPress={placeOrder}
          disabled={submitting}
        />
      </ScrollView>
    </Screen>
  );
}
