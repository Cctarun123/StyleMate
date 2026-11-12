import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { text, useTheme } from '../utils/theme';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import Screen from '../components/Screen';
import {
  AUTH_DEMO_NOTE,
  PROFILE_EMAIL,
  PROFILE_LOGOUT,
  PROFILE_MY_ORDERS,
  PROFILE_NAME,
  PROFILE_TITLE,
} from '../constants/strings';
import { RootStackParamList } from '../types';

export default function ProfileScreen() {
  const { email, name, logout } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();

  const onMyOrders = useCallback(() => navigation.navigate('Orders'), [navigation]);

  const s = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 60,
    },
    title: { ...text.heading(colors), fontSize: 22 },
    detail: { ...text.body(colors), marginTop: 4 },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 16,
      width: '100%',
    },
    note: {
      ...text.label(colors),
      color: colors.subtext,
      marginTop: 24,
      textAlign: 'center',
    },
  });

  return (
    <Screen>
      <View style={s.container}>
        <AppText variant="heading" style={s.title}>{PROFILE_TITLE}</AppText>
        <AppText variant="body" style={s.detail}>
          {PROFILE_NAME}: {name ?? '—'}
        </AppText>
        <AppText variant="body" style={s.detail}>
          {PROFILE_EMAIL}: {email ?? '—'}
        </AppText>
        <View style={s.divider} />
        <Button
          title={PROFILE_MY_ORDERS}
          onPress={onMyOrders}
          style={{ marginBottom: 12, width: '70%' }}
        />
        <Button title={PROFILE_LOGOUT} onPress={logout} variant="outline" style={{ width: '70%' }} />
        <AppText variant="label" style={s.note}>{AUTH_DEMO_NOTE}</AppText>
      </View>
    </Screen>
  );
}
