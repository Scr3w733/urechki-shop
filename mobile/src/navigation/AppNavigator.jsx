import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { colors, fonts } from '../theme';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import HomeScreen from '../screens/HomeScreen';
import CatalogScreen from '../screens/CatalogScreen';
import ProductScreen from '../screens/ProductScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import OrdersScreen from '../screens/OrdersScreen';
import LoyaltyScreen from '../screens/LoyaltyScreen';
import TrackingScreen from '../screens/TrackingScreen';
import LoginScreen from '../screens/LoginScreen';
import PromoScreen from '../screens/PromoScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import RecentlyViewedScreen from '../screens/RecentlyViewedScreen';
import AboutScreen from '../screens/AboutScreen';
import ServiceStatusScreen from '../screens/ServiceStatusScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.accent,
    background: colors.bg,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    notification: colors.danger,
  },
  fonts: {
    ...DarkTheme.fonts,
    regular: { fontFamily: fonts.body, fontWeight: '400' },
    medium: { fontFamily: fonts.bodyMedium, fontWeight: '500' },
    bold: { fontFamily: fonts.bodyBold, fontWeight: '700' },
    heavy: { fontFamily: fonts.bodyBold, fontWeight: '700' },
  },
};

const screenOptions = {
  headerStyle: { backgroundColor: colors.bgSoft },
  headerTintColor: colors.text,
  headerTitleStyle: { fontFamily: fonts.displayMedium, fontSize: 17 },
  headerBackTitle: 'Назад',
  contentStyle: { backgroundColor: colors.bg },
};

function CatalogStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="CatalogList" component={CatalogScreen} options={{ title: 'Каталог' }} />
      <Stack.Screen name="Product" component={ProductScreen} options={({ route }) => ({
        title: String(route.params?.name || 'Товар').slice(0, 30),
      })} />
    </Stack.Navigator>
  );
}

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="HomeMain" component={HomeScreen} options={{ title: 'У Речушки' }} />
      <Stack.Screen name="Product" component={ProductScreen} options={{ title: 'Товар' }} />
    </Stack.Navigator>
  );
}

function CartStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="CartMain" component={CartScreen} options={{ title: 'Корзина' }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Оформление' }} />
      <Stack.Screen name="Catalog" component={CatalogScreen} options={{ title: 'Каталог' }} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} options={{ title: 'Профиль' }} />
      <Stack.Screen name="Orders" component={OrdersScreen} options={{ title: 'Мои заказы' }} />
      <Stack.Screen name="Loyalty" component={LoyaltyScreen} options={{ title: 'Бонусы' }} />
      <Stack.Screen name="Tracking" component={TrackingScreen} options={{ title: 'Отследить' }} />
      <Stack.Screen name="Favorites" component={FavoritesScreen} options={{ title: 'Избранное' }} />
      <Stack.Screen name="RecentlyViewed" component={RecentlyViewedScreen} options={{ title: 'Недавно смотрели' }} />
      <Stack.Screen name="Promo" component={PromoScreen} options={{ title: 'Акции и промокоды' }} />
      <Stack.Screen name="Analytics" component={AnalyticsScreen} options={{ title: 'Аналитика' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Уведомления' }} />
      <Stack.Screen name="About" component={AboutScreen} options={{ title: 'О приложении' }} />
      <Stack.Screen name="ServiceStatus" component={ServiceStatusScreen} options={{ title: 'Состояние сервисов' }} />
    </Stack.Navigator>
  );
}

function AppTabs() {
  const cart = useCart();
  const { user } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.dim,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: Platform.OS === 'ios' ? 82 : 62,
          paddingBottom: Platform.OS === 'ios' ? 18 : 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontFamily: fonts.bodyMedium, fontSize: 10 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          title: 'Главная',
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Catalog"
        component={CatalogStack}
        options={{
          title: 'Каталог',
          tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartStack}
        options={{
          title: 'Корзина',
          tabBarBadge: cart.count > 0 ? String(cart.count) : undefined,
          tabBarIcon: ({ color, size }) => <Ionicons name="cart-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          title: 'Избранное',
          tabBarIcon: ({ color, size }) => <Ionicons name="heart-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          title: user ? 'Профиль' : 'Войти',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator screenOptions={{ ...screenOptions, headerShown: false }}>
        <Stack.Screen name="App" component={AppTabs} />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: true, title: 'Вход', ...screenOptions }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
