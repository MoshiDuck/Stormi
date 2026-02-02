// INFO : app/routes/profile.tsx — Compte (infos personnelles, compte connecté) ; langue/déconnexion dans Gérer le profil.
import React from 'react';
import { Link } from 'react-router';
import { useAuth } from '~/hooks/useAuth';
import { darkTheme } from '~/utils/ui/theme';
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

    if (!user) {
        return null; // AuthGuard gère la redirection
    }

    return (
        <>
                    <div style={{
                        backgroundColor: darkTheme.background.secondary,
                        borderRadius: '12px',
                        padding: '40px',
                        boxShadow: darkTheme.shadow.medium
                    }}>
                        <div style={{ marginBottom: '24px' }}>
                            <Link
                                to="/manage-profile"
                                prefetch="intent"
                                style={{
                                    color: darkTheme.accent.blue,
                                    textDecoration: 'none',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    marginBottom: '16px',
                                    display: 'inline-block',
                                }}
                            >
                                {t('profileMenu.manageProfile')} →
                            </Link>
                        </div>
                        <div style={{ marginBottom: '40px' }}>
                            <h1 style={{
                                fontSize: '32px',
                                fontWeight: 'bold',
                                marginBottom: '8px',
                                color: darkTheme.text.primary
                            }}>
                                {t('profile.title')}
                            </h1>
                            <p style={{
                                color: darkTheme.text.secondary,
                                fontSize: '16px'
                            }}>
                                {t('profile.subtitle')}
                            </p>
                        </div>

                        <div style={{ display: 'grid', gap: '30px' }}>
                            {/* Section Informations personnelles */}
                            <section style={{
                                backgroundColor: darkTheme.background.tertiary,
                                borderRadius: '8px',
                                padding: '30px',
                                border: `1px solid ${darkTheme.border.primary}`
                            }}>
                                <h2 style={{
                                    fontSize: '20px',
                                    fontWeight: '600',
                                    marginBottom: '20px',
                                    color: darkTheme.text.primary,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}>
                  <span style={{
                      display: 'inline-block',
                      width: '24px',
                      height: '24px',
                      backgroundColor: '#4285f4',
                      borderRadius: '4px',
                      color: 'white',
                      textAlign: 'center',
                      lineHeight: '24px',
                      fontSize: '14px'
                  }}>👤</span>
                                    {t('profile.personalInfo')}
                                </h2>

                                <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
                                    {user.picture && (
                                        <div style={{ flexShrink: 0 }}>
                                            <img
                                                src={user.picture}
                                                alt="avatar"
                                                style={{
                                                    width: 120,
                                                    height: 120,
                                                    borderRadius: '50%',
                                                    border: '4px solid #4285f4',
                                                    objectFit: 'cover'
                                                }}
                                            />
                                        </div>
                                    )}

                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                            gap: '20px'
                                        }}>
                                            <div>
                                                <label style={{
                                                    display: 'block',
                                                    fontSize: '14px',
                                                    fontWeight: '500',
                                                    color: darkTheme.text.secondary,
                                                    marginBottom: '6px'
                                                }}>
                                                    {t('profile.fullName')}
                                                </label>
                                                <div style={{
                                                    backgroundColor: darkTheme.background.secondary,
                                                    padding: '12px 16px',
                                                    borderRadius: '6px',
                                                    border: `1px solid ${darkTheme.border.primary}`,
                                                    fontSize: '16px',
                                                    fontWeight: '500'
                                                }}>
                                                    {user.name || t('profile.notSpecified')}
                                                </div>
                                            </div>

                                            <div>
                                                <label style={{
                                                    display: 'block',
                                                    fontSize: '14px',
                                                    fontWeight: '500',
                                                    color: darkTheme.text.secondary,
                                                    marginBottom: '6px'
                                                }}>
                                                    {t('profile.emailLabel')}
                                                </label>
                                                <div style={{
                                                    backgroundColor: darkTheme.background.secondary,
                                                    padding: '12px 16px',
                                                    borderRadius: '6px',
                                                    border: `1px solid ${darkTheme.border.primary}`,
                                                    fontSize: '16px'
                                                }}>
                                                    {user.email || t('profile.notSpecified')}
                                                </div>
                                            </div>

                                            <div>
                                                <label style={{
                                                    display: 'block',
                                                    fontSize: '14px',
                                                    fontWeight: '500',
                                                    color: darkTheme.text.secondary,
                                                    marginBottom: '6px'
                                                }}>
                                                    {t('profile.verificationStatus')}
                                                </label>
                                                <div style={{
                                                    backgroundColor: darkTheme.background.secondary,
                                                    padding: '12px 16px',
                                                    borderRadius: '6px',
                                                    border: `1px solid ${darkTheme.border.primary}`,
                                                    fontSize: '16px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px'
                                                }}>
                                                    {user.email_verified ? (
                                                        <>
                              <span style={{
                                  color: '#34a853',
                                  fontSize: '18px'
                              }}>✓</span>
                                                            <span style={{ color: '#34a853' }}>{t('profile.emailVerified')}</span>
                                                        </>
                                                    ) : (
                                                        <>
                              <span style={{
                                  color: '#f44336',
                                  fontSize: '18px'
                              }}>✗</span>
                                                            <span style={{ color: '#f44336' }}>{t('profile.emailNotVerified')}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <label style={{
                                                    display: 'block',
                                                    fontSize: '14px',
                                                    fontWeight: '500',
                                                    color: darkTheme.text.secondary,
                                                    marginBottom: '6px'
                                                }}>
                                                    {t('profile.userId')}
                                                </label>
                                                <div style={{
                                                    backgroundColor: darkTheme.background.secondary,
                                                    padding: '12px 16px',
                                                    borderRadius: '6px',
                                                    border: `1px solid ${darkTheme.border.primary}`,
                                                    fontSize: '14px',
                                                    fontFamily: 'monospace',
                                                    wordBreak: 'break-all',
                                                    color: '#666'
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
                                borderRadius: '8px',
                                padding: '30px',
                                border: `1px solid ${darkTheme.border.primary}`
                            }}>
                                <h2 style={{
                                    fontSize: '20px',
                                    fontWeight: '600',
                                    marginBottom: '20px',
                                    color: darkTheme.text.primary,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}>
                  <span style={{
                      display: 'inline-block',
                      width: '24px',
                      height: '24px',
                      backgroundColor: '#34a853',
                      borderRadius: '4px',
                      color: 'white',
                      textAlign: 'center',
                      lineHeight: '24px',
                      fontSize: '14px'
                  }}>🔗</span>
                                    {t('profile.connectedAccount')}
                                </h2>

                                <div style={{
                                    backgroundColor: darkTheme.background.secondary,
                                    borderRadius: '8px',
                                    padding: '20px',
                                    border: '1px solid #dee2e6'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px',
                                        marginBottom: '16px'
                                    }}>
                                        <img
                                            src="https://www.google.com/favicon.ico"
                                            alt="Google"
                                            style={{ width: '24px', height: '24px' }}
                                        />
                                        <div>
                                            <p style={{
                                                margin: 0,
                                                fontWeight: '500',
                                                fontSize: '16px'
                                            }}>
                                                {t('profile.googleAccount')}
                                            </p>
                                            <p style={{
                                                margin: 0,
                                                color: darkTheme.text.secondary,
                                                fontSize: '14px'
                                            }}>
                                                {t('profile.connectedViaGoogle')}
                                            </p>
                                        </div>
                                    </div>

                                    <div style={{
                                        fontSize: '14px',
                                        color: darkTheme.text.secondary,
                                        backgroundColor: darkTheme.background.tertiary,
                                        padding: '12px',
                                        borderRadius: '6px',
                                        marginTop: '12px'
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
                    padding: '20px 0',
                    marginTop: '40px',
                    textAlign: 'center'
                }}>
                    <div style={{
                        maxWidth: 1200,
                        margin: '0 auto',
                        padding: '0 20px'
                    }}>
                        <p style={{ margin: 0, fontSize: '14px' }}>
                            © {new Date().getFullYear()} Stormi. {t('footer.allRightsReserved')}.
                        </p>
                    </div>
                </footer>
        </>
    );
}