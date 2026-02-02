// INFO : app/components/ui/LoadingSpinner.tsx
import React from 'react';
import { darkTheme } from '~/utils/ui/theme';
import { useLanguage } from '~/contexts/LanguageContext';

interface LoadingSpinnerProps {
    message?: string;
    size?: 'small' | 'medium' | 'large';
}

export function LoadingSpinner({ message, size = 'medium' }: LoadingSpinnerProps) {
    const { t } = useLanguage();
    const displayMessage = message ?? t('common.loading');
    const spinnerSize = size === 'small' ? 24 : size === 'large' ? 48 : 32;
    
    return (
        <div 
            role="status"
            aria-live="polite"
            aria-label={displayMessage}
            style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '16px',
                padding: '40px'
            }}
        >
            <div
                aria-hidden="true"
                style={{
                    width: `${spinnerSize}px`,
                    height: `${spinnerSize}px`,
                    border: `3px solid ${darkTheme.background.tertiary}`,
                    borderTop: `3px solid ${darkTheme.accent.blue}`,
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}
            />
            {displayMessage && (
                <p style={{
                    color: darkTheme.text.secondary,
                    fontSize: '14px',
                    margin: 0
                }}>
                    {displayMessage}
                </p>
            )}
            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}
            </style>
        </div>
    );
}