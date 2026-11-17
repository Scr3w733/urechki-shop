import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../api';
import { colors, fonts, radius } from '../theme';
import { Badge, Button, Card, EmptyState, Loading, SectionTitle } from '../components/ui';

const STEPS = ['Собирается', 'Передан в доставку', 'В пути', 'Доставлен'];

export default function TrackingScreen({ route }) {
  const initialOrderId = route?.params?.orderId || '';
  const [orderId, setOrderId] = useState(initialOrderId);
  const [view, setView] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const id = String(orderId || '').trim();
    if (!id) {
      setError('Укажите номер заказа.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      setView(await api.shipment(id));
    } catch (err) {
      setView(null);
      setError(err.message || 'Отправление не найдено.');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (initialOrderId) {
      setOrderId(initialOrderId);
      load();
    }
    // Загрузку по номеру из маршрута делаем один раз при открытии экрана.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialOrderId]);

  const status = view?.shipment?.status || '';
  const currentIndex = STEPS.findIndex((step) => status.toLowerCase().includes(step.toLowerCase()));

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <SectionTitle title="Отследить заказ" subtitle="Статусы приходят из сервиса доставки" />

      <Card style={styles.searchCard}>
        <Text style={styles.label}>Номер заказа</Text>
        <TextInput
          value={orderId}
          onChangeText={setOrderId}
          keyboardType="numeric"
          placeholder="Например, 12"
          placeholderTextColor={colors.dim}
          style={styles.input}
        />
        <Button icon="search-outline" onPress={load} loading={loading}>Загрузить статус</Button>
      </Card>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {loading ? (
        <Loading label="Проверяем статус…" />
      ) : !view ? (
        <EmptyState
          icon="bicycle-outline"
          title="Отправление не выбрано"
          description="Введите номер заказа. Отправление создаётся при оформлении с указанием адреса."
        />
      ) : (
        <>
          <Card style={styles.statusCard}>
            <View style={styles.statusHead}>
              <Text style={styles.orderId}>Заказ №{view.shipment?.orderId ?? orderId}</Text>
              <Badge tone="accent">{status || '—'}</Badge>
            </View>
            {view.shipment?.address ? <Text style={styles.address}>{view.shipment.address}</Text> : null}
            <Text style={styles.human}>{view.humanStatus || 'Статус обновляется'}</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${Math.max(0, Math.min(100, view.progressPercent || 0))}%` }]} />
            </View>
            <View style={styles.steps}>
              {STEPS.map((step, index) => (
                <View key={step} style={styles.step}>
                  <Ionicons
                    name={currentIndex >= 0 && index <= currentIndex ? 'checkmark-circle' : 'ellipse-outline'}
                    size={18}
                    color={currentIndex >= 0 && index <= currentIndex ? colors.accent : colors.dim}
                  />
                  <Text style={[styles.stepText, currentIndex === index && styles.stepTextActive]}>{step}</Text>
                </View>
              ))}
            </View>
          </Card>

          <View style={styles.block}>
            <SectionTitle title="История событий" />
            {(view.events || []).length === 0 ? (
              <Card><Text style={styles.muted}>Событий пока нет.</Text></Card>
            ) : (
              view.events.map((event) => (
                <Card key={event.id} style={styles.event}>
                  <View style={styles.eventHead}>
                    <Badge tone="accent">{event.status}</Badge>
                    <Text style={styles.date}>{formatDate(event.createdAt)}</Text>
                  </View>
                  <Text style={styles.eventNote}>{event.note || 'Без комментария'}</Text>
                  {event.location ? <Text style={styles.muted}>{event.location}</Text> : null}
                </Card>
              ))
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('ru-RU');
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 18, paddingBottom: 36 },
  searchCard: { gap: 10 },
  label: { color: colors.muted, fontFamily: fonts.bodySemi, fontSize: 12 },
  input: { minHeight: 46, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, color: colors.text, fontFamily: fonts.body, fontSize: 14, paddingHorizontal: 12 },
  error: { color: colors.danger, fontFamily: fonts.body, fontSize: 13, marginTop: 12 },
  statusCard: { marginTop: 16, gap: 10 },
  statusHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { color: colors.text, fontFamily: fonts.bodyBold, fontSize: 16 },
  address: { color: colors.muted, fontFamily: fonts.body, fontSize: 12 },
  human: { color: colors.accent, fontFamily: fonts.bodySemi, fontSize: 14 },
  progressTrack: { height: 6, backgroundColor: colors.surfaceLight, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.accent },
  steps: { gap: 8 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepText: { color: colors.dim, fontFamily: fonts.body, fontSize: 13 },
  stepTextActive: { color: colors.text, fontFamily: fonts.bodySemi },
  block: { marginTop: 24 },
  event: { marginBottom: 10, gap: 6 },
  eventHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { color: colors.dim, fontFamily: fonts.body, fontSize: 10 },
  eventNote: { color: colors.text, fontFamily: fonts.body, fontSize: 13 },
  muted: { color: colors.muted, fontFamily: fonts.body, fontSize: 12 },
});
