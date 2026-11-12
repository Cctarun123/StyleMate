import { Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '../utils/theme';
import { AppText } from './AppText';
import { CATEGORY_ALL, CATEGORY_MEN, CATEGORY_WOMEN } from '../constants/strings';

type Props = {
  selected: string;
  onSelect: (category: string) => void;
};

const CATEGORIES = [CATEGORY_ALL, CATEGORY_MEN, CATEGORY_WOMEN];

export function CategoryTabs({ selected, onSelect }: Props) {
  const { colors } = useTheme();

  const s = StyleSheet.create({
    container: {
      flexDirection: 'row',
      marginBottom: 16,
    },
    tab: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      marginRight: 12,
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    active: {
      borderBottomColor: colors.text,
    },
  });

  return (
    <View style={s.container}>
      {CATEGORIES.map((cat) => (
        <Pressable key={cat} onPress={() => onSelect(cat)} style={[s.tab, selected === cat && s.active]}>
          <AppText
            variant="label"
            color={selected === cat ? colors.text : colors.subtext}
            style={selected === cat ? { fontWeight: '700' as const } : undefined}
          >
            {cat}
          </AppText>
        </Pressable>
      ))}
    </View>
  );
}
