import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, shadow } from '../theme';

export function Screen({ children, style, scroll = false }) {
  const Wrapper = scroll ? ScrollView : View;
  const wrapperProps = scroll
    ? { contentContainerStyle: [styles.screen, style], keyboardShouldPersistTaps: 'handled' }
    : { style: [styles.screen, style] };
  return <Wrapper {...wrapperProps}>{children}</Wrapper>;
}

export function Card({ children, style, onPress, disabled }) {
  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        disabled={disabled}
        style={[styles.card, style]}
      >
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Button({ children, onPress, variant = 'primary', disabled, loading, style, textStyle, icon }) {
  const background = variant === 'primary' ? colors.accent : variant === 'danger' ? colors.danger : 'transparent';
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        { backgroundColor: background },
        variant !== 'primary' && variant !== 'danger' && styles.buttonOutline,
        disabled && styles.buttonDisabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'primary' ? colors.onAccent : colors.text} />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={18} color={variant === 'primary' ? colors.onAccent : colors.text} />}
          <Text style={[styles.buttonText, { color: variant === 'primary' ? colors.onAccent : colors.text }, textStyle]}>
            {children}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

export function Chip({ label, active, onPress, style }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive, style]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function SectionTitle({ title, subtitle, action }) {
  return (
    <View style={styles.sectionHead}>
      <View style={{ flex: 1 }}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
      {action}
    </View>
  );
}

export function Badge({ children, tone = 'default' }) {
  const color = tone === 'success' ? colors.success : tone === 'accent' ? colors.accent : colors.muted;
  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <Text style={[styles.badgeText, { color }]}>{children}</Text>
    </View>
  );
}

export function Price({ value, style }) {
  const formatted = Number(value || 0).toLocaleString('ru-RU', { maximumFractionDigits: 2 });
  return <Text style={[styles.price, style]}>{formatted} ₽</Text>;
}

export function Rating({ value }) {
  if (value === undefined || value === null) return null;
  return (
    <View style={styles.rating}>
      <Ionicons name="star" size={13} color={colors.accent} />
      <Text style={styles.ratingText}>{Number(value).toFixed(1)}</Text>
    </View>
  );
}

export function EmptyState({ icon = 'cube-outline', title, description, action }) {
  return (
    <Card style={styles.empty}>
      <Ionicons name={icon} size={42} color={colors.accent} />
      <Text style={styles.emptyTitle}>{title}</Text>
      {description ? <Text style={styles.emptyText}>{description}</Text> : null}
      {action}
    </Card>
  );
}

export function Loading({ label = 'Загружаем…' }) {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={colors.accent} size="large" />
      <Text style={styles.loadingText}>{label}</Text>
    </View>
  );
}

export function ProductArt({ product, size = 'medium' }) {
  const category = String(product?.category || '');
  const name = String(product?.name || '').toLowerCase();
  let emoji = '🍺';
  if (category.includes('Закуск') || name.includes('chip') || name.includes(' snack')) emoji = '🥨';
  else if (category.includes('Мерч')) emoji = '👕';
  else if (category.includes('Сертификат')) emoji = '🎟️';
  else if (category.includes('Набор')) emoji = '🎁';
  else if (name.includes('stout') || name.includes('стаут')) emoji = '🍫';
  else if (name.includes('ipa') || name.includes('эйл') || name.includes('apa')) emoji = '🍻';

  const dimension = size === 'large' ? 190 : size === 'small' ? 58 : 92;
  return (
    <View style={[styles.art, { width: dimension, height: dimension }, size === 'large' && styles.artLarge]}>
      <Text style={{ fontSize: dimension * 0.48 }}>{emoji}</Text>
    </View>
  );
}

export function Divider() {
  return <View style={styles.divider} />;
}

export function Field({ label, value, onChangeText, placeholder, secure, keyboardType, multiline }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.fieldBox}>
        <Text style={styles.fieldValue}>
          {secure ? '•'.repeat(Math.max(4, String(value || '').length || 6)) : value || placeholder}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, padding: 18, paddingBottom: 28 },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: 16,
    ...shadow,
  },
  button: {
    minHeight: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 18,
  },
  buttonOutline: { borderWidth: 1, borderColor: colors.border },
  buttonDisabled: { opacity: 0.45 },
  buttonText: { fontFamily: fonts.bodyBold, fontSize: 15 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginRight: 8,
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { color: colors.muted, fontFamily: fonts.bodyMedium, fontSize: 13 },
  chipTextActive: { color: colors.onAccent },
  sectionHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 10 },
  sectionTitle: { color: colors.text, fontFamily: fonts.displayMedium, fontSize: 18 },
  sectionSubtitle: { color: colors.muted, fontFamily: fonts.body, fontSize: 13, marginTop: 4 },
  badge: { borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 3 },
  badgeText: { fontFamily: fonts.bodySemi, fontSize: 11 },
  price: { color: colors.accent, fontFamily: fonts.bodyBold, fontSize: 17 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { color: colors.muted, fontFamily: fonts.bodyMedium, fontSize: 12 },
  empty: { alignItems: 'center', paddingVertical: 42, gap: 10 },
  emptyTitle: { color: colors.text, fontFamily: fonts.displayMedium, fontSize: 17, textAlign: 'center' },
  emptyText: { color: colors.muted, fontFamily: fonts.body, fontSize: 13, textAlign: 'center', maxWidth: 320 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, minHeight: 220 },
  loadingText: { color: colors.muted, fontFamily: fonts.body, fontSize: 13 },
  art: {
    backgroundColor: colors.accentSoft,
    borderColor: 'rgba(212,175,55,.35)',
    borderWidth: 1,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  artLarge: { borderRadius: radius.lg },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 14 },
  field: { marginBottom: 14 },
  fieldLabel: { color: colors.muted, fontFamily: fonts.bodySemi, fontSize: 12, marginBottom: 6 },
  fieldBox: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgSoft,
    borderRadius: radius.sm,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  fieldValue: { color: colors.text, fontFamily: fonts.body, fontSize: 14 },
});
