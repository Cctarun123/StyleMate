import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import Screen from '../components/Screen';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useWeather, outfitForTemperature } from '../hooks/useWeather';
import { getPicks, getTempBand } from '../utils/outfit';
import { sheet, text, useTheme, radius } from '../utils/theme';
import { AppText } from '../components/AppText';
import { SearchBar } from '../components/SearchBar';
import { CategoryTabs } from '../components/CategoryTabs';
import ProductTile from '../components/ProductTile';
import { CLOTHES, BAND_LABELS } from '../data/clothes';
import {
  APP_NAME,
  CATEGORY_ALL,
  CATEGORY_MEN,
  CATEGORY_WOMEN,
  TOP_PICKS_HEADING,
  WEATHER_LABEL,
  WEATHER_WEAR_PREFIX,
  WEATHER_SEE_PICKS,
  WEATHER_PICKS_SCREEN,
} from '../constants/strings';

type HomeNavigationParamList = {
  ProductDetail: { id: number };
};

type HomeTabParamList = {
  Home: undefined;
  Explore: { temp?: number; rain?: boolean };
  Wardrobe: undefined;
};

type HomeNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<HomeTabParamList>,
  NativeStackNavigationProp<HomeNavigationParamList>
>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeNavigationProp>();
  const { colors } = useTheme();

  const { weather, weatherLoading, weatherError, refresh: refreshWeather, isRainCode } =
    useWeather();
  const [tab, setTab] = useState<string>(CATEGORY_ALL);
  const [query, setQuery] = useState('');

  const temperature = weather?.temperature ?? null;
  const rain = weather != null ? isRainCode(weather.code) : false;
  const band = temperature != null ? getTempBand(temperature) : null;

  const genderFilter = useMemo(() => {
    if (tab === CATEGORY_MEN) return 'men';
    if (tab === CATEGORY_WOMEN) return 'women';
    return undefined;
  }, [tab]);

  const picks = useMemo(() => {
    if (temperature === null) return [];
    return getPicks(CLOTHES, temperature, { rain, gender: genderFilter });
  }, [temperature, rain, genderFilter]);

  const topPicks = useMemo(() => {
    if (!query) return picks;
    const q = query.toLowerCase();
    return picks.filter((p) => p.title.toLowerCase().includes(q));
  }, [picks, query]);

  const onPressItem = useCallback(
    (id: number) => navigation.navigate('ProductDetail', { id }),
    [navigation]
  );

  const onRefresh = useCallback(async () => {
    await refreshWeather();
  }, [refreshWeather]);

  const onSeePicks = useCallback(() => {
    if (temperature != null) {
      navigation.navigate(WEATHER_PICKS_SCREEN, { temp: temperature, rain });
    }
  }, [navigation, temperature, rain]);

  const styles = StyleSheet.create({
    content: { paddingBottom: 32 },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 16,
    },
    appName: {
      ...text.title(colors),
      fontSize: 24,
    },
    iconButton: {
      padding: 6,
    },
    bandRow: {
      paddingHorizontal: 16,
      marginBottom: 4,
    },
    bandLabel: {
      ...text.label(colors),
      color: colors.subtext,
    },
    weatherCard: {
      backgroundColor: colors.dark,
      borderRadius: 24,
      padding: 20,
      marginHorizontal: 16,
      marginBottom: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    weatherLabel: {
      ...text.label(colors),
      color: 'rgba(255, 255, 255, 0.7)',
    },
    weatherTemp: {
      ...text.title(colors),
      fontSize: 40,
      lineHeight: 48,
      color: colors.onDark,
    },
    weatherWear: {
      ...text.label(colors),
      color: colors.onDark,
    },
    weatherLeft: {
      flex: 1,
    },
    seePicksButton: {
      borderWidth: 1,
      borderColor: colors.onDark,
      borderRadius: radius.pill,
      paddingHorizontal: 14,
      paddingVertical: 8,
      backgroundColor: 'transparent',
    },
    seePicksText: {
      ...text.label(colors),
      color: colors.onDark,
    },
    sectionHead: {
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    tileWrapper: {
      width: '48%',
      marginBottom: 12,
    },
    error: {
      color: colors.text,
      textAlign: 'center',
      marginTop: 20,
    },
    loading: {
      paddingVertical: 24,
    },
  });

  return (
    <Screen>
    <ScrollView
      style={sheet.page(colors)}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={weatherLoading} onRefresh={onRefresh} />
      }
    >
      {/* Header row */}
      <View style={styles.headerRow}>
        <Pressable
          style={styles.iconButton}
          onPress={() => {
            // Menu placeholder.
          }}
        >
          <Ionicons name="menu-outline" size={26} color={colors.text} />
        </Pressable>
        <AppText variant="title" style={styles.appName}>
          {APP_NAME}
        </AppText>
        <Pressable style={styles.iconButton} onPress={() => navigation.navigate('Wardrobe')}>
          <Ionicons name="bag-outline" size={26} color={colors.text} />
        </Pressable>
      </View>

      {/* Band label */}
      {band != null && temperature != null && (
        <View style={styles.bandRow}>
          <AppText variant="label" style={styles.bandLabel}>
            {BAND_LABELS[band]}, {temperature}°
          </AppText>
        </View>
      )}

      {/* Category tabs */}
      <View style={{ paddingHorizontal: 16 }}>
        <CategoryTabs selected={tab} onSelect={setTab} />
      </View>

      {/* Weather banner */}
      <View style={styles.weatherCard}>
        <View style={styles.weatherLeft}>
          <AppText variant="label" style={styles.weatherLabel}>
            {WEATHER_LABEL}
          </AppText>
          <AppText variant="title" style={styles.weatherTemp}>
            {weather != null ? `${weatherEmoji(weather.code)} ${weather.temperature}°` : '—'}
          </AppText>
          {weatherLoading ? (
            <AppText variant="label" style={styles.weatherWear}>
              Loading weather…
            </AppText>
          ) : weatherError ? (
            <AppText variant="label" style={styles.weatherWear}>
              {weatherError}
            </AppText>
          ) : (
            <AppText variant="label" style={styles.weatherWear}>
              {WEATHER_WEAR_PREFIX} {outfitForTemperature(temperature ?? 20)}
            </AppText>
          )}
        </View>
        <Pressable style={styles.seePicksButton} onPress={onSeePicks}>
          <AppText variant="label" style={styles.seePicksText}>
            {WEATHER_SEE_PICKS}
          </AppText>
        </Pressable>
      </View>

      {/* Search bar */}
      <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search picks…" />
      </View>

      {/* Top picks grid */}
      <View style={styles.sectionHead}>
        <AppText variant="heading">{TOP_PICKS_HEADING}</AppText>
      </View>

      {weatherError && (
        <AppText variant="label" style={styles.error}>
          Weather: {weatherError}
        </AppText>
      )}

      {weatherLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.text} />
        </View>
      ) : topPicks.length === 0 ? (
        <AppText variant="label" style={[styles.error, { marginTop: 20 }]}>
          Nothing found.
        </AppText>
      ) : (
        <View style={styles.grid}>
          {topPicks.map((item) => (
            <View key={item.id} style={styles.tileWrapper}>
              <ProductTile item={item} onPress={onPressItem} />
            </View>
          ))}
        </View>
      )}
    </ScrollView>
    </Screen>
  );
}

function weatherEmoji(code: number): string {
  if (code === 0) return '☀️';
  if (code >= 1 && code <= 3) return '⛅';
  if (code === 45 || code === 48) return '🌫';
  if (code >= 51 && code <= 67) return '🌧';
  if (code >= 71 && code <= 77) return '❄️';
  if (code >= 80 && code <= 99) return '⛈';
  return '☀️';
}
