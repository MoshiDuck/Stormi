// INFO : Modale code PIN — définir, confirmer ou saisir le PIN (profils secondaires)
import React, { useState, useEffect, useRef } from 'react';
import { useConfig } from '~/hooks/useConfig';
import { useLanguage } from '~/contexts/LanguageContext';
import { darkTheme } from '~/utils/ui/theme';
import { LoadingSpinner } from '~/components/ui/LoadingSpinner';

const PIN_LENGTH = 4;
const PIN_REGEX = /^\d{4}$/;

export type PinModalMode = 'set' | 'confirm' | 'enter';

export interface PinModalProps {
    isOpen: boolean;
    mode: PinModalMode;
    onClose: () => void;
    /** Appelé après succès set ou verify (modes set / confirm) */
    onSuccess?: () => void;
    /** Appelé en mode enter avec le PIN saisi (le parent envoie PATCH/DELETE avec ce PIN) */
    onSubmitPin?: (pin: string) => void | Promise<void>;
}

export function PinModal({
    isOpen,
    mode,
    onClose,
    onSuccess,
    onSubmitPin,
}: PinModalProps) {
    const { config } = useConfig();
    const { t } = useLanguage();
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!isOpen) return;
        setPin('');
        setConfirmPin('');
        setError(null);
        setSubmitting(false);
        setTimeout(() => inputRef.current?.focus(), 100);
    }, [isOpen, mode]);

    useEffect(() => {
        if (!isOpen) return;
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !submitting) onClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, submitting, onClose]);

    if (!isOpen) return null;

    const baseUrl = config?.baseUrl;
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('stormi_token') : null;

    const title =
        mode === 'set'
            ? t('pin.createTitle')
            : mode === 'confirm'
              ? t('pin.confirmTitle')
              : t('pin.enterTitle');
    const description =
        mode === 'set'
            ? t('pin.createDescription')
            : mode === 'confirm'
              ? t('pin.confirmDescription')
              : t('pin.enterDescription');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!PIN_REGEX.test(pin)) {
            setError(t('pin.mustBe4Digits'));
            return;
        }
        if (mode === 'set' && pin !== confirmPin) {
            setError(t('pin.mismatch'));
            return;
        }

        if (mode === 'enter' && onSubmitPin) {
            setSubmitting(true);
            try {
                await onSubmitPin(pin);
                onClose();
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : t('pin.incorrect');
                setError(msg);
            } finally {
                setSubmitting(false);
            }
            return;
        }

        if (!baseUrl || !token) {
            setError(t('common.error'));
            return;
        }

        setSubmitting(true);
        try {
            if (mode === 'set') {
                const res = await fetch(`${baseUrl}/api/profiles/pin/set`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ pin }),
                });
                const data = (await res.json()) as { error?: string };
                if (!res.ok) throw new Error(data.error || t('pin.required'));
                onSuccess?.();
                onClose();
            } else {
                const res = await fetch(`${baseUrl}/api/profiles/pin/verify`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ pin }),
                });
                const data = (await res.json()) as { error?: string };
                if (!res.ok) throw new Error(data.error || t('pin.incorrect'));
                if (res.status === 429) throw new Error(t('pin.rateLimited'));
                onSuccess?.();
                onClose();
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : t('pin.incorrect'));
        } finally {
            setSubmitting(false);
        }
    };

    const handlePinChange = (value: string) => {
        if (value.length <= PIN_LENGTH && /^\d*$/.test(value)) setPin(value);
    };
    const handleConfirmPinChange = (value: string) => {
        if (value.length <= PIN_LENGTH && /^\d*$/.test(value)) setConfirmPin(value);
    };

    const canSubmit =
        PIN_REGEX.test(pin) &&
        (mode !== 'set' || pin === confirmPin) &&
        !submitting;

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="pin-modal-title"
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10001,
                padding: 24,
            }}
            onClick={() => !submitting && onClose()}
        >
            <div
                style={{
                    backgroundColor: darkTheme.background.secondary,
                    borderRadius: darkTheme.radius.large,
                    padding: 32,
                    maxWidth: 400,
                    width: '100%',
                    border: `1px solid ${darkTheme.border.primary}`,
                    boxShadow: darkTheme.shadow.large,
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <h2
                    id="pin-modal-title"
                    style={{
                        fontSize: 20,
                        fontWeight: 600,
                        marginBottom: 8,
                        color: darkTheme.text.primary,
                    }}
                >
                    {title}
                </h2>
                <p
                    style={{
                        fontSize: 14,
                        color: darkTheme.text.secondary,
                        marginBottom: 24,
                        lineHeight: 1.5,
                    }}
                >
                    {description}
                </p>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: mode === 'set' ? 16 : 24 }}>
                        <input
                            ref={inputRef}
                            type="password"
                            inputMode="numeric"
                            autoComplete={mode === 'set' ? 'new-password' : 'off'}
                            maxLength={PIN_LENGTH}
                            value={pin}
                            onChange={(e) => handlePinChange(e.target.value)}
                            placeholder={t('pin.placeholder')}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                fontSize: 18,
                                letterSpacing: 8,
                                textAlign: 'center',
                                borderRadius: darkTheme.radius.medium,
                                border: `1px solid ${darkTheme.border.primary}`,
                                backgroundColor: darkTheme.background.tertiary,
                                color: darkTheme.text.primary,
                                boxSizing: 'border-box',
                            }}
                            aria-label={t('pin.placeholder')}
                        />
                    </div>
                    {mode === 'set' && (
                        <div style={{ marginBottom: 24 }}>
                            <input
                                type="password"
                                inputMode="numeric"
                                autoComplete="new-password"
                                maxLength={PIN_LENGTH}
                                value={confirmPin}
                                onChange={(e) => handleConfirmPinChange(e.target.value)}
                                placeholder={t('pin.confirmPlaceholder')}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    fontSize: 18,
                                    letterSpacing: 8,
                                    textAlign: 'center',
                                    borderRadius: darkTheme.radius.medium,
                                    border: `1px solid ${darkTheme.border.primary}`,
                                    backgroundColor: darkTheme.background.tertiary,
                                    color: darkTheme.text.primary,
                                    boxSizing: 'border-box',
                                }}
                                aria-label={t('pin.confirmPlaceholder')}
                            />
                        </div>
                    )}
                    {error && (
                        <p
                            style={{
                                color: darkTheme.accent.red,
                                fontSize: 14,
                                marginBottom: 16,
                            }}
                        >
                            {error}
                        </p>
                    )}
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            style={{
                                padding: '10px 20px',
                                fontSize: 14,
                                fontWeight: 500,
                                color: darkTheme.text.primary,
                                backgroundColor: darkTheme.background.tertiary,
                                border: `1px solid ${darkTheme.border.primary}`,
                                borderRadius: darkTheme.radius.medium,
                                cursor: submitting ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {t('pin.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={!canSubmit}
                            style={{
                                padding: '10px 20px',
                                fontSize: 14,
                                fontWeight: 600,
                                color: '#fff',
                                backgroundColor: darkTheme.accent.blue,
                                border: 'none',
                                borderRadius: darkTheme.radius.medium,
                                cursor: canSubmit ? 'pointer' : 'not-allowed',
                            }}
                        >
                            {submitting ? <LoadingSpinner size="small" /> : t('pin.submit')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
