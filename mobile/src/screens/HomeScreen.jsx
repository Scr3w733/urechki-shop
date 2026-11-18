import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api, asArray } from '../api';
import { colors, fonts, radius } from '../theme';
import { useAuth } from '../context/AuthContext';
import { Button, Card, Loading, ProductArt, SectionTitle } from '../components/ui';
import ProductCard from '../components/ProductCard';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('Все');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const payload = await api.home(user?.id);
      setData(payload);
    } catch (err) {
      setError(err.message || 'Не удалось загрузить главную страницу.');
      try {
        const fallback = await api.catalog({ limit: 8 });
        setData({
          hero: {
            title: 'Любимое пиво — всегда под рукой',
            subtitle: 'Свежие сорта, бонусы за каждый заказ и избранное в одном приложении',
          },
          categories: [],
          featuredProducts: asArray(fallback, ['products']).slice(0, 8),
        });
      } catch {
        setData(null);
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  if (loading && !data) return <Loading label="Открываем пивоварню…" />;

  const hero = data?.hero || {};
  const categories = data?.categories || [];
  const products = asArray(data?.featuredProducts, ['products', 'items']);
  const visible = category === 'Все'
    ? products
    : products.filter((product) => product.category === category);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.badge}>{hero.badge || 'Доставка по городу'}</Text>
        <Text style={styles.heroTitle}>{hero.title || 'У Речушки'}</Text>
        <Text style={styles.heroSubtitle}>{hero.subtitle || 'Настоящий сибирский крафт с 2015 года'}</Text>
        <View style={styles.heroActions}>
          <Button onPress={() => navigation.navigate('Catalog')} icon="beer-outline">
            {hero.primaryButton || 'Перейти в каталог'}
          </Button>
          <Button variant="outline" onPress={() => navigation.navigate('Profile', { screen: 'Orders' })} icon="receipt-outline">
            {hero.secondaryButton || 'Мои заказы'}
          </Button>
        </View>
        <View style={styles.heroArt}>
          <ProductArt product={{ name: 'IPA', category: 'Пиво' }} size="large" />
        </View>
      </View>

      {error ? (
        <Card style={styles.error}>
          <Text style={styles.errorText}>{error}</Text>
          <Button variant="outline" onPress={load} icon="refresh-outline">Повторить</Button>
        </Card>
      ) : null}

      {categories.length > 0 && (
        <View style={styles.block}>
          <SectionTitle title="Категории" subtitle="Всё, что найдётся в кладовке" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['Все', ...categories].map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => setCategory(item)}
                style={[styles.categoryChip, category === item && styles.categoryChipActive]}
              >
                <Text style={[styles.categoryText, category === item && styles.categoryTextActive]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.block}>
        <SectionTitle
          title="Популярное"
          subtitle={visible.length ? `${visible.length} позиций` : 'Скоро здесь появятся товары'}
          action={
            <TouchableOpacity onPress={() => navigation.navigate('Catalog')}>
              <Ionicons name="arrow-forward" size={20} color={colors.accent} />
            </TouchableOpacity>
          }
        />
        {visible.length > 0
          ? visible.map((product) => (
            <ProductCard key={product.id} product={product} onOpen={(id) => navigation.navigate('Product', { id })} />
          ))
          : <Card><Text style={styles.muted}>В этой категории пока ничего нет.</Text></Card>}
      </View>

      <View style={styles.block}>
        <SectionTitle title="Быстрые действия" subtitle="Часто нужные разделы в один тап" />
        <View style={styles.quickGrid}>
          <QuickAction
            icon="pricetags-outline"
            label="Акции"
            onPress={() => navigation.navigate('Profile', { screen: 'Promo' })}
          />
          <QuickAction
            icon="eye-outline"
            label="Недавно"
            onPress={() => navigation.navigate('Profile', { screen: 'RecentlyViewed' })}
          />
          <QuickAction
            icon="gift-outline"
            label="Бонусы"
            onPress={() => navigation.navigate('Profile', { screen: 'Loyalty' })}
          />
          <QuickAction
            icon="bar-chart-outline"
            label="Аналитика"
            onPress={() => navigation.navigate('Profile', { screen: 'Analytics' })}
          />
        </View>
      </View>

      <View style={styles.block}>
        <SectionTitle title="Почему мы" />
        <View style={styles.features}>
          <Feature icon="bicycle-outline" title="Доставка за 2 часа" text="По городу — в день заказа" />
          <Feature icon="gift-outline" title="Бонусы за заказ" text="Копите баллы и повышайте уровень" />
          <Feature icon="shield-checkmark-outline" title="Честный состав" text="Показываем, что внутри" />
        </View>
      </View>
    </ScrollView>
  );
}

function Feature({ icon, title, text }) {
  return (
    <Card style={styles.feature}>
      <Ionicons name={icon} size={22} color={colors.accent} />
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </Card>
  );
}

function QuickAction({ icon, label, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.82} onPress={onPress} style={styles.quickAction}>
      <View style={styles.quickIcon}>
        <Ionicons name={icon} size={20} color={colors.accent} />
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 18, paddingBottom: 36 },
  hero: {
    backgroundColor: colors.surface,
    borderColor: 'rgba(212,175,55,.3)',
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: 22,
    overflow: 'hidden',
  },
  badge: { color: colors.accent, fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 1 },
  heroTitle: { color: colors.text, fontFamily: fonts.displayMedium, fontSize: 24, lineHeight: 31, marginTop: 10, maxWidth: 250 },
  heroSubtitle: { color: colors.muted, fontFamily: fonts.body, fontSize: 13, lineHeight: 19, marginTop: 10, maxWidth: 260 },
  heroActions: { gap: 10, marginTop: 18, maxWidth: 260 },
  heroArt: { position: 'absolute', right: -18, bottom: -10, opacity: 0.85 },
  error: { marginTop: 16, gap: 12 },
  errorText: { color: colors.danger, fontFamily: fonts.body, fontSize: 13 },
  block: { marginTop: 28 },
  categoryChip: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, marginRight: 8 },
  categoryChipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  categoryText: { color: colors.muted, fontFamily: fonts.bodyMedium, fontSize: 13 },
  categoryTextActive: { color: colors.onAccent },
  muted: { color: colors.muted, fontFamily: fonts.body, fontSize: 13 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickAction: {
    width: '47%',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: 14,
    gap: 10,
  },
  quickIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { color: colors.text, fontFamily: fonts.bodySemi, fontSize: 13 },
  features: { gap: 10 },
  feature: { gap: 6 },
  featureTitle: { color: colors.text, fontFamily: fonts.bodyBold, fontSize: 14 },
  featureText: { color: colors.muted, fontFamily: fonts.body, fontSize: 12 },
});
