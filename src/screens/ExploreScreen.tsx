import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRoute } from '@react-navigation/native';
import { CLOTHES } from '../data/clothes';
import { getPicks } from '../utils/outfit';
import { Clothing } from '../types';
import { useTheme } from '../utils/theme';
import { AppText } from '../components/AppText';
import { SearchBar } from '../components/SearchBar';
import { CategoryTabs } from '../components/CategoryTabs';
import ProductTile from '../components/ProductTile';
import Screen from "../components/Screen";
import {
  CATEGORY_ALL,
  CATEGORY_MEN,
  CATEGORY_WOMEN,
  NOTHING_FOUND,
  TEMP_PICKS_CHIP,
  TEMP_PICKS_CLEAR,
} from '../constants/strings';

type ExploreNavigationParamList = {
  ProductDetail: { id: number };
};

type ExploreRouteParams = {
  temp?: number;
  rain?: boolean;
};

export default function ExploreScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ExploreNavigationParamList>>();
  const route = useRoute();
  const { colors } = useTheme();

  const params = (route.params as ExploreRouteParams | undefined) ?? {};
  const [tab, setTab] = useState<string>(CATEGORY_ALL);
  const [query, setQuery] = useState('');

  const [tempFilter, setTempFilter] = useState<number | null>(params.temp ?? null);
  const rainFilter = params.rain ?? false;

  const genderFilter = useMemo(() => {
    if (tab === CATEGORY_MEN) return 'men';
    if (tab === CATEGORY_WOMEN) return 'women';
    return undefined;
  }, [tab]);

  const clothes = useMemo(() => {
    if (tempFilter != null) {
      return getPicks(CLOTHES, tempFilter, { rain: rainFilter, gender: genderFilter });
    }
    return CLOTHES;
  }, [tempFilter, rainFilter, genderFilter]);

  const data = useMemo(() => {
    let result = clothes;
    if (tempFilter === null && genderFilter) {
      result = result.filter((p) => p.gender === genderFilter || p.gender === 'unisex');
    }
    if (query) {
      const q = query.toLowerCase();
      result = result.filter((p) => p.title.toLowerCase().includes(q));
    }
    return result;
  }, [clothes, query, genderFilter, tempFilter]);

  const onPressItem = useCallback(
    (id: number) => navigation.navigate('ProductDetail', { id }),
    [navigation]
  );

  const onClear = useCallback(() => {
    setTempFilter(null);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Clothing }) => (
      <View style={{ width: '48%', marginBottom: 12 }}>
        <ProductTile item={item} onPress={onPressItem} />
      </View>
    ),
    [onPressItem]
  );

  const styles = StyleSheet.create({
    empty: { textAlign: 'center', marginTop: 40 },
    chipRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 8,
    },
    chipClear: {
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    chipClearText: {
      color: colors.subtext,
      fontSize: 12,
    },
  });

  return (
    <Screen>
      <SearchBar value={query} onChangeText={setQuery} placeholder="Search clothes…" />

      <View style={{ paddingHorizontal: 16 }}>
        <CategoryTabs selected={tab} onSelect={setTab} />
      </View>

      {tempFilter != null && (
        <View style={styles.chipRow}>
          <AppText variant="label">
            {TEMP_PICKS_CHIP} {tempFilter}°
          </AppText>
          <Pressable style={styles.chipClear} onPress={onClear}>
            <AppText variant="label" style={styles.chipClearText}>
              {TEMP_PICKS_CLEAR}
            </AppText>
          </Pressable>
        </View>
      )}

      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 16 }}
        contentContainerStyle={{ paddingBottom: 32 }}
        ListEmptyComponent={<AppText variant="label" color={colors.text}>{NOTHING_FOUND}</AppText>}
      />
    </Screen>
  );
}
