import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
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

  if (weatherLoading && productsLoading) {
    return (
      <View style={s.center}><ActivityIndicator size="large" /></View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={s.content}
      refreshControl={
        <RefreshControl refreshing={weatherLoading || productsRefreshing} onRefresh={onRefresh} />
      }
    >
      <View style={s.card}>
        <Text style={s.cardTitle}>Weather today</Text>
        {weatherLoading ? (
          <Text style={s.temp}>Loading&hellip;</Text>
        ) : weatherError ? (
          <View>
            <Text style={s.temp}>Weather unavailable</Text>
            <Pressable style={s.retry} onPress={fetchWeather}>
              <Text style={s.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : weather ? (
          <Text style={s.temp}>{weather.temperature}°C &middot; {weather.condition}</Text>
        ) : (
          <Text style={s.temp}>&mdash;</Text>
        )}
      </View>

      {productsError && (
        <Text style={s.errorText}>Products: {productsError}</Text>
      )}

      <Text style={s.sectionTitle}>Suggested for today</Text>
      {productsLoading ? (
        <View style={s.center}><ActivityIndicator size="small" /></View>
      ) : suggested.length === 0 ? (
        <Text style={s.empty}>No suggestions for today.</Text>
      ) : (
        <FlatList
          horizontal
          data={suggested}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }: { item: Product }) => (
            <View style={s.cardWrap} key={item.id}>
              <ProductCard item={item} onPress={(id: number) => navigation.navigate('ProductDetail', { id })} />
            </View>
          )}
          ItemSeparatorComponent={() => <View style={s.separator} />}
          style={s.list}
          contentContainerStyle={s.listContent}
          showsHorizontalScrollIndicator={false}
        />
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  content: { padding: 12, paddingBottom: 90 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  temp: { fontSize: 22, fontWeight: '600' },
  retry: { marginTop: 6, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#eef6ff', borderRadius: 8 },
  retryText: { color: '#1e6fb5', fontWeight: '600' },
  errorText: { color: '#b33', textAlign: 'center', marginBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  empty: { textAlign: 'center', color: '#666', marginTop: 20 },
  cardWrap: { width: 150, marginEnd: 10 },
  separator: { width: 10 },
  list: { height: 230 },
  listContent: { paddingEnd: 12 },
});
