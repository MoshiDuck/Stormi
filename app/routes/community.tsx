// INFO : Page Communauté — espace d'échange et de partage (layout _app fournit Navigation + AuthGuard)
import React from 'react';
import { useLanguage } from '~/contexts/LanguageContext';
import { useTheme } from '~/contexts/ThemeContext';
import { translations } from '~/utils/i18n';
import { Users } from 'lucide-react';

export function meta() {
    return [
        { title: translations.fr.meta.pageTitleCommunity },
        { name: 'description', content: translations.fr.meta.pageDescriptionCommunity },
    ];
}

export default function CommunityRoute() {
    const { t } = useLanguage();
    const { theme } = useTheme();

    return (
        <div
            style={{
                backgroundColor: theme.background.secondary,
                borderRadius: '12px',
                padding: '40px',
                boxShadow: theme.shadow?.medium ?? '0 4px 12px rgba(0,0,0,0.08)',
                border: `1px solid ${theme.border.primary}`,
            }}
        >
            <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                <div
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        backgroundColor: `${theme.accent.blue}20`,
                        marginBottom: 16,
                    }}
                >
                    <Users size={32} color={theme.accent.blue} aria-hidden />
                </div>
                <h1
                    style={{
                        fontSize: '28px',
                        fontWeight: 'bold',
                        marginBottom: '8px',
                        color: theme.text.primary,
                    }}
                >
                    {t('community.title')}
                </h1>
                <p
                    style={{
                        color: theme.text.secondary,
                        fontSize: '16px',
                        maxWidth: 480,
                        margin: '0 auto',
                    }}
                >
                    {t('community.subtitle')}
                </p>
            </div>

            <section
                style={{
                    backgroundColor: theme.background.tertiary,
                    borderRadius: '8px',
                    padding: '24px',
                    border: `1px solid ${theme.border.primary}`,
                    textAlign: 'center',
                }}
            >
                <p
                    style={{
                        margin: 0,
                        fontSize: '14px',
                        color: theme.text.secondary,
                        lineHeight: 1.6,
                    }}
                >
                    {t('community.description')}
                </p>
                <p
                    style={{
                        marginTop: 16,
                        fontSize: '13px',
                        fontWeight: 600,
                        color: theme.accent.blue,
                    }}
                >
                    {t('community.comingSoon')}
                </p>
            </section>
        </div>
    );
}
