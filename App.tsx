import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WardrobeProvider } from './src/context/WardrobeContext';
import ExploreScreen from './src/screens/ExploreScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import WardrobeScreen from './src/screens/WardrobeScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <WardrobeProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator>
          <Stack.Screen name="Explore" component={ExploreScreen} options={{ title: 'Explore' }} />
          <Stack.Screen
            name="ProductDetail"
            component={ProductDetailScreen}
            options={{ title: 'Product Details' }}
          />
          <Stack.Screen name="Wardrobe" component={WardrobeScreen} options={{ title: 'Wardrobe' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </WardrobeProvider>
  );
}
