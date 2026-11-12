import { StatusBar } from 'expo-status-bar';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import { Anton_400Regular } from '@expo-google-fonts/anton';
import { SpaceMono_400Regular } from '@expo-google-fonts/space-mono';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { WardrobeProvider } from './src/context/WardrobeContext';
import { theme, text } from './src/utils/theme';
import HomeScreen from './src/screens/HomeScreen';
import ExploreScreen from './src/screens/ExploreScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import WardrobeScreen from './src/screens/WardrobeScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: theme.colors.accent,
    background: theme.colors.bg,
    card: theme.colors.surface,
    text: theme.colors.text,
    border: theme.colors.border,
    notification: theme.colors.accent,
  },
};

function TabButton({ children, onPress, style }: BottomTabBarButtonProps) {
  return (
    <Pressable onPress={onPress} style={[s.tabItem, style]}>
      <Text style={[text.label(), { fontSize: 10, letterSpacing: 1, color: theme.colors.subtext }]}>{children}</Text>
    </Pressable>
  );
}

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarButton: TabButton,
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.subtext,
        tabBarStyle: {
          backgroundColor: theme.colors.bg,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Explore" component={ExploreScreen} options={{ title: 'Explore' }} />
      <Tab.Screen name="Wardrobe" component={WardrobeScreen} options={{ title: 'Wardrobe' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [antonLoaded] = useFonts({ Anton: Anton_400Regular });
  const [spaceMonoLoaded] = useFonts({ 'Space Mono': SpaceMono_400Regular });

  if (!antonLoaded || !spaceMonoLoaded) {
    return <View style={s.splash} />;
  }

  return (
    <WardrobeProvider>
      <NavigationContainer theme={navigationTheme}>
        <StatusBar style="light" />
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: theme.colors.surface },
            headerShadowVisible: false,
            headerTintColor: theme.colors.text,
            headerTitleStyle: {
              fontFamily: theme.fonts.mono,
              fontSize: 11,
              fontWeight: '400',
            },
            headerBackTitleStyle: {
              fontFamily: theme.fonts.mono,
              fontSize: 11,
            },
          }}
        >
          <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
          <Stack.Screen
            name="ProductDetail"
            component={ProductDetailScreen}
            options={{ title: 'PRODUCT DETAILS' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </WardrobeProvider>
  );
}

const s = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  tabItem: {
    paddingVertical: 8,
    alignItems: 'center',
  },
});
