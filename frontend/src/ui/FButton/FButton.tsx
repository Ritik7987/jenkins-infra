import React from 'react';
import { Button, ButtonProps } from '@mantine/core';
import styles from './FButton.module.css';

export interface FButtonProps extends Omit<ButtonProps, 'variant'>, Omit<React.ComponentPropsWithoutRef<'button'>, keyof ButtonProps> {
  variant?: 'primary' | 'social';
}

export const FButton: React.FC<FButtonProps> = ({ variant = 'primary', className, children, ...props }) => {
  const btnClass = variant === 'social' ? styles.socialBtn : styles.primaryBtn;
  
  return (
    <Button className={`${btnClass} ${className || ''}`} unstyled {...props}>
      {variant === 'social' ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {children}
        </span>
      ) : (
        children
      )}
    </Button>
  );
};
