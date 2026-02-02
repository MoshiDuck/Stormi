// INFO : app/routes/profile.tsx — Compte (infos personnelles, compte connecté) ; langue/déconnexion dans Gérer le profil. Responsive (téléphone, tablette, desktop).
import React from 'react';
import { Link } from 'react-router';
import { useAuth } from '~/hooks/useAuth';
import { useBreakpoint } from '~/hooks/useBreakpoint';
import { darkTheme } from '~/utils/ui/theme';
import { CONTENT_PADDING } from '~/utils/ui/breakpoints';
import { useLanguage } from '~/contexts/LanguageContext';
import { translations } from '~/utils/i18n';

export function meta() {
    return [
        { title: translations.fr.meta.pageTitleProfile },
        { name: 'description', content: translations.fr.meta.pageDescriptionProfile },
    ];
}

export default function ProfileRoute() {
    const { user } = useAuth();
    const { t } = useLanguage();
    const breakpoint = useBreakpoint();
    const isPhone = breakpoint === 'phone';
    const pad = CONTENT_PADDING[breakpoint];
    const sectionPad = isPhone ? 16 : pad === 12 ? 20 : 30;
    const gap = isPhone ? 16 : 30;

    if (!user) {
        return null; // AuthGuard gère la redirection
    }

    return (
        <>
                    <div style={{
                        backgroundColor: darkTheme.background.secondary,
                        borderRadius: isPhone ? 10 : 12,
                        padding: isPhone ? 16 : 40,
                        boxShadow: darkTheme.shadow.medium,
                        minWidth: 0,
                    }}>
                        <div style={{ marginBottom: isPhone ? 16 : 24 }}>
                            <Link
                                to="/manage-profile"
                                prefetch="intent"
                                style={{
                                    color: darkTheme.accent.blue,
                                    textDecoration: 'none',
                                    fontSize: isPhone ? 13 : 14,
                                    fontWeight: 500,
                                    marginBottom: 16,
                                    display: 'inline-block',
                                }}
                            >
                                {t('profileMenu.manageProfile')} →
                            </Link>
                        </div>
                        <div style={{ marginBottom: isPhone ? 24 : 40 }}>
                            <h1 style={{
                                fontSize: isPhone ? 24 : 32,
                                fontWeight: 'bold',
                                marginBottom: 8,
                                color: darkTheme.text.primary,
                                wordBreak: 'break-word',
                            }}>
                                {t('profile.title')}
                            </h1>
                            <p style={{
                                color: darkTheme.text.secondary,
                                fontSize: isPhone ? 14 : 16,
                                wordBreak: 'break-word',
                            }}>
                                {t('profile.subtitle')}
                            </p>
                        </div>

                        <div style={{ display: 'grid', gap, minWidth: 0 }}>
                            {/* Section Informations personnelles */}
                            <section style={{
                                backgroundColor: darkTheme.background.tertiary,
                                borderRadius: 8,
                                padding: sectionPad,
                                border: `1px solid ${darkTheme.border.primary}`,
                                minWidth: 0,
                            }}>
                                <h2 style={{
                                    fontSize: isPhone ? 17 : 20,
                                    fontWeight: 600,
                                    marginBottom: isPhone ? 14 : 20,
                                    color: darkTheme.text.primary,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                }}>
                  <span style={{
                      display: 'inline-block',
                      width: 24,
                      height: 24,
                      backgroundColor: '#4285f4',
                      borderRadius: 4,
                      color: 'white',
                      textAlign: 'center',
                      lineHeight: '24px',
                      fontSize: 14,
                  }}>👤</span>
                                    {t('profile.personalInfo')}
                                </h2>

                                <div style={{
                                    display: 'flex',
                                    flexDirection: isPhone ? 'column' : 'row',
                                    gap: isPhone ? 16 : 30,
                                    alignItems: isPhone ? 'center' : 'flex-start',
                                    minWidth: 0,
                                }}>
                                    {user.picture && (
                                        <div style={{ flexShrink: 0 }}>
                                            <img
                                                src={user.picture}
                                                alt="avatar"
                                                style={{
                                                    width: isPhone ? 80 : 120,
                                                    height: isPhone ? 80 : 120,
                                                    borderRadius: '50%',
                                                    border: isPhone ? '3px solid #4285f4' : '4px solid #4285f4',
                                                    objectFit: 'cover',
                                                }}
                                            />
                                        </div>
                                    )}

                                    <div style={{ flex: 1, minWidth: 0, width: isPhone ? '100%' : undefined }}>
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: isPhone ? '1fr' : 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))',
                                            gap: isPhone ? 14 : 20,
                                            minWidth: 0,
                                        }}>
                                            <div>
                                                <label style={{
                                                    display: 'block',
                                                    fontSize: isPhone ? 13 : 14,
                                                    fontWeight: 500,
                                                    color: darkTheme.text.secondary,
                                                    marginBottom: 6,
                                                }}>
                                                    {t('profile.fullName')}
                                                </label>
                                                <div style={{
                                                    backgroundColor: darkTheme.background.secondary,
                                                    padding: isPhone ? '10px 12px' : '12px 16px',
                                                    borderRadius: 6,
                                                    border: `1px solid ${darkTheme.border.primary}`,
                                                    fontSize: isPhone ? 14 : 16,
                                                    fontWeight: 500,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    wordBreak: 'break-word',
                                                }}>
                                                    {user.name || t('profile.notSpecified')}
                                                </div>
                                            </div>

                                            <div>
                                                <label style={{
                                                    display: 'block',
                                                    fontSize: isPhone ? 13 : 14,
                                                    fontWeight: 500,
                                                    color: darkTheme.text.secondary,
                                                    marginBottom: 6,
                                                }}>
                                                    {t('profile.emailLabel')}
                                                </label>
                                                <div style={{
                                                    backgroundColor: darkTheme.background.secondary,
                                                    padding: isPhone ? '10px 12px' : '12px 16px',
                                                    borderRadius: 6,
                                                    border: `1px solid ${darkTheme.border.primary}`,
                                                    fontSize: isPhone ? 14 : 16,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    wordBreak: 'break-all',
                                                }}>
                                                    {user.email || t('profile.notSpecified')}
                                                </div>
                                            </div>

                                            <div>
                                                <label style={{
                                                    display: 'block',
                                                    fontSize: isPhone ? 13 : 14,
                                                    fontWeight: 500,
                                                    color: darkTheme.text.secondary,
                                                    marginBottom: 6,
                                                }}>
                                                    {t('profile.verificationStatus')}
                                                </label>
                                                <div style={{
                                                    backgroundColor: darkTheme.background.secondary,
                                                    padding: isPhone ? '10px 12px' : '12px 16px',
                                                    borderRadius: 6,
                                                    border: `1px solid ${darkTheme.border.primary}`,
                                                    fontSize: isPhone ? 14 : 16,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 8,
                                                }}>
                                                    {user.email_verified ? (
                                                        <>
                              <span style={{
                                  color: '#34a853',
                                  fontSize: isPhone ? 16 : 18,
                              }}>✓</span>
                                                            <span style={{ color: '#34a853' }}>{t('profile.emailVerified')}</span>
                                                        </>
                                                    ) : (
                                                        <>
                              <span style={{
                                  color: '#f44336',
                                  fontSize: isPhone ? 16 : 18,
                              }}>✗</span>
                                                            <span style={{ color: '#f44336' }}>{t('profile.emailNotVerified')}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <label style={{
                                                    display: 'block',
                                                    fontSize: isPhone ? 13 : 14,
                                                    fontWeight: 500,
                                                    color: darkTheme.text.secondary,
                                                    marginBottom: 6,
                                                }}>
                                                    {t('profile.userId')}
                                                </label>
                                                <div style={{
                                                    backgroundColor: darkTheme.background.secondary,
                                                    padding: isPhone ? '10px 12px' : '12px 16px',
                                                    borderRadius: 6,
                                                    border: `1px solid ${darkTheme.border.primary}`,
                                                    fontSize: isPhone ? 12 : 14,
                                                    fontFamily: 'monospace',
                                                    wordBreak: 'break-all',
                                                    color: '#666',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}>
                                                    {user.id}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section Compte */}
                            <section style={{
                                backgroundColor: darkTheme.background.tertiary,
                                borderRadius: 8,
                                padding: sectionPad,
                                border: `1px solid ${darkTheme.border.primary}`,
                                minWidth: 0,
                            }}>
                                <h2 style={{
                                    fontSize: isPhone ? 17 : 20,
                                    fontWeight: 600,
                                    marginBottom: isPhone ? 14 : 20,
                                    color: darkTheme.text.primary,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                }}>
                  <span style={{
                      display: 'inline-block',
                      width: 24,
                      height: 24,
                      backgroundColor: '#34a853',
                      borderRadius: 4,
                      color: 'white',
                      textAlign: 'center',
                      lineHeight: '24px',
                      fontSize: 14,
                  }}>🔗</span>
                                    {t('profile.connectedAccount')}
                                </h2>

                                <div style={{
                                    backgroundColor: darkTheme.background.secondary,
                                    borderRadius: 8,
                                    padding: isPhone ? 14 : 20,
                                    border: '1px solid #dee2e6',
                                    minWidth: 0,
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: isPhone ? 12 : 16,
                                        marginBottom: isPhone ? 12 : 16,
                                        minWidth: 0,
                                    }}>
                                        <img
                                            src="https://www.google.com/favicon.ico"
                                            alt="Google"
                                            style={{ width: 24, height: 24, flexShrink: 0 }}
                                        />
                                        <div style={{ minWidth: 0 }}>
                                            <p style={{
                                                margin: 0,
                                                fontWeight: 500,
                                                fontSize: isPhone ? 14 : 16,
                                                wordBreak: 'break-word',
                                            }}>
                                                {t('profile.googleAccount')}
                                            </p>
                                            <p style={{
                                                margin: 0,
                                                color: darkTheme.text.secondary,
                                                fontSize: isPhone ? 12 : 14,
                                                wordBreak: 'break-word',
                                            }}>
                                                {t('profile.connectedViaGoogle')}
                                            </p>
                                        </div>
                                    </div>

                                    <div style={{
                                        fontSize: isPhone ? 12 : 14,
                                        color: darkTheme.text.secondary,
                                        backgroundColor: darkTheme.background.tertiary,
                                        padding: isPhone ? 10 : 12,
                                        borderRadius: 6,
                                        marginTop: 12,
                                        wordBreak: 'break-word',
                                    }}>
                                        <p style={{ margin: 0 }}>
                                            {t('profile.accountSecureHint')}
                                        </p>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>

                <footer style={{
                    backgroundColor: darkTheme.background.nav,
                    color: darkTheme.text.secondary,
                    padding: isPhone ? '16px 0' : '20px 0',
                    marginTop: isPhone ? 24 : 40,
                    textAlign: 'center',
                }}>
                    <div style={{
                        maxWidth: 1200,
                        margin: '0 auto',
                        padding: isPhone ? '0 12px' : '0 20px',
                        minWidth: 0,
                    }}>
                        <p style={{ margin: 0, fontSize: isPhone ? 12 : 14, wordBreak: 'break-word' }}>
                            © {new Date().getFullYear()} Stormi. {t('footer.allRightsReserved')}.
                        </p>
                    </div>
                </footer>
        </>
    );
}