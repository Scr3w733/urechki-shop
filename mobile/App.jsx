import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';
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

  useEffect(() => {
    // Регистрируем шрифты под именами, используемыми в теме (Unbounded-700Bold и т.д.).
    if (!unboundedLoaded || !manropeLoaded) return;
    Text.defaultProps = Text.defaultProps || {};
    Text.defaultProps.style = [{ color: colors.text }];
  }, [unboundedLoaded, manropeLoaded]);

  if (!unboundedLoaded || !manropeLoaded) return null;

  return (
    <AuthProvider>
      <CartProvider>
        <StatusBar style="light" backgroundColor={colors.bg} />
        <AppNavigator />
      </CartProvider>
    </AuthProvider>
  );
}
