import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { text, useTheme } from '../utils/theme';
import { formatPrice } from '../utils/outfit';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import Screen from '../components/Screen';
import {
  ORDER_THANK_YOU,
  ORDER_ID,
  ORDER_VIEW_ORDERS,
  ORDER_CONTINUE_SHOPPING,
} from '../constants/strings';

type OrderSuccessNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'OrderSuccess'
>;
type OrderSuccessRoute = RouteProp<RootStackParamList, 'OrderSuccess'>;

export default function OrderSuccessScreen() {
  const navigation = useNavigation<OrderSuccessNavigationProp>();
  const route = useRoute<OrderSuccessRoute>();
  const { colors } = useTheme();
  const order = route.params.order;

  const onViewOrders = useCallback(() => navigation.navigate('Orders'), [navigation]);
  const onContinue = useCallback(() => navigation.popToTop(), [navigation]);

  const s = StyleSheet.create({
    content: {
      flex: 1,
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 40,
    },
    title: {
      ...text.heading(colors),
      fontSize: 24,
      marginTop: 16,
      textAlign: 'center',
    },
    orderId: {
      ...text.label(colors),
      color: colors.subtext,
      marginTop: 12,
      textAlign: 'center',
    },
    summary: {
      ...text.body(colors),
      marginTop: 16,
      textAlign: 'center',
    },
    buttons: { marginTop: 24, width: '100%' },
    button: { marginBottom: 12 },
  });

  return (
    <Screen>
      <View style={s.content}>
        <Ionicons name="checkmark-circle" size={64} color={colors.dark} />
        <AppText variant="heading" style={s.title}>
          {ORDER_THANK_YOU}
        </AppText>
        <AppText variant="label" style={s.orderId}>
          {ORDER_ID}: {order.id}
        </AppText>
        <AppText variant="body" style={s.summary}>
          {order.items.length} items · {formatPrice(order.total)}
        </AppText>
        <View style={s.buttons}>
          <Button style={s.button} title={ORDER_VIEW_ORDERS} onPress={onViewOrders} />
          <Button
            style={s.button}
            title={ORDER_CONTINUE_SHOPPING}
            onPress={onContinue}
            variant="outline"
          />
        </View>
      </View>
    </Screen>
  );
}
