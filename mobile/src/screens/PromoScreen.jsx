import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PROMO_CODES, PROMO_DETAILS } from '../config';
import { colors, fonts, radius } from '../theme';
import { useCart } from '../context/CartContext';
import { Button, Card, SectionTitle } from '../components/ui';

export default function PromoScreen({ navigation }) {
  const cart = useCart();

  const apply = (code) => {
    cart.setPromoCode(code);
    navigation.navigate('Cart');
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Card style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons name="pricetags" size={26} color={colors.accent} />
        </View>
        <Text style={styles.heroTitle}>Акции и промокоды</Text>
        <Text style={styles.heroText}>
          Выберите промокод — он подставится в корзину. Точную скидку и итоговую сумму всегда посчитает сервер при оформлении.
        </Text>
        {cart.promoCode ? (
          <Text style={styles.active}>Активен: {cart.promoCode}</Text>
        ) : (
          <Text style={styles.hint}>Сейчас промокод не выбран</Text>
        )}
      </Card>

      <View style={styles.block}>
        <SectionTitle title="Доступные промокоды" subtitle="Действуют на сайте и в приложении" />
        {PROMO_CODES.map((code) => {
          const detail = PROMO_DETAILS[code] || {};
          const active = cart.promoCode === code;
          return (
            <Card key={code} style={[styles.promo, active && styles.promoActive]}>
              <View style={styles.promoHead}>
                <Text style={styles.code}>{code}</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{detail.badge || 'Промо'}</Text>
                </View>
              </View>
              <Text style={styles.promoTitle}>{detail.title || 'Промокод'}</Text>
              <Text style={styles.promoText}>{detail.description || 'Скидка при оформлении заказа'}</Text>
              <Button
                variant={active ? 'outline' : 'primary'}
                style={styles.promoButton}
                icon={active ? 'checkmark-circle-outline' : 'cart-outline'}
                onPress={() => apply(code)}
              >
                {active ? 'Применён — в корзину' : 'Применить и в корзину'}
              </Button>
            </Card>
          );
        })}
      </View>

      <Card style={styles.note}>
        <Ionicons name="information-circle-outline" size={20} color={colors.accent} />
        <Text style={styles.noteText}>
          Сервер проверяет промокод, роль клиента и остатки товара. Несколько промокодов одновременно не складываются.
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 18, paddingBottom: 40 },
  hero: { alignItems: 'center', paddingVertical: 24 },
  heroIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  heroTitle: { color: colors.text, fontFamily: fonts.displayMedium, fontSize: 21, marginTop: 12 },
  heroText: { color: colors.muted, fontFamily: fonts.body, fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 8 },
  active: { color: colors.success, fontFamily: fonts.bodyBold, fontSize: 12, marginTop: 12 },
  hint: { color: colors.dim, fontFamily: fonts.body, fontSize: 12, marginTop: 12 },
  block: { marginTop: 26 },
  promo: { marginBottom: 12, gap: 6 },
  promoActive: { borderColor: colors.accent },
  promoHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  code: { color: colors.accent, fontFamily: fonts.displayMedium, fontSize: 18, letterSpacing: 1 },
  badge: { backgroundColor: colors.accentSoft, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: colors.accent, fontFamily: fonts.bodyBold, fontSize: 11 },
  promoTitle: { color: colors.text, fontFamily: fonts.bodyBold, fontSize: 14 },
  promoText: { color: colors.muted, fontFamily: fonts.body, fontSize: 12, lineHeight: 18 },
  promoButton: { minHeight: 40, marginTop: 8 },
  note: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginTop: 12 },
  noteText: { flex: 1, color: colors.muted, fontFamily: fonts.body, fontSize: 12, lineHeight: 18 },
});
