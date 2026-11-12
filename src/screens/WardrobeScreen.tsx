import { useCallback } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useWardrobe } from '../context/WardrobeContext';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';
import { theme, text, sheet } from '../utils/theme';
import { SectionHeader } from '../components/SectionHeader';
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
          <Text style={[text.label(), { fontSize: 16 }]}>
            NOTHING SAVED
            <Text style={{ color: theme.colors.accent }}>.</Text>
            {' YET'}
            <Text style={{ color: theme.colors.accent }}>.</Text>
          </Text>
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
});
