import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../api';
import { colors, fonts, radius } from '../theme';
import { useAuth } from '../context/AuthContext';
import { Button, Card, EmptyState, Loading, SectionTitle } from '../components/ui';

export default function LoyaltyScreen({ navigation }) {
  const { user } = useAuth();
  const [account, setAccount] = useState(null);
  const [quote, setQuote] = useState(null);
  const [amount, setAmount] = useState('1000');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError('');
    try {
      const [accountData, quoteData] = await Promise.all([
        api.loyaltyAccount(user.id),
        api.loyaltyQuote(user.id, 0),
      ]);
      setAccount(accountData);
      setQuote(quoteData);
    } catch (err) {
      setError(err.message || 'Не удалось загрузить аккаунт лояльности.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const calculate = async () => {
    try {
      setQuote(await api.loyaltyQuote(user.id, Number(amount) || 0));
      setError('');
    } catch (err) {
      setError(err.message || 'Не удалось рассчитать кэшбэк.');
    }
  };

  if (!user) {
    return (
      <View style={styles.centered}>
        <EmptyState
          icon="gift-outline"
          title="Бонусы привязаны к аккаунту"
          description="Войдите, чтобы увидеть уровень, баланс и расчёт кэшбэка."
          action={<Button onPress={() => navigation.navigate('Login')}>Войти</Button>}
        />
      </View>
    );
  }

  const next = quote?.nextLevel || account?.nextLevel;
  const pointsToNext = quote?.pointsToNextLevel ?? account?.pointsToNextLevel;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <SectionTitle title="Бонусы и уровень" subtitle="Данные сервиса лояльности" />

      {loading ? (
        <Loading label="Считаем бонусы…" />
      ) : error && !account ? (
        <Card style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
          <Button variant="outline" onPress={load} icon="refresh-outline">Повторить</Button>
        </Card>
      ) : (
        <Card style={styles.levelCard}>
          <View style={styles.levelIcon}>
            <Ionicons name="sparkles" size={26} color={colors.accent} />
          </View>
          <Text style={styles.levelLabel}>Текущий уровень</Text>
          <Text style={styles.levelValue}>{account?.level || '—'}</Text>
          <View style={styles.pointsRow}>
            <Text style={styles.pointsValue}>{account?.points ?? 0}</Text>
            <Text style={styles.pointsLabel}>баллов</Text>
          </View>
          {next ? (
            <Text style={styles.next}>До уровня «{next}» осталось {pointsToNext ?? '—'} оборота</Text>
          ) : null}
        </Card>
      )}

      <View style={styles.block}>
        <SectionTitle title="Расчёт кэшбэка" subtitle="Укажите сумму покупки" />
        <Card>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="1000"
            placeholderTextColor={colors.dim}
            style={styles.input}
          />
          <Button style={styles.calculateButton} onPress={calculate} icon="calculator-outline">Рассчитать</Button>
          {quote ? (
            <View style={styles.quote}>
              <Text style={styles.quoteRow}>Кэшбэк: <Text style={styles.accent}>{quote.cashbackPercent}%</Text></Text>
              <Text style={styles.quoteRow}>Баллов начислим: <Text style={styles.accent}>{quote.bonusPointsEarned}</Text></Text>
              <Text style={styles.quoteRow}>Скидка уровня: <Text style={styles.accent}>{quote.discountPercent}%</Text></Text>
              <Text style={styles.quoteNote}>Уровень: {quote.level}. Расчёт сделан сервером.</Text>
            </View>
          ) : null}
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 18, paddingBottom: 36 },
  centered: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center', padding: 18 },
  levelCard: { alignItems: 'center', paddingVertical: 26 },
  levelIcon: { width: 58, height: 58, borderRadius: 29, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  levelLabel: { color: colors.muted, fontFamily: fonts.body, fontSize: 12, marginTop: 14 },
  levelValue: { color: colors.text, fontFamily: fonts.displayMedium, fontSize: 24, marginTop: 4 },
  pointsRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 18 },
  pointsValue: { color: colors.accent, fontFamily: fonts.displayMedium, fontSize: 34 },
  pointsLabel: { color: colors.muted, fontFamily: fonts.body, fontSize: 13 },
  next: { color: colors.dim, fontFamily: fonts.body, fontSize: 12, marginTop: 12, textAlign: 'center' },
  block: { marginTop: 24 },
  input: { minHeight: 46, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, color: colors.text, fontFamily: fonts.body, fontSize: 14, paddingHorizontal: 12 },
  calculateButton: { marginTop: 12 },
  quote: { marginTop: 16, backgroundColor: colors.bgSoft, borderRadius: radius.sm, padding: 14, gap: 6 },
  quoteRow: { color: colors.text, fontFamily: fonts.body, fontSize: 13 },
  quoteNote: { color: colors.dim, fontFamily: fonts.body, fontSize: 11, marginTop: 6 },
  accent: { color: colors.accent, fontFamily: fonts.bodyBold },
  errorCard: { gap: 12 },
  errorText: { color: colors.danger, fontFamily: fonts.body, fontSize: 13 },
});
