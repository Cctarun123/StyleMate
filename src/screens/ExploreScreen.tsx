import { useCallback, useMemo, useState } from "react";
import {
  View,
  TextInput,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useProducts } from "../hooks/useProducts";
import ProductCard from "../components/ProductCard";
import { Product } from "../types";
import { theme, surface, text, sheet } from "../utils/theme";
import { SectionHeader } from "../components/SectionHeader";
import { AppText } from "../components/AppText";

type ExploreNavigationParamList = {
  ProductDetail: { id: number };
};

const CHIPS = [
  { label: "All", value: "" },
  { label: "Men", value: "men's clothing" },
  { label: "Women", value: "women's clothing" },
];

export default function ExploreScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ExploreNavigationParamList>>();
  const { products, loading, refreshing, error, reload, refresh } = useProducts();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");

  const data = useMemo(
    () =>
      products.filter(
        (p) =>
          (!category || p.category === category) &&
          p.title.toLowerCase().includes(query.toLowerCase())
      ),
    [products, query, category]
  );

  const onPressItem = useCallback(
    (id: number) => navigation.navigate("ProductDetail", { id }),
    [navigation]
  );
  const renderItem = useCallback(
    ({ item, index }: { item: Product; index: number }) => (
      <View style={s.cardWrap} key={item.id}>
        <ProductCard item={item} onPress={onPressItem} index={index} />
      </View>
    ),
    [onPressItem]
  );

  if (loading)
    return (
      <View style={sheet.center()}>
        <ActivityIndicator size="large" color={theme.colors.text} />
      </View>
    );
  if (error)
    return (
      <View style={sheet.center()}>
        <AppText variant="label" color={theme.colors.accent}>
          {error}
        </AppText>
        <Pressable style={s.retry} onPress={reload}>
          <AppText variant="label" color={theme.colors.accent}>
            RETRY
          </AppText>
        </Pressable>
      </View>
    );

  return (
    <View style={sheet.page()}>
      <SectionHeader label="01 / BROWSE" heading="THE EDIT." />

      <TextInput
        style={s.search}
        placeholder="Search clothes..."
        value={query}
        onChangeText={setQuery}
        placeholderTextColor={theme.colors.subtext}
      />

      <View style={s.chips}>
        {CHIPS.map((c) => (
          <Pressable
            key={c.label}
            onPress={() => setCategory(c.value)}
            style={[s.chip, category === c.value && s.chipActive]}
          >
            <AppText
              variant="label"
              color={category === c.value ? theme.colors.bg : theme.colors.text}
            >
              {c.label}
            </AppText>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={s.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
        ListEmptyComponent={<AppText variant="label" color={theme.colors.subtext}>NOTHING FOUND.</AppText>}
      />
    </View>
  );
}

const s = StyleSheet.create({
  search: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
    fontSize: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  chips: { flexDirection: "row", marginBottom: 20 },
  chip: {
    ...surface,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: theme.colors.accent,
  },
  listContent: { padding: 16, paddingBottom: 90 },
  cardWrap: { width: '50%', paddingRight: 12, paddingBottom: 14 },
  empty: { ...text.label(), textAlign: 'center', marginTop: 40 },
  retry: { marginTop: 12, paddingHorizontal: 16, paddingVertical: 8 },
});
