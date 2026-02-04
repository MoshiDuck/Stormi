// INFO : Gérer le profil — grille : Apparence, Langue, Données personnelles, Déconnexion (layout _app fournit Navigation + AuthGuard)
import React, { useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '~/hooks/useAuth';
import { useTheme } from '~/contexts/ThemeContext';
import { useLanguage } from '~/contexts/LanguageContext';
import { useBreakpoint } from '~/hooks/useBreakpoint';
import { ConfirmDialog } from '~/components/ui/ConfirmDialog';
import { translations } from '~/utils/i18n';
import { BOTTOM_NAV_HEIGHT } from '~/utils/ui/breakpoints';

export function meta() {
    return [
        { title: translations.fr.meta.pageTitleManageProfile },
        { name: 'description', content: translations.fr.meta.pageDescriptionManageProfile },
    ];
}

const CARD_STYLE = (theme: ReturnType<typeof useTheme>['theme']) => ({
    backgroundColor: theme.background.tertiary,
    borderRadius: '12px',
    padding: '24px',
    border: `1px solid ${theme.border.primary}`,
    textDecoration: 'none',
    color: 'inherit',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
    gap: '12px',
    transition: theme.transition.normal,
    cursor: 'pointer',
    minHeight: '140px',
});

export default function ManageProfileRoute() {
    const { user, logout } = useAuth();
    const { theme } = useTheme();
    const { t } = useLanguage();
    const breakpoint = useBreakpoint();
    const showBottomNav = breakpoint === 'phone' || breakpoint === 'tablet';
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

    const iconBox = (emoji: string, color: string) => (
        <span
            style={{
                display: 'inline-flex',
                width: '40px',
                height: '40px',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: color,
                borderRadius: '10px',
                fontSize: '20px',
            }}
        >
            {emoji}
        </span>
    );

    return (
        <>
            <div
                style={{
                    backgroundColor: theme.background.secondary,
                    borderRadius: '12px',
                    padding: '40px',
                    boxShadow: theme.shadow.medium,
                    marginBottom: showBottomNav
                        ? `calc(${BOTTOM_NAV_HEIGHT}px + 24px + env(safe-area-inset-bottom, 0px))`
                        : 0,
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

                <div style={{ marginBottom: '32px' }}>
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
                    <p style={{ color: theme.text.secondary, fontSize: '16px' }}>{t('manageProfile.subtitle')}</p>
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                        gap: '20px',
                    }}
                >
                    {/* Apparence */}
                    <Link
                        to="/theme-settings"
                        prefetch="intent"
                        style={CARD_STYLE(theme)}
                        onMouseOver={(e) => {
                            e.currentTarget.style.borderColor = theme.accent.blue;
                            e.currentTarget.style.boxShadow = theme.shadow.medium;
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.borderColor = theme.border.primary;
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        {iconBox('🎨', theme.accent.blue)}
                        <span style={{ fontSize: '18px', fontWeight: 600, color: theme.text.primary }}>
                            {t('theme.appearance')}
                        </span>
                        <span style={{ fontSize: '14px', color: theme.text.secondary, lineHeight: 1.4 }}>
                            {t('theme.subtitle')}
                        </span>
                    </Link>

                    {/* Langue */}
                    <Link
                        to="/language-settings"
                        prefetch="intent"
                        style={CARD_STYLE(theme)}
                        onMouseOver={(e) => {
                            e.currentTarget.style.borderColor = theme.accent.blue;
                            e.currentTarget.style.boxShadow = theme.shadow.medium;
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.borderColor = theme.border.primary;
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        {iconBox('🌐', theme.accent.blue)}
                        <span style={{ fontSize: '18px', fontWeight: 600, color: theme.text.primary }}>
                            {t('profile.language')}
                        </span>
                        <span style={{ fontSize: '14px', color: theme.text.secondary, lineHeight: 1.4 }}>
                            {t('profile.languageDescription')}
                        </span>
                    </Link>

                    {/* Données personnelles */}
                    <Link
                        to="/profile"
                        prefetch="intent"
                        style={CARD_STYLE(theme)}
                        onMouseOver={(e) => {
                            e.currentTarget.style.borderColor = theme.accent.blue;
                            e.currentTarget.style.boxShadow = theme.shadow.medium;
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.borderColor = theme.border.primary;
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        {iconBox('👤', theme.accent.purple ?? theme.accent.blue)}
                        <span style={{ fontSize: '18px', fontWeight: 600, color: theme.text.primary }}>
                            {t('profile.personalInfo')}
                        </span>
                        <span style={{ fontSize: '14px', color: theme.text.secondary, lineHeight: 1.4 }}>
                            {t('profile.connectedAccount')}
                        </span>
                    </Link>

                    {/* Déconnecter */}
                    <button
                        type="button"
                        onClick={() => setShowLogoutConfirm(true)}
                        disabled={isLoggingOut}
                        style={{
                            ...CARD_STYLE(theme),
                            textAlign: 'left',
                            font: 'inherit',
                            backgroundColor: theme.background.tertiary,
                            borderColor: theme.border.primary,
                        }}
                        onMouseOver={(e) => {
                            if (!isLoggingOut) {
                                e.currentTarget.style.borderColor = theme.accent.red;
                                e.currentTarget.style.boxShadow = theme.shadow.medium;
                            }
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.borderColor = theme.border.primary;
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        {iconBox('🚪', theme.accent.red)}
                        <span style={{ fontSize: '18px', fontWeight: 600, color: theme.text.primary }}>
                            {t('profile.logout')}
                        </span>
                        <span style={{ fontSize: '14px', color: theme.text.secondary, lineHeight: 1.4 }}>
                            {t('dialogs.logoutMessage')}
                        </span>
                    </button>
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
