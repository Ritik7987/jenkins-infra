import React from 'react';
import { TextInput, PasswordInput, TextInputProps, PasswordInputProps } from '@mantine/core';
import styles from './FInput.module.css';

export type FInputProps =
  | ({ type: 'password' } & Omit<PasswordInputProps, 'type' | 'classNames'>)
  | ({ type?: Exclude<React.HTMLInputTypeAttribute, 'password'> } & Omit<TextInputProps, 'type' | 'classNames'>);

export const FInput: React.FC<FInputProps> = ({ type = 'text', ...props }) => {
  const classNames = {
    root: styles.field,
    label: styles.label,
    input: styles.input,
    error: styles.errorText,
  };

  if (type === 'password') {
    return (
      <PasswordInput
        classNames={classNames}
        {...(props as Omit<PasswordInputProps, 'type' | 'classNames'>)}
      />
    );
  }

  return (
    <TextInput
      type={type}
      classNames={classNames}
      {...(props as Omit<TextInputProps, 'type' | 'classNames'>)}
    />
  );
};
