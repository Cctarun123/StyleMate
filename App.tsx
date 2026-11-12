import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import {
  LibreBaskerville_400Regular,
  LibreBaskerville_700Bold,
} from '@expo-google-fonts/libre-baskerville';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { WardrobeProvider } from './src/context/WardrobeContext';
import { CartProvider } from './src/context/CartContext';
import { colors } from './src/utils/theme';
import HomeScreen from './src/screens/HomeScreen';
import ExploreScreen from './src/screens/ExploreScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import WardrobeScreen from './src/screens/WardrobeScreen';
import CartScreen from './src/screens/CartScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import OrderSuccessScreen from './src/screens/OrderSuccessScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, { outline: string; filled: string }> = {
  Home: { outline: 'home-outline', filled: 'home' },
  Explore: { outline: 'search-outline', filled: 'search' },
  Wardrobe: { outline: 'heart-outline', filled: 'heart' },
};

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, size }: any) => {
          const icon = TAB_ICONS[route.name];
          return (
            <Ionicons
              name={(focused ? icon.filled : icon.outline) as any}
              size={size ?? 24}
              color={focused ? colors.dark : colors.subtext}
            />
          );
        },
        tabBarActiveTintColor: colors.dark,
        tabBarInactiveTintColor: colors.subtext,
        tabBarStyle: {
          backgroundColor: colors.bg,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Explore" component={ExploreScreen} options={{ title: 'Explore' }} />
      <Tab.Screen name="Wardrobe" component={WardrobeScreen} options={{ title: 'Wardrobe' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    LibreBaskerville_400Regular,
    LibreBaskerville_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  if (!fontsLoaded) {
    return <View style={s.splash} />;
  }

  return (
    <SafeAreaProvider>
      <WardrobeProvider>
        <CartProvider>
          <NavigationContainer theme={DefaultTheme}>
          <StatusBar style="dark" />
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Tabs" component={Tabs} />
            <Stack.Screen
              name="ProductDetail"
              component={ProductDetailScreen}
              options={{ title: 'Product Details' }}
            />
            <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Cart' }} />
            <Stack.Screen
              name="Checkout"
              component={CheckoutScreen}
              options={{ title: 'Checkout' }}
            />
            <Stack.Screen
              name="OrderSuccess"
              component={OrderSuccessScreen}
              options={{ title: 'Order Confirmed' }}
            />
            <Stack.Screen name="Orders" component={OrdersScreen} options={{ title: 'My Orders' }} />
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
          </Stack.Navigator>
        </NavigationContainer>
      </CartProvider>
      </WardrobeProvider>
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  tabItem: {
    paddingVertical: 8,
    alignItems: 'center',
  },
});
