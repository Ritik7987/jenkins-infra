import React from 'react';
import { Title, Text, TitleProps, TextProps } from '@mantine/core';
import styles from './FTypography.module.css';

export type FTypographyProps = 
  | ({ variant: 'title' } & TitleProps & Omit<React.ComponentPropsWithoutRef<'h2'>, keyof TitleProps>)
  | ({ variant?: 'description' } & TextProps & Omit<React.ComponentPropsWithoutRef<'p'>, keyof TextProps>);

export const FTypography: React.FC<FTypographyProps> = ({ variant = 'description', children, className, ...props }) => {
  if (variant === 'title') {
    return (
      <Title order={2} className={`${styles.title} ${className || ''}`} {...(props as TitleProps & React.ComponentPropsWithoutRef<'h2'>)}>
        {children}
      </Title>
    );
  }
  return (
    <Text className={`${styles.description} ${className || ''}`} {...(props as TextProps & React.ComponentPropsWithoutRef<'p'>)}>
      {children}
    </Text>
  );
};
