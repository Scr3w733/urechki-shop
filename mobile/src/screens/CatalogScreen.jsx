import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api, asArray } from '../api';
import { colors, fonts, radius } from '../theme';
import { Button, Card, Chip, EmptyState, Loading } from '../components/ui';
import ProductCard from '../components/ProductCard';

const PAGE_SIZE = 20;
const SORT_OPTIONS = [
  { id: 'popular', label: 'По популярности' },
  { id: 'cheap', label: 'Сначала дешевле' },
  { id: 'expensive', label: 'Сначала дороже' },
  { id: 'alpha', label: 'По алфавиту' },
  { id: 'stock', label: 'По наличию' },
];

export default function CatalogScreen({ navigation, route }) {
  const initialSearch = route?.params?.search || '';
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState('Все');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sort, setSort] = useState('popular');
  const [onlyInStock, setOnlyInStock] = useState(false);
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

  const displayed = useMemo(() => {
    let result = onlyInStock
      ? products.filter((item) => Number(item.stockQuantity ?? 0) > 0)
      : [...products];

    switch (sort) {
      case 'cheap':
        result.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case 'expensive':
        result.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case 'alpha':
        result.sort((a, b) => String(a.name).localeCompare(String(b.name), 'ru'));
        break;
      case 'stock':
        result.sort((a, b) => Number(b.stockQuantity ?? 0) - Number(a.stockQuantity ?? 0));
        break;
      default:
        break;
    }
    return result;
  }, [products, sort, onlyInStock]);

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

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortRow}>
        {SORT_OPTIONS.map((option) => (
          <Chip
            key={option.id}
            label={option.label}
            active={sort === option.id}
            onPress={() => { setSort(option.id); setVisible(PAGE_SIZE); }}
          />
        ))}
      </ScrollView>

      <View style={styles.filterRow}>
        <Chip
          label={onlyInStock ? '✓ Только в наличии' : 'Только в наличии'}
          active={onlyInStock}
          onPress={() => { setOnlyInStock(!onlyInStock); setVisible(PAGE_SIZE); }}
        />
        <Text style={styles.found}>{displayed.length} из {products.length}</Text>
      </View>

      {loading && products.length === 0 ? (
        <Loading label="Ищем товары…" />
      ) : error ? (
        <Card style={styles.error}>
          <Text style={styles.errorText}>{error}</Text>
          <Button variant="outline" onPress={load} icon="refresh-outline">Повторить</Button>
        </Card>
      ) : displayed.length === 0 ? (
        <EmptyState
          icon="search-outline"
          title="Ничего не нашли"
          description="Попробуйте изменить запрос, сбросить фильтр наличия или выбрать другую категорию."
        />
      ) : (
        <FlatList
          data={displayed.slice(0, visible)}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.accent} />}
          renderItem={({ item }) => (
            <ProductCard product={item} onOpen={(id) => navigation.navigate('Product', { id })} />
          )}
          ListFooterComponent={
            visible < displayed.length ? (
              <Button variant="outline" onPress={() => setVisible((v) => v + PAGE_SIZE)}>
                Показать ещё ({displayed.length - visible})
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
  sortRow: { paddingHorizontal: 18, marginBottom: 4 },
  filterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, marginTop: 8, marginBottom: 4 },
  found: { color: colors.dim, fontFamily: fonts.body, fontSize: 11 },
  list: { padding: 18, paddingBottom: 30 },
  error: { margin: 18, gap: 12 },
  errorText: { color: colors.danger, fontFamily: fonts.body, fontSize: 13 },
  end: { color: colors.dim, fontFamily: fonts.body, fontSize: 12, textAlign: 'center', marginTop: 12 },
});
