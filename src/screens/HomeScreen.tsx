import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useProducts } from '../hooks/useProducts';
import { filterProductsByOutfit } from '../utils/outfit';
import { sheet, surface, text, useTheme, radius } from '../utils/theme';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { SearchBar } from '../components/SearchBar';
import { CategoryTabs } from '../components/CategoryTabs';
import ProductTile from '../components/ProductTile';
import { Product } from '../types';
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

const LATITUDE = 13.6288;
const LONGITUDE = 79.4192;
const WEATHER_URL = `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&current=temperature_2m,weathercode`;

type Weather = {
  temperature: number;
  condition: string;
  code: number;
};

type HomeNavigationParamList = {
  ProductDetail: { id: number };
};

type HomeTabParamList = {
  Home: undefined;
  Explore: undefined;
  Wardrobe: undefined;
};

type HomeNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<HomeTabParamList>,
  NativeStackNavigationProp<HomeNavigationParamList>
>;

function weatherCondition(code: number): string {
  if (code === 0) return 'Clear';
  if (code <= 2) return 'Partly cloudy';
  if (code === 3) return 'Overcast';
  if (code === 45 || code === 48) return 'Foggy';
  if (code >= 51 && code <= 57) return 'Drizzle';
  if (code >= 61 && code <= 67) return 'Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Showers';
  if (code === 85 || code === 86) return 'Snow showers';
  if (code >= 95) return 'Thunderstorm';
  return 'Clear';
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

function outfitForTemperature(temperature: number): 'jackets' | 'light' | 'casual' {
  if (temperature < 10) return 'jackets';
  if (temperature > 22) return 'light';
  return 'casual';
}

export default function HomeScreen() {
  const navigation = useNavigation<HomeNavigationProp>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const {
    products,
    loading: productsLoading,
    refreshing: productsRefreshing,
    error: productsError,
    refresh: refreshProducts,
  } = useProducts();
  const [weather, setWeather] = useState<Weather | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [tab, setTab] = useState<string>(CATEGORY_ALL);
  const [query, setQuery] = useState('');

  const fetchWeather = useCallback(async () => {
    setWeatherLoading(true);
    setWeatherError(null);
    try {
      const res = await fetch(WEATHER_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const current = data.current;
      setWeather({
        temperature: Math.round(current.temperature_2m),
        condition: weatherCondition(current.weathercode),
        code: current.weathercode,
      });
    } catch (error) {
      setWeatherError(error instanceof Error ? error.message : 'Failed to load weather.');
    } finally {
      setWeatherLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await fetchWeather();
    })();
  }, [fetchWeather]);

  const onRefresh = useCallback(async () => {
    await Promise.all([fetchWeather(), refreshProducts()]);
  }, [fetchWeather, refreshProducts]);

  const category = weather ? outfitForTemperature(weather.temperature) : 'casual';

  const genderValue = useMemo(() => {
    if (tab === CATEGORY_MEN) return "men's clothing";
    if (tab === CATEGORY_WOMEN) return "women's clothing";
    return '';
  }, [tab]);

  const topPicks = useMemo(() => {
    let data = filterProductsByOutfit(products, category);
    if (genderValue) {
      data = data.filter((p) => p.category === genderValue);
    }
    if (query) {
      const q = query.toLowerCase();
      data = data.filter((p) => p.title.toLowerCase().includes(q));
    }
    return data;
  }, [products, category, genderValue, query]);

  const onPressItem = useCallback(
    (id: number) => navigation.navigate('ProductDetail', { id }),
    [navigation]
  );

  const styles = StyleSheet.create({
    content: { paddingBottom: 32 },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: insets.top + 8,
      paddingBottom: 16,
    },
    appName: {
      ...text.title(colors),
      fontSize: 24,
    },
    iconButton: {
      padding: 6,
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
    <ScrollView
      style={sheet.page(colors)}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={weatherLoading || productsRefreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header row */}
      <View style={styles.headerRow}>
        <Pressable style={styles.iconButton} onPress={() => {
          // Menu placeholder.
        }}>
          <Ionicons name="menu-outline" size={26} color={colors.text} />
        </Pressable>
        <AppText variant="title" style={styles.appName}>
          {APP_NAME}
        </AppText>
        <Pressable style={styles.iconButton} onPress={() => navigation.navigate('Wardrobe')}>
          <Ionicons name="bag-outline" size={26} color={colors.text} />
        </Pressable>
      </View>

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
              {WEATHER_WEAR_PREFIX} {category}
            </AppText>
          )}
        </View>
        <Pressable style={styles.seePicksButton} onPress={() => navigation.navigate(WEATHER_PICKS_SCREEN)}>
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

      {productsError && (
        <AppText variant="label" style={styles.error}>
          Products: {productsError}
        </AppText>
      )}

      {productsLoading ? (
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
  );
}
