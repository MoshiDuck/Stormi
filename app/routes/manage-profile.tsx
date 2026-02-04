// INFO : Gérer le profil — langue, apparence (thème), déconnexion, données locales (layout _app fournit Navigation + AuthGuard)
import React, { useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '~/hooks/useAuth';
import { useTheme } from '~/contexts/ThemeContext';
import { useLanguage } from '~/contexts/LanguageContext';
import { LanguageSelector } from '~/components/ui/LanguageSelector';
import { ConfirmDialog } from '~/components/ui/ConfirmDialog';
import { translations } from '~/utils/i18n';

export function meta() {
    return [
        { title: translations.fr.meta.pageTitleManageProfile },
        { name: 'description', content: translations.fr.meta.pageDescriptionManageProfile },
    ];
}

export default function ManageProfileRoute() {
    const { user, logout } = useAuth();
    const { theme } = useTheme();
    const { t } = useLanguage();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleLogout = async () => {
        if (isLoggingOut) return;
        setShowLogoutConfirm(false);
        setIsLoggingOut(true);
        try {
            await logout();
        } finally {
            setIsLoggingOut(false);
        }
    };

    if (!user) {
        return null;
    }

    return (
        <>
            <div
                style={{
                    backgroundColor: theme.background.secondary,
                    borderRadius: '12px',
                    padding: '40px',
                    boxShadow: theme.shadow.medium,
                }}
            >
                <div style={{ marginBottom: '24px' }}>
                    <Link
                        to="/profile"
                        prefetch="intent"
                        style={{
                            color: theme.accent.blue,
                            textDecoration: 'none',
                            fontSize: '14px',
                            fontWeight: 500,
                            marginBottom: '16px',
                            display: 'inline-block',
                        }}
                    >
                        ← {t('manageProfile.backToAccount')}
                    </Link>
                </div>

                <div style={{ marginBottom: '40px' }}>
                    <h1
                        style={{
                            fontSize: '32px',
                            fontWeight: 'bold',
                            marginBottom: '8px',
                            color: theme.text.primary,
                        }}
                    >
                        {t('manageProfile.title')}
                    </h1>
                    <p
                        style={{
                            color: theme.text.secondary,
                            fontSize: '16px',
                        }}
                    >
                        {t('manageProfile.subtitle')}
                    </p>
                </div>

                <div style={{ display: 'grid', gap: '30px' }}>
                    {/* Apparence (thème) */}
                    <section
                        style={{
                            backgroundColor: theme.background.tertiary,
                            borderRadius: '8px',
                            padding: '30px',
                            border: `1px solid ${theme.border.primary}`,
                        }}
                    >
                        <h2
                            style={{
                                fontSize: '20px',
                                fontWeight: 600,
                                marginBottom: '20px',
                                color: theme.text.primary,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                            }}
                        >
                            <span
                                style={{
                                    display: 'inline-block',
                                    width: '24px',
                                    height: '24px',
                                    backgroundColor: theme.accent.blue,
                                    borderRadius: '4px',
                                    color: theme.text.primary,
                                    textAlign: 'center',
                                    lineHeight: '24px',
                                    fontSize: '14px',
                                }}
                            >
                                🎨
                            </span>
                            {t('theme.title')}
                        </h2>
                        <p
                            style={{
                                fontSize: '14px',
                                color: theme.text.secondary,
                                marginBottom: '16px',
                            }}
                        >
                            {t('theme.subtitle')}
                        </p>
                        <Link
                            to="/theme-settings"
                            prefetch="intent"
                            style={{
                                display: 'inline-block',
                                padding: '12px 20px',
                                backgroundColor: theme.accent.blue,
                                color: theme.text.primary,
                                border: 'none',
                                borderRadius: theme.radius.medium,
                                fontSize: '16px',
                                fontWeight: 500,
                                textDecoration: 'none',
                                transition: theme.transition.normal,
                            }}
                        >
                            {t('theme.appearance')}
                        </Link>
                    </section>

                    {/* Langue */}
                    <section
                        style={{
                            backgroundColor: theme.background.tertiary,
                            borderRadius: '8px',
                            padding: '30px',
                            border: `1px solid ${theme.border.primary}`,
                        }}
                    >
                        <h2
                            style={{
                                fontSize: '20px',
                                fontWeight: 600,
                                marginBottom: '20px',
                                color: theme.text.primary,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                            }}
                        >
                            <span
                                style={{
                                    display: 'inline-block',
                                    width: '24px',
                                    height: '24px',
                                    backgroundColor: theme.accent.blue,
                                    borderRadius: '4px',
                                    color: theme.text.primary,
                                    textAlign: 'center',
                                    lineHeight: '24px',
                                    fontSize: '14px',
                                }}
                            >
                                🌐
                            </span>
                            {t('profile.language')}
                        </h2>
                        <label
                            style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: 500,
                                color: theme.text.secondary,
                                marginBottom: '12px',
                            }}
                        >
                            {t('profile.languageDescription')}
                        </label>
                        <LanguageSelector compact={false} />
                    </section>

                    {/* Actions */}
                    <section
                        style={{
                            backgroundColor: theme.background.tertiary,
                            borderRadius: '8px',
                            padding: '30px',
                            border: `1px solid ${theme.border.primary}`,
                        }}
                    >
                        <h2
                            style={{
                                fontSize: '20px',
                                fontWeight: 600,
                                marginBottom: '20px',
                                color: theme.text.primary,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                            }}
                        >
                            <span
                                style={{
                                    display: 'inline-block',
                                    width: '24px',
                                    height: '24px',
                                    backgroundColor: theme.accent.red,
                                    borderRadius: '4px',
                                    color: theme.text.primary,
                                    textAlign: 'center',
                                    lineHeight: '24px',
                                    fontSize: '14px',
                                }}
                            >
                                ⚠️
                            </span>
                            {t('profile.actions')}
                        </h2>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '16px',
                            }}
                        >
                            <button
                                type="button"
                                onClick={() => setShowLogoutConfirm(true)}
                                disabled={isLoggingOut}
                                style={{
                                    backgroundColor: isLoggingOut ? theme.text.disabled : theme.accent.red,
                                    color: theme.text.primary,
                                    border: 'none',
                                    padding: '12px 20px',
                                    borderRadius: '6px',
                                    cursor: isLoggingOut ? 'not-allowed' : 'pointer',
                                    fontSize: '16px',
                                    fontWeight: 500,
                                    transition: 'background-color 0.2s',
                                    textAlign: 'left',
                                    opacity: isLoggingOut ? 0.7 : 1,
                                }}
                                onMouseOver={(e) =>
                                    !isLoggingOut && (e.currentTarget.style.backgroundColor = theme.accent.redHover)
                                }
                                onMouseOut={(e) =>
                                    !isLoggingOut && (e.currentTarget.style.backgroundColor = theme.accent.red)
                                }
                            >
                                {isLoggingOut ? t('common.loading') : t('profile.logout')}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    if (window.confirm(t('profile.confirmClearLocalData'))) {
                                        localStorage.removeItem('stormi_token');
                                        localStorage.removeItem('stormi_user');
                                        window.location.reload();
                                    }
                                }}
                                style={{
                                    backgroundColor: 'transparent',
                                    color: theme.text.secondary,
                                    border: `1px solid ${theme.border.primary}`,
                                    padding: '12px 20px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    fontWeight: 500,
                                    transition: 'all 0.2s',
                                    textAlign: 'left',
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.backgroundColor = theme.background.secondary;
                                    e.currentTarget.style.borderColor = theme.accent.red;
                                    e.currentTarget.style.color = theme.accent.red;
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.borderColor = theme.border.primary;
                                    e.currentTarget.style.color = theme.text.secondary;
                                }}
                            >
                                {t('profile.clearLocalData')}
                            </button>
                        </div>
                        <div
                            style={{
                                marginTop: '20px',
                                fontSize: '12px',
                                color: theme.text.tertiary,
                                lineHeight: 1.5,
                            }}
                        >
                            <p style={{ margin: 0 }}>
                                <strong>{t('profile.noteLabel')}</strong> {t('profile.logoutNote')}
                            </p>
                        </div>
                    </section>
                </div>
            </div>

            <ConfirmDialog
                isOpen={showLogoutConfirm}
                title={t('dialogs.logoutTitle')}
                message={t('dialogs.logoutMessage')}
                confirmText={t('nav.logout')}
                cancelText={t('common.cancel')}
                confirmColor={theme.accent.red}
                onConfirm={handleLogout}
                onCancel={() => setShowLogoutConfirm(false)}
            />
        </>
    );
}
