import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';
import { filterProductsByOutfit } from '../utils/outfit';
import { theme, text, sheet } from '../utils/theme';
import { SectionHeader } from '../components/SectionHeader';
import { OutfitCategory, Product } from '../types';

type HomeNavigationParamList = {
  ProductDetail: { id: number };
};

type Weather = {
  temperature: number;
  condition: string;
};

const LATITUDE = 51.5074;
const LONGITUDE = -0.1278;
const WEATHER_URL = `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&current=temperature_2m,weathercode`;

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

function outfitForTemperature(temperature: number): OutfitCategory {
  if (temperature < 10) return 'jackets';
  if (temperature > 22) return 'light';
  return 'casual';
}

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeNavigationParamList>>();
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
      });
    } catch (error) {
      setWeatherError(error instanceof Error ? error.message : 'Failed to load weather.');
    } finally {
      setWeatherLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  const onRefresh = useCallback(async () => {
    await Promise.all([fetchWeather(), refreshProducts()]);
  }, [fetchWeather, refreshProducts]);

  const category: OutfitCategory = weather ? outfitForTemperature(weather.temperature) : 'casual';
  const suggested = filterProductsByOutfit(products, category);

  return (
    <ScrollView
      style={sheet.page()}
      contentContainerStyle={s.content}
      refreshControl={
        <RefreshControl refreshing={weatherLoading || productsRefreshing} onRefresh={onRefresh} />
      }
    >
      <View style={s.weatherCard}>
        <Text style={[text.label(), s.label]}>TODAY / TIRUPATI</Text>
        <Text style={s.temp}>{weather != null ? `${weather.temperature}°` : '—'}</Text>
        {weatherLoading ? (
          <Text style={[text.label(), s.label]}>Loading&hellip;</Text>
        ) : weatherError ? (
          <Text style={[text.label(), s.error]}>{weatherError}</Text>
        ) : (
          <>
            <Text style={[text.label(), s.wear]}>WEAR: </Text>
            <Text style={[text.heading(), s.outfit]}>{category.toUpperCase()}</Text>
            <Text style={[text.heading(), s.period]}>.</Text>
          </>
        )}
      </View>

      <SectionHeader label="02 / SUGGESTED" heading="SUGGESTED FOR TODAY" />

      {productsError && <Text style={[text.label(), s.error]}>Products: {productsError}</Text>}

      {productsLoading ? (
        <View style={sheet.center()}>
          <ActivityIndicator size="large" color={theme.colors.text} />
        </View>
      ) : suggested.length === 0 ? (
        <Text style={[text.label(), s.empty]}>NOTHING SUGGESTED.</Text>
      ) : (
        <FlatList
          horizontal
          data={suggested}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }: { item: Product }) => (
            <View style={s.cardWrap} key={item.id}>
              <ProductCard
                item={item}
                onPress={(id: number) => navigation.navigate('ProductDetail', { id })}
              />
            </View>
          )}
          ItemSeparatorComponent={() => <View style={s.separator} />}
          contentContainerStyle={s.listContent}
          showsHorizontalScrollIndicator={false}
        />
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  content: { padding: 16, paddingBottom: 90 },
  label: { color: theme.colors.subtext },
  weatherCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.border,
    padding: 20,
    marginBottom: 24,
  },
  temp: {
    ...text.heading(),
    fontSize: 64,
    marginBottom: 12,
    letterSpacing: -2,
  },
  wear: { marginRight: 4 },
  outfit: { fontSize: 24 },
  period: { color: theme.colors.accent, fontSize: 24 },
  error: { color: theme.colors.accent, marginBottom: 12 },
  empty: { textAlign: 'center', marginTop: 20 },
  cardWrap: { width: 150, marginEnd: 12 },
  separator: { width: 12 },
  listContent: { paddingEnd: 16 },
});
