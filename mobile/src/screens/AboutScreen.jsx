import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { APP_INFO, API_ORIGIN, PROMO_CODES } from '../config';
import { colors, fonts, radius } from '../theme';
import { Button, Card, SectionTitle } from '../components/ui';

const links = [
  { label: 'Сайт «У Речушки»', url: 'http://localhost' },
  { label: 'Проверка состояния API', url: `${API_ORIGIN}/api/mobile/health` },
];

export default function AboutScreen() {
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Card style={styles.hero}>
        <View style={styles.mark}>
          <Text style={styles.markText}>УР</Text>
        </View>
        <Text style={styles.name}>{APP_INFO.name}</Text>
        <Text style={styles.tagline}>{APP_INFO.tagline}</Text>
        <View style={styles.version}>
          <Text style={styles.versionText}>Версия 1.1 · Expo / React Native</Text>
        </View>
      </Card>

      <View style={styles.block}>
        <SectionTitle title="Приложение" />
        <Card style={styles.info}>
          <InfoRow icon="server-outline" label="Адрес API" value={API_ORIGIN} />
          <InfoRow icon="pricetag-outline" label="Промокодов" value={String(PROMO_CODES.length)} />
          <InfoRow icon="color-palette-outline" label="Тема" value="Тёмная, как на сайте" />
          <InfoRow icon="shield-checkmark-outline" label="Цены" value="Считает сервер" />
        </Card>
      </View>

      <View style={styles.block}>
        <SectionTitle title="Ссылки" />
        {links.map((link) => (
          <Button
            key={link.url}
            variant="outline"
            icon="open-outline"
            style={styles.linkButton}
            onPress={() => Linking.openURL(link.url).catch(() => {})}
          >
            {link.label}
          </Button>
        ))}
      </View>

      <Card style={styles.developer}>
        <Ionicons name="code-slash-outline" size={20} color={colors.accent} />
        <Text style={styles.developerText}>{APP_INFO.developer}</Text>
      </Card>

      <Text style={styles.footer}>© {new Date().getFullYear()} У Речушки. Все права защищены.</Text>
    </ScrollView>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={17} color={colors.accent} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 18, paddingBottom: 40 },
  hero: { alignItems: 'center', paddingVertical: 28 },
  mark: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  markText: { color: colors.onAccent, fontFamily: fonts.displayMedium, fontSize: 26 },
  name: { color: colors.text, fontFamily: fonts.displayMedium, fontSize: 23, marginTop: 14 },
  tagline: { color: colors.muted, fontFamily: fonts.body, fontSize: 13, textAlign: 'center', marginTop: 6 },
  version: { marginTop: 14, backgroundColor: colors.accentSoft, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 6 },
  versionText: { color: colors.accent, fontFamily: fonts.bodyBold, fontSize: 11 },
  block: { marginTop: 24 },
  info: { gap: 4 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: colors.border },
  infoLabel: { color: colors.muted, fontFamily: fonts.body, fontSize: 12, flex: 1 },
  infoValue: { color: colors.text, fontFamily: fonts.bodySemi, fontSize: 12, maxWidth: '55%' },
  linkButton: { marginBottom: 9 },
  developer: { flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: 12 },
  developerText: { flex: 1, color: colors.muted, fontFamily: fonts.body, fontSize: 12 },
  footer: { color: colors.dim, fontFamily: fonts.body, fontSize: 10, textAlign: 'center', marginTop: 24 },
});
