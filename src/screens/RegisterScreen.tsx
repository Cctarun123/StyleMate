import { useCallback, useState } from 'react';
import { KeyboardAvoidingView, StyleSheet, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { sheet, text, useTheme } from '../utils/theme';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { AuthField } from '../components/AuthField';
import Screen from '../components/Screen';
import {
  AUTH_CONFIRM_PASSWORD,
  AUTH_CREATE_ACCOUNT,
  AUTH_DEMO_NOTE,
  AUTH_EMAIL,
  AUTH_ERR_EMAIL_EXISTS,
  AUTH_ERR_NAME_REQUIRED,
  AUTH_ERR_PASSWORD_MISMATCH,
  AUTH_ERR_PASSWORD_SHORT,
  AUTH_NAME,
  AUTH_PASSWORD,
} from '../constants/strings';

export default function RegisterScreen() {
  const { register } = useAuth();
  const { colors } = useTheme();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSecure, setPasswordSecure] = useState(true);
  const [confirmSecure, setConfirmSecure] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const onRegister = useCallback(async () => {
    setError('');
    if (!name.trim()) {
      setError(AUTH_ERR_NAME_REQUIRED);
      return;
    }
    if (!emailRegex.test(email)) {
      setError('Enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError(AUTH_ERR_PASSWORD_SHORT);
      return;
    }
    if (password !== confirmPassword) {
      setError(AUTH_ERR_PASSWORD_MISMATCH);
      return;
    }

    setSubmitting(true);
    try {
      const result = await register(email, name, password);
      if (!result.ok) {
        setError(result.error ?? AUTH_ERR_EMAIL_EXISTS);
      }
    } finally {
      setSubmitting(false);
    }
  }, [name, email, password, confirmPassword, register]);

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
            {AUTH_CREATE_ACCOUNT}
          </AppText>
          <AuthField
            label={AUTH_NAME}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            placeholder="John Doe"
          />
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
          <AuthField
            label={AUTH_CONFIRM_PASSWORD}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            onToggleSecureTextEntry={() => setConfirmSecure((secure) => !secure)}
            placeholder="••••••"
          />
          {error && <AppText variant="label" style={s.error}>{error}</AppText>}
          <Button
            title={submitting ? 'CREATING…' : AUTH_CREATE_ACCOUNT}
            onPress={onRegister}
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
