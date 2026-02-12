// INFO : Page Langue — choix de la langue de l'application (FR, EN, ES, DE).
import React from 'react';
import { Link } from 'react-router';
import { useTheme } from '~/contexts/ThemeContext';
import { useLanguage } from '~/contexts/LanguageContext';
import { LanguageSelector } from '~/components/ui/LanguageSelector';
import { translations } from '~/utils/i18n';

export function meta() {
    return [
        { title: translations.fr.meta.pageTitleLanguageSettings },
        { name: 'description', content: translations.fr.meta.pageDescriptionLanguageSettings },
    ];
}

export default function LanguageSettingsRoute() {
    const { theme } = useTheme();
    const { t } = useLanguage();

    return (
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
                    to="/manage-profile"
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
                    ← {t('language.backToManageProfile')}
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
                    {t('language.title')}
                </h1>
                <p style={{ color: theme.text.secondary, fontSize: '16px' }}>{t('language.subtitle')}</p>
            </div>

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
                    {t('language.selectLanguage')}
                </h2>
                <LanguageSelector compact={false} />
            </section>
        </div>
    );
}
