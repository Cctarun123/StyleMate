import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { text, useTheme } from '../utils/theme';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import Screen from '../components/Screen';
import { PROFILE_TITLE, PROFILE_MY_ORDERS } from '../constants/strings';

export default function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const s = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 60,
    },
    title: { ...text.heading(colors), fontSize: 22 },
  });

  return (
    <Screen>
      <View style={s.container}>
        <AppText variant="heading" style={s.title}>{PROFILE_TITLE}</AppText>
        <Button
          title={PROFILE_MY_ORDERS}
          onPress={() => navigation.navigate('Orders')}
          style={{ marginTop: 24, width: '60%' }}
        />
      </View>
    </Screen>
  );
}
