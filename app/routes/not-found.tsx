/**
 * Page 404 : route non trouvée.
 * Deux actions claires : retour accueil ou ajouter des fichiers.
 */
import React from 'react';
import { Link } from 'react-router';
import { darkTheme } from '~/utils/ui/theme';
import { useLanguage } from '~/contexts/LanguageContext';

export function meta() {
    return [
        { title: 'Page non trouvée | Stormi' },
        { name: 'robots', content: 'noindex' },
    ];
}

export default function NotFoundRoute() {
    const { t } = useLanguage();

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 24,
                backgroundColor: darkTheme.background.primary,
                color: darkTheme.text.primary,
                textAlign: 'center',
            }}
            role="main"
        >
            <h1
                style={{
                    fontSize: 'clamp(3rem, 10vw, 6rem)',
                    fontWeight: 700,
                    margin: 0,
                    color: darkTheme.text.secondary,
                }}
                aria-hidden="true"
            >
                404
            </h1>
            <p
                style={{
                    fontSize: '1.25rem',
                    color: darkTheme.text.secondary,
                    marginTop: 16,
                    marginBottom: 32,
                }}
            >
                {t('notFound.description')}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', alignItems: 'center' }}>
                <Link
                    to="/home"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 24px',
                        backgroundColor: darkTheme.accent.blue,
                        color: '#fff',
                        borderRadius: darkTheme.radius.medium,
                        textDecoration: 'none',
                        fontWeight: 600,
                        transition: darkTheme.transition.normal,
                    }}
                >
                    {t('notFound.backHome')}
                </Link>
                <Link
                    to="/upload"
                    prefetch="intent"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 24px',
                        backgroundColor: darkTheme.background.tertiary,
                        color: darkTheme.text.primary,
                        border: `1px solid ${darkTheme.border.secondary}`,
                        borderRadius: darkTheme.radius.medium,
                        textDecoration: 'none',
                        fontWeight: 500,
                        transition: darkTheme.transition.normal,
                    }}
                >
                    {t('notFound.addFiles')}
                </Link>
            </div>
        </div>
    );
}
