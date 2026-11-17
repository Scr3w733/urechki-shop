import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius } from '../theme';
import { useCart } from '../context/CartContext';
import { Button, Card, Divider, EmptyState, Price, SectionTitle } from '../components/ui';

export default function CartScreen({ navigation }) {
  const cart = useCart();

  if (cart.items.length === 0) {
    return (
      <View style={styles.centered}>
        <EmptyState
          icon="cart-outline"
          title="Корзина пуста"
          description="Добавьте товары из каталога — они появятся здесь."
          action={<Button onPress={() => navigation.navigate('Catalog')}>Перейти в каталог</Button>}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <SectionTitle title="Корзина" subtitle={`${cart.count} шт.`} />

      {cart.items.map((item) => (
        <Card key={item.productId} style={styles.item}>
          <View style={styles.itemHead}>
            <Text style={styles.itemName}>{item.name}</Text>
            <TouchableOpacity onPress={() => cart.remove(item.productId)}>
              <Ionicons name="trash-outline" size={19} color={colors.danger} />
            </TouchableOpacity>
          </View>
          <View style={styles.itemRow}>
            <Price value={item.price * item.quantity} />
            <View style={styles.quantityRow}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => cart.updateQuantity(item.productId, item.quantity - 1)}
              >
                <Ionicons name="remove" size={17} color={colors.text} />
              </TouchableOpacity>
              <Text style={styles.quantityValue}>{item.quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => cart.updateQuantity(item.productId, item.quantity + 1)}
              >
                <Ionicons name="add" size={17} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.unitPrice}>{item.price.toLocaleString('ru-RU')} ₽ за шт.</Text>
        </Card>
      ))}

      <Card style={styles.summary}>
        <Row label="Товары" value={`${cart.baseTotal.toLocaleString('ru-RU')} ₽`} />
        <Row label="Списание бонусов" value={`− ${cart.bonusSpent.toLocaleString('ru-RU')} ₽`} />
        <Divider />
        <Row label="Итого (ориентировочно)" value={`${cart.estimatedTotal.toLocaleString('ru-RU')} ₽`} accent />
        <Text style={styles.hint}>
          Точную сумму, скидку по промокоду и списание бонусов рассчитает сервер при оформлении.
        </Text>
      </Card>

      <Button
        icon="card-outline"
        onPress={() => {
          navigation.navigate('Checkout');
        }}
      >
        Перейти к оформлению
      </Button>
    </ScrollView>
  );
}

function Row({ label, value, accent }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, accent && styles.rowAccent]}>{label}</Text>
      <Text style={[styles.rowValue, accent && styles.rowAccent]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 18, paddingBottom: 36 },
  centered: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center', padding: 18 },
  item: { marginBottom: 12 },
  itemHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
  itemName: { flex: 1, color: colors.text, fontFamily: fonts.bodySemi, fontSize: 14 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  unitPrice: { color: colors.dim, fontFamily: fonts.body, fontSize: 11, marginTop: 6 },
  quantityRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  quantityButton: { width: 32, height: 32, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  quantityValue: { color: colors.text, fontFamily: fonts.bodyBold, fontSize: 14, minWidth: 24, textAlign: 'center' },
  summary: { marginTop: 8, marginBottom: 18, gap: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  rowLabel: { color: colors.muted, fontFamily: fonts.body, fontSize: 13 },
  rowValue: { color: colors.text, fontFamily: fonts.bodySemi, fontSize: 13 },
  rowAccent: { color: colors.accent, fontFamily: fonts.bodyBold, fontSize: 15 },
  hint: { color: colors.dim, fontFamily: fonts.body, fontSize: 11, lineHeight: 16, marginTop: 6 },
});
