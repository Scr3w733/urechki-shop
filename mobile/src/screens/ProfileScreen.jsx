import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius } from '../theme';
import { useAuth } from '../context/AuthContext';
import { Badge, Button, Card, EmptyState, SectionTitle } from '../components/ui';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <View style={styles.centered}>
        <EmptyState
          icon="person-outline"
          title="Вы не вошли"
          description="Войдите, чтобы видеть бонусы, заказы и избранное. Каталог доступен без входа."
          action={<Button onPress={() => navigation.navigate('Login')}>Войти или зарегистрироваться</Button>}
        />
      </View>
    );
  }

  const links = [
    { label: 'Мои заказы', icon: 'receipt-outline', route: 'Orders' },
    { label: 'Бонусы и уровень', icon: 'gift-outline', route: 'Loyalty' },
    { label: 'Отследить доставку', icon: 'bicycle-outline', route: 'Tracking' },
    { label: 'Избранное', icon: 'heart-outline', route: 'Favorites' },
    { label: 'Недавно смотрели', icon: 'eye-outline', route: 'RecentlyViewed' },
    { label: 'Акции и промокоды', icon: 'pricetags-outline', route: 'Promo' },
    { label: 'Уведомления', icon: 'mail-outline', route: 'Notifications' },
    { label: 'Аналитика', icon: 'bar-chart-outline', route: 'Analytics' },
    { label: 'О приложении', icon: 'information-circle-outline', route: 'About' },
  ];

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Card style={styles.head}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{String(user.name || 'У').slice(0, 1).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <View style={styles.badges}>
            <Badge tone="accent">{user.role || 'Клиент'}</Badge>
            <Badge tone="success">Скидка {user.discountPercent ?? 0}%</Badge>
          </View>
        </View>
      </Card>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{user.bonusPoints ?? 0}</Text>
          <Text style={styles.statLabel}>бонусов</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{user.discountPercent ?? 0}%</Text>
          <Text style={styles.statLabel}>ваша скидка</Text>
        </View>
      </View>

      <View style={styles.block}>
        <SectionTitle title="Разделы" />
        <Card style={styles.links}>
          {links.map((link) => (
            <TouchableOpacity key={link.route} style={styles.link} onPress={() => navigation.navigate(link.route)}>
              <Ionicons name={link.icon} size={19} color={colors.accent} />
              <Text style={styles.linkText}>{link.label}</Text>
              <Ionicons name="chevron-forward" size={17} color={colors.dim} />
            </TouchableOpacity>
          ))}
        </Card>
      </View>

      <Button variant="outline" icon="log-out-outline" onPress={logout} style={styles.logout}>
        Выйти из аккаунта
      </Button>

      <Text style={styles.footer}>{APP_FOOTER}</Text>
    </ScrollView>
  );
}

const APP_FOOTER = 'Разработка сайта: Притчин Владимир, группа 9-прг401';

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 18, paddingBottom: 36 },
  centered: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center', padding: 18 },
  head: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.onAccent, fontFamily: fonts.displayMedium, fontSize: 24 },
  name: { color: colors.text, fontFamily: fonts.displayMedium, fontSize: 18 },
  email: { color: colors.muted, fontFamily: fonts.body, fontSize: 12, marginTop: 3 },
  badges: { flexDirection: 'row', gap: 6, marginTop: 8, flexWrap: 'wrap' },
  stats: { flexDirection: 'row', gap: 10, marginTop: 12 },
  stat: { flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 16 },
  statValue: { color: colors.accent, fontFamily: fonts.displayMedium, fontSize: 23 },
  statLabel: { color: colors.muted, fontFamily: fonts.body, fontSize: 11, marginTop: 4 },
  block: { marginTop: 24 },
  links: { padding: 0, overflow: 'hidden' },
  link: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 15, borderBottomWidth: 1, borderBottomColor: colors.border },
  linkText: { flex: 1, color: colors.text, fontFamily: fonts.bodyMedium, fontSize: 14 },
  logout: { marginTop: 24 },
  footer: { color: colors.dim, fontFamily: fonts.body, fontSize: 10, textAlign: 'center', marginTop: 28 },
});
