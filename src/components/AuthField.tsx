import React from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, useTheme } from '../utils/theme';
import { AppText } from './AppText';

type AuthFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  secureTextEntry?: boolean;
  onToggleSecureTextEntry?: () => void;
  keyboardType?: 'email-address' | 'numeric' | 'default' | 'phone-pad' | 'number-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
  placeholder?: string;
};

export function AuthField({
  label,
  value,
  onChangeText,
  secureTextEntry,
  onToggleSecureTextEntry,
  keyboardType,
  autoCapitalize,
  error,
  placeholder,
}: AuthFieldProps) {
  const { colors: themeColors } = useTheme();
  const canToggle = secureTextEntry && !!onToggleSecureTextEntry;

  return (
    <View style={s.field}>
      <AppText variant="label" style={s.label}>
        {label}
      </AppText>
      <View style={s.inputRow}>
        <TextInput
          style={s.input}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry ?? false}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize ?? 'none'}
          placeholder={placeholder}
          autoCorrect={false}
        />
        {canToggle && (
          <Pressable style={s.toggle} onPress={onToggleSecureTextEntry}>
            <Ionicons
              name={secureTextEntry ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={themeColors.subtext}
            />
          </Pressable>
        )}
      </View>
      {error && (
        <AppText variant="label" style={s.error}>
          {error}
        </AppText>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  field: { marginBottom: 16 },
  label: { marginBottom: 6 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    color: colors.text,
    paddingVertical: 12,
  },
  toggle: { padding: 6 },
  error: { color: colors.danger, marginTop: 4 },
});
