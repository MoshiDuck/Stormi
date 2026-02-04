// INFO : Layout commun pour les sous-pages Communauté (Amis, Invitations, etc.)
import React from 'react';
import { Link } from 'react-router';
import { useLanguage } from '~/contexts/LanguageContext';
import { useTheme } from '~/contexts/ThemeContext';
import { ChevronLeft } from 'lucide-react';

interface CommunitySubPageProps {
    titleKey: string;
    subtitleKey: string;
    descriptionKey: string;
    icon: string;
}

export function CommunitySubPage({ titleKey, subtitleKey, descriptionKey, icon }: CommunitySubPageProps) {
    const { t } = useLanguage();
    const { theme } = useTheme();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <Link
                to="/community"
                prefetch="intent"
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    color: theme.text.secondary,
                    textDecoration: 'none',
                    fontSize: 14,
                    fontWeight: 500,
                    marginBottom: 8,
                }}
            >
                <ChevronLeft size={18} aria-hidden />
                {t('community.backToCommunity')}
            </Link>

            <div
                style={{
                    backgroundColor: theme.background.secondary,
                    borderRadius: 12,
                    padding: 32,
                    border: `1px solid ${theme.border.primary}`,
                    boxShadow: theme.shadow?.small ?? '0 1px 3px rgba(0,0,0,0.06)',
                }}
            >
                <div style={{ fontSize: 36, lineHeight: 1, marginBottom: 16 }} aria-hidden>
                    {icon}
                </div>
                <h1
                    style={{
                        fontSize: 24,
                        fontWeight: 700,
                        color: theme.text.primary,
                        margin: '0 0 8px 0',
                    }}
                >
                    {t(titleKey)}
                </h1>
                <p
                    style={{
                        fontSize: 15,
                        color: theme.text.secondary,
                        margin: '0 0 16px 0',
                        lineHeight: 1.4,
                    }}
                >
                    {t(subtitleKey)}
                </p>
                <p
                    style={{
                        fontSize: 14,
                        color: theme.text.tertiary ?? theme.text.secondary,
                        margin: 0,
                        lineHeight: 1.5,
                    }}
                >
                    {t(descriptionKey)}
                </p>
                <p
                    style={{
                        marginTop: 24,
                        fontSize: 13,
                        fontWeight: 600,
                        color: theme.accent.blue,
                    }}
                >
                    {t('community.comingSoon')}
                </p>
            </div>
        </div>
    );
}
