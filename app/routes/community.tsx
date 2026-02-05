// INFO : Page Communauté — espace d'échange et de partage (layout _app fournit Navigation + AuthGuard)
import React from 'react';
import { Link } from 'react-router';
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

// Ordre : Famille, Amis, Invitations, Partage, Conversations, Activité
const SECTION_ICONS = [
    '👨‍👩‍👧', // Famille
    '👥', // Amis
    '✉️', // Invitations
    '📁', // Partages
    '💬', // Conversations
    '🔄', // Activité
] as const;

const SECTION_PATHS = ['/community/family', '/community/friends', '/community/invitations', '/community/shares', '/community/conversations', '/community/activity'] as const;

const SECTION_KEYS = [
    { title: 'community.sectionFamilyTitle', subtitle: 'community.sectionFamilySubtitle', description: 'community.sectionFamilyDescription' },
    { title: 'community.sectionFriendsTitle', subtitle: 'community.sectionFriendsSubtitle', description: 'community.sectionFriendsDescription' },
    { title: 'community.sectionInvitationsTitle', subtitle: 'community.sectionInvitationsSubtitle', description: 'community.sectionInvitationsDescription' },
    { title: 'community.sectionSharesTitle', subtitle: 'community.sectionSharesSubtitle', description: 'community.sectionSharesDescription' },
    { title: 'community.sectionConversationsTitle', subtitle: 'community.sectionConversationsSubtitle', description: 'community.sectionConversationsDescription' },
    { title: 'community.sectionActivityTitle', subtitle: 'community.sectionActivitySubtitle', description: 'community.sectionActivityDescription' },
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
                    <Link
                        key={section.title}
                        to={SECTION_PATHS[index]}
                        prefetch="intent"
                        style={{
                            textDecoration: 'none',
                            color: 'inherit',
                        }}
                    >
                        <article
                            className="community-card"
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
                                transition: theme.transition?.normal ?? '0.2s ease',
                                cursor: 'pointer',
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
                    </Link>
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
            <style>{`
                a:hover .community-card {
                    border-color: ${theme.accent.blue}40 !important;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.12);
                }
                a:focus-visible .community-card {
                    outline: 2px solid ${theme.accent.blue};
                    outline-offset: 2px;
                }
            `}</style>
        </div>
    );
}
