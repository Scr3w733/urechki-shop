import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api, normalizeError } from '../api';
import { PROMO_CODES, promoDiscountFor } from '../config';
import { colors, fonts, radius } from '../theme';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Button, Card, Chip, Divider, EmptyState, SectionTitle } from '../components/ui';

const paymentMethods = [
  { id: 'card', label: 'Банковская карта', icon: 'card-outline' },
  { id: 'cash', label: 'При получении', icon: 'cash-outline' },
];

export default function CheckoutScreen({ navigation }) {
  const { user } = useAuth();
  const cart = useCart();
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  if (!user) {
    return (
      <View style={styles.centered}>
        <EmptyState
          icon="lock-closed-outline"
          title="Нужен вход в аккаунт"
          description="Сервер привязывает заказ к клиенту, учитывает его скидку и бонусы."
          action={<Button onPress={() => navigation.navigate('Login')}>Войти</Button>}
        />
      </View>
    );
  }

  if (result) {
    return (
      <ScrollView style={styles.root} contentContainerStyle={styles.content}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark-circle" size={46} color={colors.success} />
        </View>
        <Text style={styles.successTitle}>
          {result.failed?.length ? 'Часть заказа оформлена' : 'Заказ оформлен'}
        </Text>
        <Text style={styles.successText}>
          Сервер подтвердил {result.orders.length} позиц. на общую сумму {result.total.toLocaleString('ru-RU')} ₽.
        </Text>
        {result.failed?.length ? (
          <Card style={styles.block}>
            <Text style={styles.label}>Не оформленные позиции</Text>
            {result.failed.map((line) => <Text key={line} style={styles.hint}>• {line}</Text>)}
            <Text style={styles.hint}>Они остались в корзине — можно повторить оформление.</Text>
          </Card>
        ) : null}
        {result.orders.map((order) => (
          <Card key={order.id} style={styles.orderCard}>
            <Text style={styles.orderTitle}>Заказ №{order.id}</Text>
            <Text style={styles.orderLine}>Статус: {order.status}</Text>
            <Text style={styles.orderLine}>К оплате: {Number(order.finalPrice).toLocaleString('ru-RU')} ₽</Text>
            {order.transactionId ? <Text style={styles.orderLine}>Транзакция: {order.transactionId}</Text> : null}
          </Card>
        ))}
        <Button icon="receipt-outline" onPress={() => navigation.navigate('Profile', { screen: 'Orders' })}>Посмотреть мои заказы</Button>
        <Button variant="outline" style={styles.secondButton} onPress={() => navigation.navigate('Catalog')}>Вернуться в каталог</Button>
      </ScrollView>
    );
  }

  if (cart.items.length === 0) {
    return (
      <View style={styles.centered}>
        <EmptyState
          icon="cart-outline"
          title="Нечего оформлять"
          description="Сначала добавьте товары в корзину."
          action={<Button onPress={() => navigation.navigate('Catalog')}>В каталог</Button>}
        />
      </View>
    );
  }

  const submit = async () => {
    setBusy(true);
    setError('');
    api.trackEvent({ type: 'checkout_start', customerId: user.id, amount: cart.baseTotal });
    try {
      const payloads = cart.items.map((item, index) => {
        const payload = {
          customerId: Number(user.id),
          productId: item.productId,
          quantity: item.quantity,
          paymentMethod,
        };
        // Промокод и бонусы применяем только к первой позиции: сервер считает
        // скидку на один заказ, а не на всю корзину целиком.
        if (index === 0) {
          if (cart.promoCode) payload.promoCode = cart.promoCode;
          if (cart.bonusSpent > 0) payload.bonusSpent = cart.bonusSpent;
        }
        return payload;
      });

      // Отправляем позиции параллельно и убираем из корзины только те,
      // которые сервер действительно создал. Повторная попытка не продублирует
      // уже оплаченные заказы.
      const responses = await Promise.allSettled(payloads.map((payload) => api.createOrder(payload)));
      const created = [];
      const succeededProductIds = [];
      const failed = [];
      responses.forEach((response, index) => {
        const item = cart.items[index];
        if (response.status === 'fulfilled' && response.value?.id != null) {
          created.push(response.value);
          succeededProductIds.push(item.productId);
          api.trackEvent({
            type: 'order_created',
            customerId: user.id,
            productId: item.productId,
            amount: Number(response.value.finalPrice),
          });
          return;
        }
        const reason = response.status === 'rejected'
          ? normalizeError(response.reason, 'Ошибка сервера')
          : 'Сервер не вернул номер заказа';
        failed.push(`${item.name}: ${reason}`);
      });

      if (created.length === 0) {
        setError(failed.length > 0 ? `Не удалось оформить заказ. ${failed.join('; ')}` : 'Не удалось оформить заказ.');
        return;
      }

      if (address.trim() && created[0]?.id) {
        try {
          await api.createShipment({
            orderId: Number(created[0].id),
            customerId: Number(user.id),
            address: address.trim(),
          });
        } catch {
          // Адрес не является частью контракта заказа — доставку можно
          // оформить позже из раздела «Отследить».
        }
      }

      const total = created.reduce((sum, order) => sum + Number(order.finalPrice || 0), 0);
      await cart.removeMany(succeededProductIds);
      setResult({ orders: created, total, failed });
    } catch (err) {
      setError(normalizeError(err, 'Не удалось оформить заказ.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <SectionTitle title="Оформление" subtitle="Проверьте данные перед оплатой" />

      <Card style={styles.block}>
        <Text style={styles.label}>Адрес доставки</Text>
        <TextInput
          value={address}
          onChangeText={setAddress}
          placeholder="Улица, дом, город"
          placeholderTextColor={colors.dim}
          style={styles.input}
        />
        <Text style={styles.hint}>Нужен только для отслеживания — в заказ не попадает.</Text>
      </Card>

      <View style={styles.block}>
        <Text style={styles.label}>Способ оплаты</Text>
        <View style={styles.paymentRow}>
          {paymentMethods.map((method) => (
            <Chip
              key={method.id}
              label={method.label}
              active={paymentMethod === method.id}
              onPress={() => setPaymentMethod(method.id)}
              style={styles.paymentChip}
            />
          ))}
        </View>
      </View>

      <Card style={styles.block}>
        <Text style={styles.label}>Промокод</Text>
        <View style={styles.promoRow}>
          <TextInput
            value={cart.promoCode}
            onChangeText={(text) => cart.setPromoCode(text.toUpperCase())}
            placeholder="Например, URE4KA"
            placeholderTextColor={colors.dim}
            style={[styles.input, styles.promoInput]}
            autoCapitalize="characters"
          />
          <Button
            variant="outline"
            onPress={() => cart.setPromoCode(PROMO_CODES[0])}
            style={styles.promoButton}
          >
            URE4KA
          </Button>
        </View>
        <TextInput
          value={String(cart.bonusSpent || '')}
          onChangeText={(text) => {
            const available = Number(user.bonusPoints) || 0;
            const afterPromo = Math.max(0, cart.baseTotal - promoDiscountFor(cart.promoCode, cart.baseTotal));
            const limit = Math.max(0, Math.min(available, Math.floor(afterPromo)));
            const digits = Number(text.replace(/\D/g, '')) || 0;
            cart.setBonusSpent(Math.min(digits, limit));
          }}
          placeholder="Списать бонусов"
          placeholderTextColor={colors.dim}
          keyboardType="numeric"
          style={[styles.input, styles.bonusInput]}
        />
        <Text style={styles.hint}>
          Доступно бонусов: {user.bonusPoints ?? 0}. Промокод и бонусы применяются к первой позиции заказа.
        </Text>
      </Card>

      <Card style={styles.block}>
        <SectionTitle title="Ваши позиции" />
        {cart.items.map((item) => (
          <View key={item.productId} style={styles.line}>
            <Text style={styles.lineName} numberOfLines={2}>{item.name}</Text>
            <Text style={styles.lineValue}>{item.quantity} × {item.price.toLocaleString('ru-RU')} ₽</Text>
          </View>
        ))}
        <Divider />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Итого ориентировочно</Text>
          <Text style={styles.totalValue}>{cart.estimatedTotal.toLocaleString('ru-RU')} ₽</Text>
        </View>
      </Card>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button loading={busy} icon="lock-closed-outline" onPress={submit}>
        {busy ? 'Отправляем…' : `Оформить ${cart.items.length} заказ(ов)`}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 18, paddingBottom: 40 },
  centered: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center', padding: 18 },
  block: { marginBottom: 16, gap: 8 },
  label: { color: colors.muted, fontFamily: fonts.bodySemi, fontSize: 12 },
  input: {
    minHeight: 46,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.sm,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 14,
    paddingHorizontal: 12,
  },
  hint: { color: colors.dim, fontFamily: fonts.body, fontSize: 11, lineHeight: 16 },
  paymentRow: { flexDirection: 'row', flexWrap: 'wrap' },
  paymentChip: { marginRight: 8, marginBottom: 8 },
  promoRow: { flexDirection: 'row', gap: 8 },
  promoInput: { flex: 1 },
  promoButton: { minHeight: 46 },
  bonusInput: { marginTop: 4 },
  line: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, paddingVertical: 6 },
  lineName: { flex: 1, color: colors.text, fontFamily: fonts.body, fontSize: 13 },
  lineValue: { color: colors.muted, fontFamily: fonts.bodyMedium, fontSize: 12 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel: { color: colors.muted, fontFamily: fonts.body, fontSize: 13 },
  totalValue: { color: colors.accent, fontFamily: fonts.bodyBold, fontSize: 16 },
  error: { color: colors.danger, fontFamily: fonts.body, fontSize: 13, marginBottom: 12 },
  successIcon: { alignItems: 'center', marginTop: 20 },
  successTitle: { color: colors.text, fontFamily: fonts.displayMedium, fontSize: 22, textAlign: 'center', marginTop: 10 },
  successText: { color: colors.muted, fontFamily: fonts.body, fontSize: 13, textAlign: 'center', marginTop: 8, marginBottom: 20 },
  orderCard: { marginBottom: 10, gap: 5 },
  orderTitle: { color: colors.accent, fontFamily: fonts.bodyBold, fontSize: 14 },
  orderLine: { color: colors.muted, fontFamily: fonts.body, fontSize: 12 },
  secondButton: { marginTop: 10 },
});
