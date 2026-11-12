import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Order } from '../types';
import { sheet, text, useTheme } from '../utils/theme';
import { formatPrice } from '../utils/outfit';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import Screen from '../components/Screen';
import { ORDERS_TITLE, ORDERS_EMPTY } from '../constants/strings';

export default function OrdersScreen() {
  const { colors } = useTheme();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('@stylemate:orders');
        let fetched: Order[] = [];
        if (raw !== null) {
          const parsed = JSON.parse(raw) as unknown;
          fetched = Array.isArray(parsed) ? (parsed as Order[]) : [];
        }
        setOrders(fetched);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const s = StyleSheet.create({
    content: { paddingBottom: 80 },
    title: {
      ...text.heading(colors),
      fontSize: 22,
      paddingHorizontal: 20,
      marginTop: 8,
    },
    empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    info: {},
    id: { ...text.body(colors), fontWeight: '600' as const },
    meta: { ...text.label(colors), color: colors.subtext, marginTop: 2 },
    total: { ...text.price(colors) },
  });

  const renderItem = useCallback(
    ({ item }: { item: Order }) => (
      <View style={s.row}>
        <View style={s.info}>
          <AppText variant="body" style={s.id}>
            {item.id}
          </AppText>
          <AppText variant="label" style={s.meta}>
            {new Date(item.date).toLocaleDateString()} · {item.items.length} items
          </AppText>
        </View>
        <AppText variant="price" style={s.total}>
          {formatPrice(item.total)}
        </AppText>
      </View>
    ),
    []
  );

  return (
    <Screen>
      <AppText variant="heading" style={s.title}>{ORDERS_TITLE}</AppText>
      {loading ? (
        <View style={sheet.center(colors)}>
          <ActivityIndicator size="large" color={colors.text} />
        </View>
      ) : orders.length === 0 ? (
        <View style={s.empty}>
          <AppText variant="heading">{ORDERS_EMPTY}</AppText>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 16 }}
        />
      )}
    </Screen>
  );
}
