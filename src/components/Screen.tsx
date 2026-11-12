import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../utils/theme';

export function Screen({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <SafeAreaView edges={["top"]} style={[s.container, { backgroundColor: colors.bg }]}>
      {children}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
  } as ViewStyle,
});
