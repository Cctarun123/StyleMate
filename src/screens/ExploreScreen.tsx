import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useProducts } from '../hooks/useProducts';
import ProductTile from '../components/ProductTile';
import { Product } from '../types';
import { sheet, useTheme } from '../utils/theme';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { SearchBar } from '../components/SearchBar';
import { CategoryTabs } from '../components/CategoryTabs';
import {
  CATEGORY_ALL,
  CATEGORY_MEN,
  CATEGORY_WOMEN,
  NOTHING_FOUND,
} from '../constants/strings';

type ExploreNavigationParamList = {
  ProductDetail: { id: number };
};

const CHIPS = [
  { label: CATEGORY_ALL, value: '' },
  { label: CATEGORY_MEN, value: "men's clothing" },
  { label: CATEGORY_WOMEN, value: "women's clothing" },
];

export default function ExploreScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ExploreNavigationParamList>>();
  const { products, loading, refreshing, error, refresh } = useProducts();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<string>(CATEGORY_ALL);
  const { colors } = useTheme();

  const categoryValue = useMemo(() => {
    if (tab === CATEGORY_MEN) return "men's clothing";
    if (tab === CATEGORY_WOMEN) return "women's clothing";
    return '';
  }, [tab]);

  const data = useMemo(
    () =>
      products.filter(
        (p) =>
          (!categoryValue || p.category === categoryValue) &&
          p.title.toLowerCase().includes(query.toLowerCase())
      ),
    [products, query, categoryValue]
  );

  const onPressItem = useCallback(
    (id: number) => navigation.navigate('ProductDetail', { id }),
    [navigation]
  );

  const renderItem = useCallback(
    ({ item }: { item: Product }) => (
      <ProductTile item={item} onPress={onPressItem} />
    ),
    [onPressItem]
  );

  const styles = StyleSheet.create({
    listContent: { padding: 16, paddingBottom: 90 },
    empty: { textAlign: 'center', marginTop: 40 },
    retry: { marginTop: 12 },
  });

  if (loading)
    return (
      <View style={sheet.center(colors)}>
        <ActivityIndicator size="large" color={colors.text} />
      </View>
    );
  if (error)
    return (
      <View style={sheet.center(colors)}>
        <AppText variant="label" color={colors.text}>
          {error}
        </AppText>
        <Button title="Retry" onPress={refresh} variant="outline" style={styles.retry} />
      </View>
    );

  return (
    <View style={sheet.page(colors)}>
      <SearchBar value={query} onChangeText={setQuery} placeholder="Search clothes…" />

      <CategoryTabs selected={tab} onSelect={setTab} />

      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
        ListEmptyComponent={<AppText variant="label" color={colors.text}>{NOTHING_FOUND}</AppText>}
      />
    </View>
  );
}
