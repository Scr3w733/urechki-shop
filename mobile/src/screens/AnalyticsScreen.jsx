import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api, asArray, normalizeError } from '../api';
import { colors, fonts, radius } from '../theme';
import { Button, Card, Loading, SectionTitle } from '../components/ui';

const EVENT_LABELS = {
  view_product: 'Просмотр товара',
  add_to_cart: 'Добавление в корзину',
  checkout_start: 'Начало оформления',
  order_created: 'Заказ создан',
  screen_view: 'Открытие экрана',
};

const formatMoney = (value) =>
  `${Number(value || 0).toLocaleString('ru-RU', { maximumFractionDigits: 2 })} ₽`;

export default function AnalyticsScreen() {
  const [summary, setSummary] = useState(null);
  const [funnel, setFunnel] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [summaryData, funnelData, recentData] = await Promise.all([
        api.analyticsSummary(),
        api.analyticsFunnel(),
        api.analyticsRecent(20),
      ]);
      setSummary(summaryData);
      setFunnel(funnelData);
      setRecent(asArray(recentData));
    } catch (err) {
      setError(normalizeError(err, 'Не удалось загрузить аналитику.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Loading label="Собираем статистику…" />;

  const stages = asArray(funnel?.stages);
  const maxStage = Math.max(1, ...stages.map((stage) => Number(stage.count) || 0));
  const topProducts = Object.entries(summary?.topProducts || {});

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <SectionTitle title="Аналитика" subtitle="Цифры по реальным событиям приложения и сайта" />

      {error ? (
        <Card style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
          <Button variant="outline" onPress={load} icon="refresh-outline">Повторить</Button>
        </Card>
      ) : null}

      <View style={styles.stats}>
        <Stat icon="pulse" label="Всего событий" value={String(summary?.events ?? 0)} />
        <Stat icon="cash" label="Оборот" value={formatMoney(summary?.revenue)} />
        <Stat icon="people" label="Клиентов" value={String(summary?.uniqueCustomers ?? 0)} />
        <Stat icon="time" label="За 24 часа" value={String(summary?.last24hEvents ?? 0)} />
      </View>

      <View style={styles.block}>
        <SectionTitle title="Воронка" subtitle="От просмотра до заказа" />
        <Card style={styles.funnel}>
          {stages.length === 0 ? (
            <Text style={styles.muted}>Событий пока нет — воронка появится после первых действий.</Text>
          ) : stages.map((stage) => {
            const count = Number(stage.count) || 0;
            return (
              <View key={stage.key} style={styles.stage}>
                <View style={styles.stageHead}>
                  <Text style={styles.stageLabel}>{stage.label || stage.key}</Text>
                  <Text style={styles.stageCount}>{count}</Text>
                </View>
                <View style={styles.track}>
                  <View style={[styles.fill, { width: `${Math.max(4, (count / maxStage) * 100)}%` }]} />
                </View>
                <Text style={styles.stageConversion}>{stage.conversionFromFirst}% от первого шага</Text>
              </View>
            );
          })}
        </Card>
      </View>

      {topProducts.length > 0 && (
        <View style={styles.block}>
          <SectionTitle title="Топ товаров" subtitle="По числу событий" />
          <Card>
            {topProducts.map(([id, count], index) => (
              <View key={id} style={styles.topRow}>
                <Text style={styles.topIndex}>{index + 1}</Text>
                <Text style={styles.topId}>Товар №{id}</Text>
                <Text style={styles.topCount}>{count}</Text>
              </View>
            ))}
          </Card>
        </View>
      )}

      <View style={styles.block}>
        <SectionTitle title="Последние события" subtitle="Свежие действия в системе" />
        {recent.length === 0 ? (
          <Card><Text style={styles.muted}>Событий пока нет.</Text></Card>
        ) : recent.map((event) => (
          <Card key={event.id} style={styles.event}>
            <View style={styles.eventHead}>
              <Text style={styles.eventType}>{EVENT_LABELS[event.type] || event.type}</Text>
              <Text style={styles.eventDate}>{formatDate(event.createdAt)}</Text>
            </View>
            <Text style={styles.eventMeta}>
              {event.customerId ? `Клиент №${event.customerId}` : 'Гость'}
              {event.productId ? ` · товар №${event.productId}` : ''}
              {event.amount != null ? ` · ${formatMoney(event.amount)}` : ''}
            </Text>
          </Card>
        ))}
      </View>

      <Card style={styles.note}>
        <Ionicons name="information-circle-outline" size={19} color={colors.accent} />
        <Text style={styles.noteText}>{funnel?.note || 'Данные берутся из сервиса аналитики без демонстрационных подстановок.'}</Text>
      </Card>
    </ScrollView>
  );
}

function Stat({ icon, label, value }) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={19} color={colors.accent} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('ru-RU');
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 18, paddingBottom: 40 },
  errorCard: { gap: 12, marginBottom: 14 },
  errorText: { color: colors.danger, fontFamily: fonts.body, fontSize: 13 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 6 },
  stat: {
    width: '47%',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: 14,
    gap: 6,
  },
  statValue: { color: colors.text, fontFamily: fonts.displayMedium, fontSize: 18 },
  statLabel: { color: colors.muted, fontFamily: fonts.body, fontSize: 11 },
  block: { marginTop: 26 },
  funnel: { gap: 14 },
  stage: { gap: 6 },
  stageHead: { flexDirection: 'row', justifyContent: 'space-between' },
  stageLabel: { color: colors.text, fontFamily: fonts.bodyMedium, fontSize: 13 },
  stageCount: { color: colors.accent, fontFamily: fonts.bodyBold, fontSize: 13 },
  track: { height: 8, backgroundColor: colors.surfaceLight, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.accent, borderRadius: 4 },
  stageConversion: { color: colors.dim, fontFamily: fonts.body, fontSize: 10 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  topIndex: { color: colors.accent, fontFamily: fonts.displayMedium, fontSize: 14, width: 20 },
  topId: { flex: 1, color: colors.text, fontFamily: fonts.body, fontSize: 13 },
  topCount: { color: colors.muted, fontFamily: fonts.bodyBold, fontSize: 13 },
  event: { marginBottom: 9, gap: 5 },
  eventHead: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  eventType: { color: colors.text, fontFamily: fonts.bodySemi, fontSize: 13, flex: 1 },
  eventDate: { color: colors.dim, fontFamily: fonts.body, fontSize: 10 },
  eventMeta: { color: colors.muted, fontFamily: fonts.body, fontSize: 11 },
  muted: { color: colors.muted, fontFamily: fonts.body, fontSize: 12 },
  note: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginTop: 16 },
  noteText: { flex: 1, color: colors.muted, fontFamily: fonts.body, fontSize: 11, lineHeight: 17 },
});
