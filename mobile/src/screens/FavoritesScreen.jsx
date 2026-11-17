import { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { api, asArray } from '../api';
import { colors, fonts } from '../theme';
import { useAuth } from '../context/AuthContext';
import { Button, Card, EmptyState, Loading } from '../components/ui';
import ProductCard from '../components/ProductCard';

export default function FavoritesScreen({ navigation }) {
  const { user } = useAuth();
  const [ids, setIds] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError('');
    try {
      const [favoriteIds, catalog] = await Promise.all([
        api.favorites(user.id),
        api.catalog({ limit: 200 }),
      ]);
      const normalized = asArray(favoriteIds, ['favorites', 'productIds', 'items']).map(String);
      const set = new Set(normalized);
      setIds(normalized);
      setProducts(asArray(catalog, ['products', 'items']).filter((product) => set.has(String(product.id))));
    } catch (err) {
      setError(err.message || 'Не удалось загрузить избранное.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const remove = async (productId) => {
    if (!user?.id) return;
    try {
      await api.removeFavorite(user.id, productId);
      setIds((prev) => prev.filter((id) => String(id) !== String(productId)));
      setProducts((prev) => prev.filter((product) => String(product.id) !== String(productId)));
    } catch (err) {
      setError(err.message || 'Не удалось убрать товар из избранного.');
    }
  };

  if (!user) {
    return (
      <View style={styles.centered}>
        <EmptyState
          icon="heart-outline"
          title="Избранное привязано к аккаунту"
          description="Войдите, чтобы синхронизировать сохранённые товары между сайтом и приложением."
          action={<Button onPress={() => navigation.navigate('Login')}>Войти</Button>}
        />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>Избранное</Text>
        <Text style={styles.subtitle}>{ids.length} сохранённых товаров</Text>
      </View>

      {loading ? (
        <Loading label="Открываем избранное…" />
      ) : error ? (
        <Card style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
          <Button variant="outline" onPress={load} icon="refresh-outline">Повторить</Button>
        </Card>
      ) : products.length === 0 ? (
        <EmptyState
          icon="heart-outline"
          title="Пока пусто"
          description="Нажмите на сердечко на странице товара, чтобы сохранить его здесь."
        />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View>
              <ProductCard
                product={item}
                onOpen={(id) => navigation.navigate('Catalog', { screen: 'Product', params: { id } })}
              />
              <Button variant="outline" style={styles.removeButton} onPress={() => remove(item.id)}>
                Убрать из избранного
              </Button>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingTop: 12 },
  header: { paddingHorizontal: 18, marginBottom: 12 },
  title: { color: colors.text, fontFamily: fonts.displayMedium, fontSize: 22 },
  subtitle: { color: colors.muted, fontFamily: fonts.body, fontSize: 12, marginTop: 4 },
  centered: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center', padding: 18 },
  list: { padding: 18, paddingBottom: 30 },
  removeButton: { minHeight: 38, marginBottom: 14, marginTop: -4 },
  errorCard: { margin: 18, gap: 12 },
  errorText: { color: colors.danger, fontFamily: fonts.body, fontSize: 13 },
});
