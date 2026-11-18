import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../theme';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';
import { Button, Card, EmptyState } from '../components/ui';
import ProductCard from '../components/ProductCard';

export default function RecentlyViewedScreen({ navigation }) {
  const recent = useRecentlyViewed();

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Недавно смотрели</Text>
          <Text style={styles.subtitle}>{recent.items.length} товаров в истории</Text>
        </View>
        {recent.items.length > 0 && (
          <Button variant="outline" style={styles.clearButton} onPress={recent.clear} icon="trash-outline">
            Очистить
          </Button>
        )}
      </View>

      {recent.items.length === 0 ? (
        <EmptyState
          icon="eye-outline"
          title="История пуста"
          description="Откройте любой товар — он появится здесь, чтобы к нему было проще вернуться."
          action={<Button onPress={() => navigation.navigate('Catalog', { screen: 'CatalogList' })}>В каталог</Button>}
        />
      ) : (
        <FlatList
          data={recent.items}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View>
              <ProductCard
                product={item}
                compact
                onOpen={(id) => navigation.navigate('Catalog', { screen: 'Product', params: { id } })}
              />
              <Button
                variant="outline"
                style={styles.removeButton}
                icon="close-circle-outline"
                onPress={() => recent.remove(item.id)}
              >
                Убрать из истории
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
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 18, marginBottom: 12 },
  title: { color: colors.text, fontFamily: fonts.displayMedium, fontSize: 22 },
  subtitle: { color: colors.muted, fontFamily: fonts.body, fontSize: 12, marginTop: 4 },
  clearButton: { minHeight: 38 },
  list: { padding: 18, paddingBottom: 30 },
  removeButton: { minHeight: 36, marginTop: -4, marginBottom: 14 },
});
