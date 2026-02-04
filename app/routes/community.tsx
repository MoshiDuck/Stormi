// INFO : Page Communauté — espace d'échange et de partage (layout _app fournit Navigation + AuthGuard)
import React from 'react';
import { useLanguage } from '~/contexts/LanguageContext';
import { useTheme } from '~/contexts/ThemeContext';
import { useBreakpoint } from '~/hooks/useBreakpoint';
import { translations } from '~/utils/i18n';
import { Users } from 'lucide-react';

export function meta() {
    return [
        { title: translations.fr.meta.pageTitleCommunity },
        { name: 'description', content: translations.fr.meta.pageDescriptionCommunity },
    ];
}

const SECTION_ICONS = [
    '👥', // Amis
    '✉️', // Invitations
    '💬', // Conversations
    '🔄', // Activité
    '📁', // Partages
    '👨‍👩‍👧', // Famille
] as const;

const SECTION_KEYS = [
    { title: 'community.sectionFriendsTitle', subtitle: 'community.sectionFriendsSubtitle', description: 'community.sectionFriendsDescription' },
    { title: 'community.sectionInvitationsTitle', subtitle: 'community.sectionInvitationsSubtitle', description: 'community.sectionInvitationsDescription' },
    { title: 'community.sectionConversationsTitle', subtitle: 'community.sectionConversationsSubtitle', description: 'community.sectionConversationsDescription' },
    { title: 'community.sectionActivityTitle', subtitle: 'community.sectionActivitySubtitle', description: 'community.sectionActivityDescription' },
    { title: 'community.sectionSharesTitle', subtitle: 'community.sectionSharesSubtitle', description: 'community.sectionSharesDescription' },
    { title: 'community.sectionFamilyTitle', subtitle: 'community.sectionFamilySubtitle', description: 'community.sectionFamilyDescription' },
] as const;

export default function CommunityRoute() {
    const { t } = useLanguage();
    const { theme } = useTheme();
    const breakpoint = useBreakpoint();

    const gridCols = breakpoint === 'phone' ? 1 : breakpoint === 'tablet' ? 2 : 3;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {/* En-tête */}
            <div style={{ textAlign: 'center', marginBottom: 8 }}>
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

            {/* Grille de cartes */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
                    gap: 20,
                    width: '100%',
                }}
            >
                {SECTION_KEYS.map((section, index) => (
                    <article
                        key={section.title}
                        style={{
                            backgroundColor: theme.background.secondary,
                            borderRadius: 12,
                            padding: 24,
                            border: `1px solid ${theme.border.primary}`,
                            boxShadow: theme.shadow?.small ?? '0 1px 3px rgba(0,0,0,0.06)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 10,
                            minHeight: 0,
                        }}
                    >
                        <div
                            style={{
                                fontSize: 28,
                                lineHeight: 1,
                                marginBottom: 2,
                            }}
                            aria-hidden
                        >
                            {SECTION_ICONS[index]}
                        </div>
                        <h2
                            style={{
                                fontSize: 18,
                                fontWeight: 700,
                                color: theme.text.primary,
                                margin: 0,
                            }}
                        >
                            {t(section.title)}
                        </h2>
                        <p
                            style={{
                                fontSize: 13,
                                color: theme.text.secondary,
                                margin: 0,
                                lineHeight: 1.35,
                            }}
                        >
                            {t(section.subtitle)}
                        </p>
                        <p
                            style={{
                                fontSize: 14,
                                color: theme.text.tertiary ?? theme.text.secondary,
                                margin: 0,
                                lineHeight: 1.5,
                            }}
                        >
                            {t(section.description)}
                        </p>
                    </article>
                ))}
            </div>

            {/* Bandeau bientôt disponible */}
            <section
                style={{
                    backgroundColor: theme.background.tertiary,
                    borderRadius: 8,
                    padding: 20,
                    border: `1px solid ${theme.border.primary}`,
                    textAlign: 'center',
                }}
            >
                <p
                    style={{
                        margin: 0,
                        fontSize: 14,
                        color: theme.text.secondary,
                        lineHeight: 1.6,
                    }}
                >
                    {t('community.description')}
                </p>
                <p
                    style={{
                        marginTop: 12,
                        fontSize: 13,
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
