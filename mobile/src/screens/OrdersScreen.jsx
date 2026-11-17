import { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { api, asArray } from '../api';
import { colors, fonts } from '../theme';
import { useAuth } from '../context/AuthContext';
import { Badge, Button, Card, EmptyState, Loading, Price } from '../components/ui';

export default function OrdersScreen({ navigation }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError('');
    try {
      const payload = await api.orders(user.id);
      setOrders(asArray(payload, ['orders', 'items']));
    } catch (err) {
      setError(err.message || 'Не удалось загрузить заказы.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  if (!user) {
    return (
      <View style={styles.centered}>
        <EmptyState
          icon="receipt-outline"
          title="Заказы видны после входа"
          description="Войдите в аккаунт, чтобы посмотреть историю покупок."
          action={<Button onPress={() => navigation.navigate('Login')}>Войти</Button>}
        />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>Мои заказы</Text>
        <Text style={styles.subtitle}>{orders.length} заказов в истории</Text>
      </View>

      {loading ? (
        <Loading label="Загружаем заказы…" />
      ) : error ? (
        <Card style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
          <Button variant="outline" onPress={load} icon="refresh-outline">Повторить</Button>
        </Card>
      ) : orders.length === 0 ? (
        <EmptyState
          icon="receipt-outline"
          title="Заказов пока нет"
          description="Оформите первый заказ — он появится здесь."
          action={<Button onPress={() => navigation.navigate('Catalog')}>В каталог</Button>}
        />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Card style={styles.order}>
              <View style={styles.orderHead}>
                <Text style={styles.orderId}>Заказ №{item.id}</Text>
                <Badge tone={item.status === 'Оплачен' ? 'success' : 'accent'}>{item.status}</Badge>
              </View>
              <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
              <Price value={item.finalPrice} style={styles.price} />
              <Text style={styles.details}>
                Товар №{item.productId} · {item.quantity} шт.
                {item.promoCode ? ` · промокод ${item.promoCode}` : ''}
                {item.bonusSpent ? ` · бонусы ${item.bonusSpent}` : ''}
              </Text>
              {item.transactionId ? <Text style={styles.transaction}>{item.transactionId}</Text> : null}
              <TouchableOpacity onPress={() => navigation.navigate('Tracking', { orderId: String(item.id) })}>
                <Text style={styles.trackLink}>Отследить доставку →</Text>
              </TouchableOpacity>
            </Card>
          )}
        />
      )}
    </View>
  );
}

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('ru-RU');
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingTop: 12 },
  header: { paddingHorizontal: 18, marginBottom: 12 },
  title: { color: colors.text, fontFamily: fonts.displayMedium, fontSize: 22 },
  subtitle: { color: colors.muted, fontFamily: fonts.body, fontSize: 12, marginTop: 4 },
  centered: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center', padding: 18 },
  list: { padding: 18, paddingBottom: 30 },
  order: { marginBottom: 12, gap: 6 },
  orderHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  orderId: { color: colors.text, fontFamily: fonts.bodyBold, fontSize: 15 },
  date: { color: colors.dim, fontFamily: fonts.body, fontSize: 11 },
  price: { marginTop: 4 },
  details: { color: colors.muted, fontFamily: fonts.body, fontSize: 12 },
  transaction: { color: colors.dim, fontFamily: fonts.body, fontSize: 10 },
  trackLink: { color: colors.accent, fontFamily: fonts.bodySemi, fontSize: 12, marginTop: 6 },
  errorCard: { margin: 18, gap: 12 },
  errorText: { color: colors.danger, fontFamily: fonts.body, fontSize: 13 },
});
