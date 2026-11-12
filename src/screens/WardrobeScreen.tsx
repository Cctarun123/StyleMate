import { useCallback } from 'react';
import { View, FlatList, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useWardrobe } from '../context/WardrobeContext';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';
import { theme, sheet } from '../utils/theme';
import { SectionHeader } from '../components/SectionHeader';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';

type WardrobeNavigationParamList = {
  ProductDetail: { id: number };
};

export default function WardrobeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<WardrobeNavigationParamList>>();
  const { items, remove } = useWardrobe();

  const onPressItem = useCallback(
    (id: number) => navigation.navigate('ProductDetail', { id }),
    [navigation]
  );

  const renderItem = useCallback(
    ({ item }: { item: Product }) => (
      <View style={s.row} key={item.id}>
        <View style={s.cardWrap}>
          <ProductCard item={item} onPress={onPressItem} />
        </View>
        <Button title="REMOVE ↗" onPress={() => remove(item.id)} variant="outline" />
      </View>
    ),
    [onPressItem, remove]
  );

  return (
    <View style={sheet.page()}>
      <SectionHeader label="03 / WARDROBE" heading="YOUR LOCKER." />

      {items.length === 0 ? (
        <View style={s.empty}>
          <AppText variant="label" style={s.emptyText}>
            NOTHING SAVED
            <AppText variant="label" color={theme.colors.accent}>
              .
            </AppText>
            {' YET'}
            <AppText variant="label" color={theme.colors.accent}>
              .
            </AppText>
          </AppText>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  cardWrap: { flex: 1, marginRight: 10 },
  listContent: { padding: 16, paddingBottom: 90 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 16, textAlign: 'center' },
});
