import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../utils/theme';
import { AppText } from './AppText';
import { ANNOUNCEMENT, NEXT_DROP_LABEL } from '../constants/brand';

export function AnnouncementBar() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <AppText variant="label" color={theme.colors.accent} style={s.announcement}>
        {ANNOUNCEMENT}
      </AppText>
      <AppText variant="label" color={theme.colors.accent} style={s.dropLabel}>
        {NEXT_DROP_LABEL} ↗
      </AppText>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
  },
  announcement: {
    fontSize: 10,
    textAlign: 'center',
    width: '100%',
  },
  dropLabel: {
    marginTop: 4,
    textAlign: 'center',
  },
});
