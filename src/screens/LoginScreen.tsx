import { useCallback, useState } from 'react';
import { KeyboardAvoidingView, StyleSheet, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { sheet, text, useTheme } from '../utils/theme';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { AuthField } from '../components/AuthField';
import Screen from '../components/Screen';
import {
  AUTH_DEMO_NOTE,
  AUTH_EMAIL,
  AUTH_LOGIN,
  AUTH_PASSWORD,
  AUTH_WELCOME_BACK,
} from '../constants/strings';

export default function LoginScreen() {
  const { login } = useAuth();
  const { colors } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordSecure, setPasswordSecure] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onLogin = useCallback(async () => {
    setError('');
    setSubmitting(true);
    try {
      const result = await login(email, password);
      if (!result.ok) {
        setError(result.error ?? 'Login failed.');
      }
    } finally {
      setSubmitting(false);
    }
  }, [email, password, login]);

  const s = StyleSheet.create({
    container: { ...sheet.center(colors), paddingHorizontal: 20 },
    content: { width: '100%' },
    title: {
      ...text.heading(colors),
      fontSize: 26,
      marginBottom: 24,
      textAlign: 'center',
    },
    error: { color: colors.danger, marginTop: 8, textAlign: 'center' },
    note: {
      ...text.label(colors),
      color: colors.subtext,
      marginTop: 24,
      textAlign: 'center',
    },
  });

  return (
    <Screen>
      <KeyboardAvoidingView behavior="padding" style={s.container}>
        <View style={s.content}>
          <AppText variant="heading" style={s.title}>
            {AUTH_WELCOME_BACK}
          </AppText>
          <AuthField
            label={AUTH_EMAIL}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="you@example.com"
          />
          <AuthField
            label={AUTH_PASSWORD}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            onToggleSecureTextEntry={() => setPasswordSecure((secure) => !secure)}
            placeholder="••••••"
          />
          {error && <AppText variant="label" style={s.error}>{error}</AppText>}
          <Button
            title={submitting ? 'LOGGING IN…' : AUTH_LOGIN}
            onPress={onLogin}
            disabled={submitting}
          />
          <AppText variant="label" style={s.note}>
            {AUTH_DEMO_NOTE}
          </AppText>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
