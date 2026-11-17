import { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api, asArray } from '../api';
import { colors, fonts, radius } from '../theme';
import { Button, Card, Chip, EmptyState, Loading } from '../components/ui';
import ProductCard from '../components/ProductCard';

const PAGE_SIZE = 20;

export default function CatalogScreen({ navigation, route }) {
  const initialSearch = route?.params?.search || '';
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState('Все');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const payload = await api.catalog({ category: category === 'Все' ? undefined : category, search, limit: 200 });
      setProducts(asArray(payload, ['products', 'items']));
      setCategories(asArray(payload, ['categories']).map(String));
      setVisible(PAGE_SIZE);
    } catch (err) {
      setProducts([]);
      setError(err.message || 'Не удалось загрузить каталог.');
    } finally {
      setLoading(false);
    }
  }, [category, search]);

  useEffect(() => { load(); }, [load]);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>Каталог</Text>
        <Text style={styles.subtitle}>Пиво, закуски, мерч и подарки</Text>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={colors.muted} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Найти пиво, закуски…"
          placeholderTextColor={colors.dim}
          style={styles.searchInput}
          returnKeyType="search"
          onSubmitEditing={load}
        />
        {search ? (
          <Ionicons name="close-circle" size={18} color={colors.muted} onPress={() => setSearch('')} />
        ) : null}
      </View>

      <View style={styles.chips}>
        {['Все', ...categories].map((item) => (
          <Chip key={item} label={item} active={category === item} onPress={() => setCategory(item)} />
        ))}
      </View>

      {loading && products.length === 0 ? (
        <Loading label="Ищем товары…" />
      ) : error ? (
        <Card style={styles.error}>
          <Text style={styles.errorText}>{error}</Text>
          <Button variant="outline" onPress={load} icon="refresh-outline">Повторить</Button>
        </Card>
      ) : products.length === 0 ? (
        <EmptyState
          icon="search-outline"
          title="Ничего не нашли"
          description="Попробуйте изменить запрос или выбрать другую категорию."
        />
      ) : (
        <FlatList
          data={products.slice(0, visible)}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <ProductCard product={item} onOpen={(id) => navigation.navigate('Product', { id })} />
          )}
          ListFooterComponent={
            visible < products.length ? (
              <Button variant="outline" onPress={() => setVisible((v) => v + PAGE_SIZE)}>
                Показать ещё ({products.length - visible})
              </Button>
            ) : (
              <Text style={styles.end}>Показаны все найденные товары</Text>
            )
          }
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
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginHorizontal: 18,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    minHeight: 46,
  },
  searchInput: { flex: 1, color: colors.text, fontFamily: fonts.body, fontSize: 14 },
  chips: { flexDirection: 'row', paddingHorizontal: 18, marginTop: 14, marginBottom: 6 },
  list: { padding: 18, paddingBottom: 30 },
  error: { margin: 18, gap: 12 },
  errorText: { color: colors.danger, fontFamily: fonts.body, fontSize: 13 },
  end: { color: colors.dim, fontFamily: fonts.body, fontSize: 12, textAlign: 'center', marginTop: 12 },
});
