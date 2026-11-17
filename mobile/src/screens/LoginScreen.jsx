import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { normalizeError } from '../api';
import { colors, fonts, radius } from '../theme';
import { useAuth } from '../context/AuthContext';
import { Button, Card, Chip } from '../components/ui';

export default function LoginScreen({ navigation }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const update = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      if (mode === 'login') {
        await login(form.email.trim(), form.password);
      } else {
        await register({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          password: form.password,
        });
      }
      navigation.goBack();
    } catch (err) {
      setError(normalizeError(err, 'Не удалось войти. Проверьте данные.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.logo}>
          <Ionicons name="beer" size={34} color={colors.accent} />
        </View>
        <Text style={styles.title}>У Речушки</Text>
        <Text style={styles.subtitle}>Войдите, чтобы копить бонусы и отслеживать заказы</Text>

        <View style={styles.modes}>
          <Chip label="Вход" active={mode === 'login'} onPress={() => { setMode('login'); setError(''); }} />
          <Chip label="Регистрация" active={mode === 'register'} onPress={() => { setMode('register'); setError(''); }} />
        </View>

        <Card style={styles.form}>
          {mode === 'register' && (
            <Input label="Имя" value={form.name} onChangeText={update('name')} placeholder="Как к вам обращаться" />
          )}
          <Input label="Email" value={form.email} onChangeText={update('email')} placeholder="mail@example.ru" keyboardType="email-address" autoCapitalize="none" />
          {mode === 'register' && (
            <Input label="Телефон" value={form.phone} onChangeText={update('phone')} placeholder="+7 ..." keyboardType="phone-pad" />
          )}
          <Input label="Пароль" value={form.password} onChangeText={update('password')} placeholder="Не короче 4 символов" secureTextEntry />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button loading={busy} onPress={submit} icon="log-in-outline">
            {mode === 'login' ? 'Войти' : 'Создать аккаунт'}
          </Button>
        </Card>

        <Text style={styles.hint}>
          Роль и скидку определяет сервер. Пароль хранится только в хешированном виде.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Input({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType, autoCapitalize }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.dim}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 22, paddingBottom: 40, justifyContent: 'center' },
  logo: { alignItems: 'center' },
  title: { color: colors.text, fontFamily: fonts.displayMedium, fontSize: 26, textAlign: 'center', marginTop: 10 },
  subtitle: { color: colors.muted, fontFamily: fonts.body, fontSize: 13, textAlign: 'center', marginTop: 8 },
  modes: { flexDirection: 'row', marginTop: 24, marginBottom: 14 },
  form: { gap: 14 },
  field: { gap: 6 },
  label: { color: colors.muted, fontFamily: fonts.bodySemi, fontSize: 12 },
  input: { minHeight: 46, backgroundColor: colors.bgSoft, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, color: colors.text, fontFamily: fonts.body, fontSize: 14, paddingHorizontal: 12 },
  error: { color: colors.danger, fontFamily: fonts.body, fontSize: 13 },
  hint: { color: colors.dim, fontFamily: fonts.body, fontSize: 11, textAlign: 'center', marginTop: 18, lineHeight: 16 },
});
