import { StatusBar } from 'expo-status-bar';
import { useFonts, Unbounded_400Regular, Unbounded_600SemiBold, Unbounded_700Bold } from '@expo-google-fonts/unbounded';
import {
  useFonts as useManrope,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from '@expo-google-fonts/manrope';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { RecentlyViewedProvider } from './src/context/RecentlyViewedContext';
import AppNavigator from './src/navigation/AppNavigator';
import { colors } from './src/theme';

export default function App() {
  const [unboundedLoaded] = useFonts({
    Unbounded_400Regular,
    Unbounded_600SemiBold,
    Unbounded_700Bold,
  });
  const [manropeLoaded] = useManrope({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  if (!unboundedLoaded || !manropeLoaded) return null;

  return (
    <AuthProvider>
      <CartProvider>
        <RecentlyViewedProvider>
          <StatusBar style="light" backgroundColor={colors.bg} />
          <AppNavigator />
        </RecentlyViewedProvider>
      </CartProvider>
    </AuthProvider>
  );
}
