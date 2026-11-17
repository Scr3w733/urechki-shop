import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius } from '../theme';
import { useCart } from '../context/CartContext';
import { Badge, Card, Price, ProductArt, Rating } from './ui';

export default function ProductCard({ product, onOpen, compact = false }) {
  const cart = useCart();
  const inCart = cart.items.some((item) => item.productId === Number(product.id));
  const inStock = Number(product.stockQuantity ?? 1) > 0;

  return (
    <Card style={styles.card}>
      <TouchableOpacity activeOpacity={0.85} onPress={() => onOpen?.(product.id)}>
        <ProductArt product={product} size={compact ? 'small' : 'medium'} />
      </TouchableOpacity>

      <View style={styles.body}>
        <TouchableOpacity activeOpacity={0.85} onPress={() => onOpen?.(product.id)}>
          <Text numberOfLines={2} style={styles.name}>{product.name}</Text>
          <Rating value={product.rating} />
        </TouchableOpacity>

        <Price value={product.price} style={styles.price} />

        <View style={styles.badges}>
          <Badge tone={inStock ? 'success' : 'default'}>
            {inStock ? `В наличии: ${product.stockQuantity}` : 'Нет в наличии'}
          </Badge>
          {inCart && <Badge tone="accent">В корзине</Badge>}
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          disabled={!inStock}
          onPress={() => cart.add(product)}
          style={[styles.addButton, !inStock && styles.addButtonDisabled]}
        >
          <Ionicons name="add" size={16} color={inStock ? colors.onAccent : colors.dim} />
          <Text style={[styles.addText, !inStock && { color: colors.dim }]}>
            {inStock ? 'В корзину' : 'Недоступно'}
          </Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12, flexDirection: 'row', gap: 12, padding: 12 },
  body: { flex: 1, minWidth: 0 },
  name: { color: colors.text, fontFamily: fonts.bodySemi, fontSize: 14, lineHeight: 19 },
  price: { marginTop: 6 },
  badges: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  addButton: {
    marginTop: 10,
    minHeight: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  addButtonDisabled: { backgroundColor: colors.surfaceLight },
  addText: { color: colors.onAccent, fontFamily: fonts.bodyBold, fontSize: 13 },
});
