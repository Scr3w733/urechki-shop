import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api, asArray } from '../api';
import { colors, fonts, radius } from '../theme';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';
import { Badge, Button, Card, Loading, Price, ProductArt, Rating, SectionTitle } from '../components/ui';

export default function ProductScreen({ route, navigation }) {
  const id = route?.params?.id;
  const { user } = useAuth();
  const cart = useCart();
  const recent = useRecentlyViewed();
  const [product, setProduct] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [favoriteError, setFavoriteError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [favorite, setFavorite] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const payload = await api.product(id);
      setProduct(payload);
      recent.add(payload);
      api.trackEvent({ type: 'screen_view', screen: 'product' });
      try {
        const related = await api.catalog({ category: payload.category, limit: 30 });
        setSimilar(asArray(related, ['products', 'items'])
          .filter((item) => String(item.id) !== String(id))
          .slice(0, 4));
      } catch {
        setSimilar([]);
      }
      api.trackEvent({ type: 'view_product', productId: Number(id), amount: Number(payload?.price) || null });
      if (user?.id) {
        try {
          const ids = asArray(await api.favorites(user.id), ['favorites', 'productIds']).map(String);
          setFavorite(ids.includes(String(id)));
        } catch {
          setFavorite(false);
        }
      }
    } catch (err) {
      setError(err.message || 'Не удалось загрузить товар.');
    } finally {
      setLoading(false);
    }
  }, [id, user?.id, recent.add]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    setQuantity(1);
    setFavorite(false);
    setFavoriteError('');
  }, [id]);

  const toggleFavorite = async () => {
    if (!user?.id) {
      navigation.navigate('Login');
      return;
    }
    try {
      if (favorite) await api.removeFavorite(user.id, id);
      else await api.addFavorite(user.id, id);
      setFavorite(!favorite);
    } catch (err) {
      // Ошибка избранного не должна заменять сам товар экраном «Повторить».
      setFavoriteError(err.message || 'Не удалось обновить избранное.');
    }
  };

  if (loading) return <Loading label="Открываем товар…" />;

  if (error || !product) {
    return (
      <View style={styles.centered}>
        <Card style={styles.errorCard}>
          <Text style={styles.errorText}>{error || 'Товар не найден.'}</Text>
          <Button variant="outline" onPress={load} icon="refresh-outline">Повторить</Button>
        </Card>
      </View>
    );
  }

  const inStock = product.inStock !== false && Number(product.stockQuantity ?? 1) > 0;
  const maxQuantity = inStock ? Math.max(1, Number(product.stockQuantity) || 1) : 0;
  const specs = asArray(product.specs, ['specs', 'items']);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.artWrap}>
        <ProductArt product={product} size="large" />
        <TouchableOpacity style={styles.favButton} onPress={toggleFavorite}>
          <Ionicons name={favorite ? 'heart' : 'heart-outline'} size={22} color={favorite ? colors.danger : colors.text} />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>{product.name}</Text>
      <View style={styles.meta}>
        <Rating value={product.rating} />
        <Badge tone={inStock ? 'success' : 'default'}>
          {inStock ? `В наличии: ${product.stockQuantity ?? '—'}` : 'Нет в наличии'}
        </Badge>
      </View>

      {favoriteError ? <Text style={styles.favoriteError}>{favoriteError}</Text> : null}

      <Price value={product.price} style={styles.price} />

      {product.description ? <Text style={styles.description}>{product.description}</Text> : null}

      {specs.length > 0 && (
        <View style={styles.block}>
          <SectionTitle title="Характеристики" />
          <Card>
            {specs.map((spec, index) => (
              <View key={`${spec.label}-${index}`} style={styles.specRow}>
                <Text style={styles.specLabel}>{spec.label}</Text>
                <Text style={styles.specValue}>{spec.value}</Text>
                {spec.note ? <Text style={styles.specNote}>{spec.note}</Text> : null}
              </View>
            ))}
          </Card>
        </View>
      )}

      <View style={styles.block}>
        <SectionTitle title="Количество" />
        <View style={styles.quantityRow}>
          <TouchableOpacity
            style={[styles.quantityButton, quantity <= 1 && styles.quantityDisabled]}
            disabled={quantity <= 1}
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
          >
            <Ionicons name="remove" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.quantityValue}>{quantity}</Text>
          <TouchableOpacity
            style={[styles.quantityButton, quantity >= maxQuantity && styles.quantityDisabled]}
            disabled={quantity >= maxQuantity}
            onPress={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
          >
            <Ionicons name="add" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
        <Text style={styles.hint}>Доступно: {maxQuantity} шт. Не больше остатка на складе.</Text>
      </View>

      {similar.length > 0 && (
        <View style={styles.block}>
          <SectionTitle title="Похожие товары" subtitle="Из этой же категории" />
          {similar.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.85}
              onPress={() => navigation.setParams({ id: item.id, name: item.name })}
              style={styles.similarRow}
            >
              <ProductArt product={item} size="small" />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text numberOfLines={2} style={styles.similarName}>{item.name}</Text>
                <Price value={item.price} style={styles.similarPrice} />
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.dim} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Button
        disabled={!inStock}
        icon="cart-outline"
        onPress={() => {
          cart.add({ ...product, emoji: '🍺' }, quantity);
          navigation.navigate('Cart');
        }}
      >
        {inStock ? `Добавить в корзину · ${(Number(product.price) * quantity).toLocaleString('ru-RU')} ₽` : 'Товар недоступен'}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 18, paddingBottom: 40 },
  centered: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center', padding: 18 },
  errorCard: { gap: 14 },
  errorText: { color: colors.danger, fontFamily: fonts.body, fontSize: 14 },
  favoriteError: { color: colors.danger, fontFamily: fonts.body, fontSize: 12, marginTop: 8 },
  hint: { color: colors.dim, fontFamily: fonts.body, fontSize: 11, marginTop: 8 },
  artWrap: { alignItems: 'center', position: 'relative', marginVertical: 10 },
  favButton: { position: 'absolute', top: 0, right: 0, width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  title: { color: colors.text, fontFamily: fonts.displayMedium, fontSize: 21, lineHeight: 28, marginTop: 14 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10 },
  price: { fontSize: 26, marginTop: 14 },
  description: { color: colors.muted, fontFamily: fonts.body, fontSize: 14, lineHeight: 21, marginTop: 14 },
  block: { marginTop: 24 },
  specRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  specLabel: { color: colors.muted, fontFamily: fonts.bodyMedium, fontSize: 12 },
  specValue: { color: colors.text, fontFamily: fonts.bodySemi, fontSize: 14, marginTop: 3 },
  specNote: { color: colors.dim, fontFamily: fonts.body, fontSize: 11, marginTop: 3 },
  quantityRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  quantityButton: { width: 42, height: 42, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  quantityDisabled: { opacity: 0.4 },
  quantityValue: { color: colors.text, fontFamily: fonts.displayMedium, fontSize: 20, minWidth: 34, textAlign: 'center' },
  similarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 10,
    marginBottom: 9,
  },
  similarName: { color: colors.text, fontFamily: fonts.bodyMedium, fontSize: 13, lineHeight: 18 },
  similarPrice: { fontSize: 14, marginTop: 4 },
});
