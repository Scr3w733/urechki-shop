import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api, asArray, normalizeError } from '../api';
import { colors, fonts, radius } from '../theme';
import { useAuth } from '../context/AuthContext';
import { Button, Card, EmptyState, Loading, SectionTitle } from '../components/ui';

export default function NotificationsScreen() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [onlyMine, setOnlyMine] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const payload = await api.notifications(onlyMine && user?.email ? user.email : undefined);
      setItems(asArray(payload));
    } catch (err) {
      setError(normalizeError(err, 'Не удалось загрузить уведомления.'));
    } finally {
      setLoading(false);
    }
  }, [onlyMine, user?.email]);

  useEffect(() => { load(); }, [load]);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <SectionTitle
        title="Уведомления"
        subtitle={onlyMine ? 'История отправок на вашу почту' : 'Общая история сервиса уведомлений'}
      />

      <Card style={styles.filter}>
        <Button
          variant={onlyMine ? 'primary' : 'outline'}
          style={styles.filterButton}
          onPress={() => setOnlyMine(true)}
        >
          Мои
        </Button>
        <Button
          variant={!onlyMine ? 'primary' : 'outline'}
          style={styles.filterButton}
          onPress={() => setOnlyMine(false)}
        >
          Все
        </Button>
      </Card>

      {error ? (
        <Card style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
          <Button variant="outline" onPress={load} icon="refresh-outline">Повторить</Button>
        </Card>
      ) : loading ? (
        <Loading label="Проверяем почту…" />
      ) : items.length === 0 ? (
        <EmptyState
          icon="mail-outline"
          title="Писем пока нет"
          description="После оформления заказа или акции здесь появятся отправленные уведомления."
        />
      ) : items.map((item) => (
        <Card key={item.id} style={styles.item}>
          <View style={styles.itemHead}>
            <View style={styles.icon}>
              <Ionicons name="mail" size={17} color={colors.accent} />
            </View>
            <Text style={styles.email}>{item.email || 'Неизвестный получатель'}</Text>
            <Text style={styles.date}>{formatDate(item.sentAt)}</Text>
          </View>
          <Text style={styles.message}>{item.message}</Text>
        </Card>
      ))}

      <Card style={styles.note}>
        <Ionicons name="information-circle-outline" size={19} color={colors.accent} />
        <Text style={styles.noteText}>
          История хранится в сервисе уведомлений. Приложение только читает её и не отправляет письма без вашего действия.
        </Text>
      </Card>
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
  content: { padding: 18, paddingBottom: 40 },
  filter: { flexDirection: 'row', gap: 8, marginTop: 6, marginBottom: 16 },
  filterButton: { flex: 1, minHeight: 40 },
  errorCard: { gap: 12, marginBottom: 14 },
  errorText: { color: colors.danger, fontFamily: fonts.body, fontSize: 13 },
  item: { marginBottom: 10, gap: 10 },
  itemHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  icon: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  email: { flex: 1, color: colors.text, fontFamily: fonts.bodySemi, fontSize: 13 },
  date: { color: colors.dim, fontFamily: fonts.body, fontSize: 10 },
  message: { color: colors.muted, fontFamily: fonts.body, fontSize: 13, lineHeight: 19 },
  note: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginTop: 12 },
  noteText: { flex: 1, color: colors.muted, fontFamily: fonts.body, fontSize: 11, lineHeight: 17 },
});
