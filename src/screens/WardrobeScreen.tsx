import { useCallback } from 'react';
import { Pressable, View, Text, FlatList, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useWardrobe } from '../context/WardrobeContext';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';

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
      <View style={s.row}>
        <ProductCard item={item} onPress={onPressItem} />
        <PressableRemove item={item} onRemove={remove} />
      </View>
    ),
    [onPressItem, remove]
  );

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderItem}
      contentContainerStyle={s.content}
      ListEmptyComponent={
        <View style={s.center}>
          <Text style={s.empty}>Nothing saved yet</Text>
        </View>
      }
    />
  );
}

function PressableRemove({ item, onRemove }: { item: Product; onRemove: (id: number) => void }) {
  return (
    <Pressable style={s.remove} onPress={() => onRemove(item.id)}>
      <Text style={s.removeText}>Remove</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  content: { padding: 8 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  empty: { textAlign: 'center', fontSize: 16, color: '#666' },
  remove: { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: '#ffe5e5', borderRadius: 16 },
  removeText: { fontSize: 12, color: '#b33', fontWeight: '600' },
});
