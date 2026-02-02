// INFO : Centre d'aide — FAQ et support (layout _app fournit Navigation + AuthGuard)
import React from 'react';
import { useLanguage } from '~/contexts/LanguageContext';
import { darkTheme } from '~/utils/ui/theme';
import { translations } from '~/utils/i18n';

export function meta() {
    return [
        { title: translations.fr.meta.pageTitleHelp },
        { name: 'description', content: translations.fr.meta.pageDescriptionHelp },
    ];
}

export default function HelpRoute() {
    const { t } = useLanguage();

    return (
        <div
            style={{
                backgroundColor: darkTheme.background.secondary,
                borderRadius: '12px',
                padding: '40px',
                boxShadow: darkTheme.shadow.medium,
            }}
        >
            <div style={{ marginBottom: '40px' }}>
                <h1
                    style={{
                        fontSize: '32px',
                        fontWeight: 'bold',
                        marginBottom: '8px',
                        color: darkTheme.text.primary,
                    }}
                >
                    {t('help.title')}
                </h1>
                <p
                    style={{
                        color: darkTheme.text.secondary,
                        fontSize: '16px',
                    }}
                >
                    {t('help.subtitle')}
                </p>
            </div>

            <section
                style={{
                    marginBottom: '32px',
                }}
            >
                <h2
                    style={{
                        fontSize: '20px',
                        fontWeight: 600,
                        marginBottom: '16px',
                        color: darkTheme.text.primary,
                    }}
                >
                    {t('help.faqTitle')}
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div
                        style={{
                            backgroundColor: darkTheme.background.tertiary,
                            borderRadius: '8px',
                            padding: '20px',
                            border: `1px solid ${darkTheme.border.primary}`,
                        }}
                    >
                        <h3
                            style={{
                                fontSize: '16px',
                                fontWeight: 600,
                                marginBottom: '8px',
                                color: darkTheme.text.primary,
                            }}
                        >
                            {t('help.faqUpload')}
                        </h3>
                        <p
                            style={{
                                margin: 0,
                                fontSize: '14px',
                                color: darkTheme.text.secondary,
                                lineHeight: 1.6,
                            }}
                        >
                            {t('help.faqUploadAnswer')}
                        </p>
                    </div>
                    <div
                        style={{
                            backgroundColor: darkTheme.background.tertiary,
                            borderRadius: '8px',
                            padding: '20px',
                            border: `1px solid ${darkTheme.border.primary}`,
                        }}
                    >
                        <h3
                            style={{
                                fontSize: '16px',
                                fontWeight: 600,
                                marginBottom: '8px',
                                color: darkTheme.text.primary,
                            }}
                        >
                            {t('help.faqStorage')}
                        </h3>
                        <p
                            style={{
                                margin: 0,
                                fontSize: '14px',
                                color: darkTheme.text.secondary,
                                lineHeight: 1.6,
                            }}
                        >
                            {t('help.faqStorageAnswer')}
                        </p>
                    </div>
                </div>
            </section>

            <section
                style={{
                    backgroundColor: darkTheme.background.tertiary,
                    borderRadius: '8px',
                    padding: '24px',
                    border: `1px solid ${darkTheme.border.primary}`,
                }}
            >
                <h2
                    style={{
                        fontSize: '20px',
                        fontWeight: 600,
                        marginBottom: '12px',
                        color: darkTheme.text.primary,
                    }}
                >
                    {t('help.contactTitle')}
                </h2>
                <p
                    style={{
                        margin: 0,
                        fontSize: '14px',
                        color: darkTheme.text.secondary,
                        lineHeight: 1.6,
                    }}
                >
                    {t('help.contactText')}
                </p>
            </section>
        </div>
    );
}
