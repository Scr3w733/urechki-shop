import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../api';
import { colors, fonts, radius } from '../theme';
import { Badge, Button, Card, Loading, SectionTitle } from '../components/ui';

const DETAIL_FIELDS = ['products', 'customers', 'orders', 'events', 'services'];

const serviceDetail = (data) => {
  if (!data || typeof data !== 'object') return '';
  const parts = DETAIL_FIELDS
    .filter((field) => data[field] !== undefined && data[field] !== null)
    .map((field) => `${field}: ${data[field]}`);
  return parts.length ? parts.join(' · ') : (data.message || data.service || '');
};

export default function ServiceStatusScreen() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkedAt, setCheckedAt] = useState(null);

  const check = useCallback(async () => {
    setLoading(true);
    setServices(await api.checkPlatformServices());
    setCheckedAt(new Date());
    setLoading(false);
  }, []);

  useEffect(() => { check(); }, [check]);

  const online = services.filter((item) => item.online).length;
  const offline = services.length - online;
  const average = services.length
    ? Math.round(services.reduce((sum, item) => sum + item.latency, 0) / services.length)
    : 0;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <SectionTitle
        title="Состояние сервисов"
        subtitle="Реальные health-проверки всех микросервисов через nginx"
      />

      <View style={styles.stats}>
        <Stat label="Всего" value={services.length ? String(services.length) : '—'} />
        <Stat label="В сети" value={services.length ? String(online) : '—'} tone="success" />
        <Stat label="Недоступно" value={services.length ? String(offline) : '—'} tone="danger" />
        <Stat label="Отклик" value={services.length ? `${average} мс` : '—'} />
      </View>

      <Button variant="outline" icon="refresh-outline" onPress={check} disabled={loading} style={styles.refresh}>
        {loading ? 'Проверяем…' : 'Проверить снова'}
      </Button>

      {checkedAt && (
        <Text style={styles.checkedAt}>Последняя проверка: {checkedAt.toLocaleTimeString('ru-RU')}</Text>
      )}

      {loading && services.length === 0 ? (
        <Loading label="Опрашиваем сервисы…" />
      ) : (
        services.map((service) => (
          <Card key={service.id} style={styles.card}>
            <View style={styles.cardHead}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{service.name}</Text>
                <Text style={styles.description}>{service.description}</Text>
              </View>
              <Badge tone={service.online ? 'success' : 'default'}>
                {service.online ? 'В сети' : 'Недоступен'}
              </Badge>
            </View>
            <View style={styles.meta}>
              <Text style={styles.path} numberOfLines={1}>{service.path}</Text>
              <Text style={styles.latency}>{service.latency} мс</Text>
            </View>
            {service.online && serviceDetail(service.data) ? (
              <Text style={styles.detail}>{serviceDetail(service.data)}</Text>
            ) : null}
            {!service.online && <Text style={styles.error}>{service.error}</Text>}
          </Card>
        ))
      )}

      <Card style={styles.note}>
        <Ionicons name="information-circle-outline" size={19} color={colors.accent} />
        <Text style={styles.noteText}>
          Каждая карточка — отдельный запрос к микросервису. Если один сервис недоступен,
          остальные разделы приложения продолжают работать.
        </Text>
      </Card>
    </ScrollView>
  );
}

function Stat({ label, value, tone }) {
  const color = tone === 'success' ? colors.success : tone === 'danger' ? colors.danger : colors.accent;
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 18, paddingBottom: 36 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginTop: 4 },
  stat: { width: '47%', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 13 },
  statValue: { fontFamily: fonts.displayMedium, fontSize: 19 },
  statLabel: { color: colors.muted, fontFamily: fonts.body, fontSize: 11, marginTop: 3 },
  refresh: { minHeight: 42, marginTop: 14 },
  checkedAt: { color: colors.dim, fontFamily: fonts.body, fontSize: 11, marginTop: 10, marginBottom: 14 },
  card: { marginBottom: 10, gap: 10 },
  cardHead: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  name: { color: colors.text, fontFamily: fonts.bodyBold, fontSize: 14 },
  description: { color: colors.muted, fontFamily: fonts.body, fontSize: 11, marginTop: 3 },
  meta: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  path: { color: colors.dim, fontFamily: fonts.body, fontSize: 10, flex: 1 },
  latency: { color: colors.accent, fontFamily: fonts.bodyBold, fontSize: 10 },
  detail: { color: colors.success, fontFamily: fonts.body, fontSize: 11 },
  error: { color: colors.danger, fontFamily: fonts.body, fontSize: 11 },
  note: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginTop: 8 },
  noteText: { flex: 1, color: colors.muted, fontFamily: fonts.body, fontSize: 11, lineHeight: 17 },
});
