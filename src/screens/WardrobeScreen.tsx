import { useCallback } from 'react';
import { View, FlatList, StyleSheet, Image, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useWardrobe } from '../context/WardrobeContext';
import { Clothing } from '../types';
import { sheet, useTheme } from '../utils/theme';
import { formatPrice } from '../utils/outfit';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import Screen from "../components/Screen";
import {
  WARDROBE_TITLE,
  WARDROBE_EMPTY,
  WARDROBE_EXPLORE_BUTTON,
  WARDROBE_COUNT_BAR,
} from '../constants/strings';

type WardrobeNavigationParamList = {
  ProductDetail: { id: number };
  Orders: undefined;
};

export default function WardrobeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<WardrobeNavigationParamList>>();
  const { items, remove } = useWardrobe();
  const { colors } = useTheme();

  const onPressItem = useCallback(
    (id: number) => navigation.navigate('ProductDetail', { id }),
    [navigation]
  );

  const onViewOrders = useCallback(() => navigation.navigate('Orders'), [navigation]);

  const renderItem = useCallback(
    ({ item }: { item: Clothing }) => (
      <View style={s.row} key={item.id}>
        <View style={s.thumbWrap}>
          <Image source={{ uri: item.image }} style={s.thumb} resizeMode="cover" />
        </View>
        <View style={s.info}>
          <AppText variant="body" style={s.title}>
            {item.title}
          </AppText>
          <AppText variant="price" style={s.price}>
            {formatPrice(item.price)}
          </AppText>
        </View>
        <Pressable style={s.trash} onPress={(e: any) => {
          e.stopPropagation();
          remove(item.id);
        }}>
          <Ionicons name="trash-outline" size={20} color={colors.subtext} />
        </Pressable>
      </View>
    ),
    [onPressItem, remove]
  );

  return (
    <Screen>
      <View style={s.headerRow}>
        <AppText variant="heading" style={s.titleText}>
          {WARDROBE_TITLE}
        </AppText>
        <Pressable style={s.iconButton} onPress={onViewOrders}>
          <Ionicons name="receipt" size={22} color={colors.text} />
        </Pressable>
      </View>

      {items.length === 0 ? (
        <View style={s.empty}>
          <AppText variant="label" style={s.emptyText}>
            {WARDROBE_EMPTY}
          </AppText>
          <Button
            title={WARDROBE_EXPLORE_BUTTON}
            onPress={() => navigation.navigate('Explore' as any)}
            variant="outline"
          />
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

      {items.length > 0 && (
        <View style={[s.bottomBar, { backgroundColor: colors.dark }]}>
          <AppText variant="body" color={colors.onDark} style={s.bottomBarText}>
            {items.length} {WARDROBE_COUNT_BAR}
          </AppText>
        </View>
      )}
    </Screen>
  );
}

const s = StyleSheet.create({
  titleText: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  iconButton: {
    padding: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  thumbWrap: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#E3E3E3',
    overflow: 'hidden',
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  info: {
    flex: 1,
    marginHorizontal: 12,
  },
  title: {
    marginBottom: 2,
  },
  price: {},
  trash: {
    padding: 6,
  },
  listContent: { paddingHorizontal: 20, paddingBottom: 32 },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 16,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBarText: {},
});
