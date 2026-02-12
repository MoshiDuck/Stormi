// INFO : app/components/ui/SplashScreen.tsx
// Écran de démarrage Stormi — optimisé UX/UI production.
//
// === DIAGNOSTIC (points faibles corrigés) ===
// - Visibilité : logo lisible en ≤1s (animation raccourcie), hiérarchie claire (titre > particules).
// - Performance : particules réduites (8), positions fixes (pas de Math.random au render), contain/will-change ciblés.
// - Accessibilité : live region pour état chargement/redirection, prefers-reduced-motion, contraste WCAG.
// - Réseau : aucun asset externe ; tout en CSS inline/critical pour temps de premier rendu minimal.
// - Fallback : timeout 5s si auth bloquée → message + lien vers login.
//
// === RÈGLES PRODUCTION ===
// 1. Priorité visuelle : le nom "Stormi" doit être reconnaissable en <2s (objectif <1s).
// 2. Contraste : texte principal #fff sur #0a0a0a ; accent doré avec repli couleur solide si besoin.
// 3. Microcopy : courte et optionnelle (tagline masquée sur très petits viewports).
// 4. Animations : courtes à l’entrée (~0.5s), optionnelles après ; respect de prefers-reduced-motion.
// 5. Comportement : chargement → redirection ; échec/timeout → message explicite + action (réessayer/login).

import React, { useEffect, useRef, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { darkTheme } from '~/utils/ui/theme';
import { useAuth } from '~/hooks/useAuth';
import { useLanguage } from '~/contexts/LanguageContext';

const SPLASH_LOADING_TIMEOUT_MS = 5000;
/** Durée minimale d’affichage du splash (évite fenêtre noire / flash avant redirection). */
const MIN_SPLASH_DISPLAY_MS = 1200;
/** Délai avant redirection : connecté → /films (Regarder), non connecté → /login (au moins MIN_SPLASH_DISPLAY_MS). */
const REDIRECT_DELAY_MS = { whenLoggedIn: 1500, whenGuest: 800 };

// Positions fixes des particules (évite recalcul et layout à chaque rendu)
const PARTICLE_POSITIONS: Array<{ left: number; top: number; delay: number }> = [
    { left: 15, top: 20, delay: 0 }, { left: 85, top: 25, delay: 1 }, { left: 50, top: 15, delay: 0.5 },
    { left: 25, top: 70, delay: 1.5 }, { left: 75, top: 75, delay: 0.8 }, { left: 40, top: 50, delay: 0.2 },
    { left: 60, top: 35, delay: 1.2 }, { left: 90, top: 60, delay: 0.6 },
];

export function SplashScreen() {
    const navigate = useNavigate();
    const { user, loading } = useAuth();
    const { t } = useLanguage();
    const [loadingTimedOut, setLoadingTimedOut] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (loading) {
            timeoutRef.current = setTimeout(() => setLoadingTimedOut(true), SPLASH_LOADING_TIMEOUT_MS);
            return () => {
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
            };
        }
        setLoadingTimedOut(false);
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, [loading]);

    useEffect(() => {
        if (loading) return;

        const desiredDelay = user ? REDIRECT_DELAY_MS.whenLoggedIn : REDIRECT_DELAY_MS.whenGuest;
        const delay = Math.max(desiredDelay, MIN_SPLASH_DISPLAY_MS);
        const target = user ? '/films' : '/login';

        const timer = setTimeout(() => navigate(target, { replace: true }), delay);
        return () => clearTimeout(timer);
    }, [loading, user, navigate]);

    const statusMessage = useMemo(() => {
        if (loadingTimedOut) return t('splash.loadingLong');
        if (loading) return t('splash.loading');
        if (user) return t('splash.redirecting');
        return t('splash.connecting');
    }, [loading, loadingTimedOut, user, t]);

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: darkTheme.background.primary,
                overflow: 'hidden',
                zIndex: 9999,
                contain: 'strict',
            }}
            role="banner"
            aria-label={t('splash.ariaLabel')}
        >
            {/* Annonce pour lecteurs d’écran */}
            <div
                role="status"
                aria-live="polite"
                aria-atomic="true"
                style={{
                    position: 'absolute',
                    width: '1px',
                    height: '1px',
                    padding: 0,
                    margin: '-1px',
                    overflow: 'hidden',
                    clip: 'rect(0,0,0,0)',
                    whiteSpace: 'nowrap',
                    border: 0,
                }}
            >
                {statusMessage}
            </div>

            {/* Gradient de fond — léger, peu coûteux */}
            <div
                className="splash-gradient-bg"
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: `radial-gradient(circle at 30% 50%, rgba(66, 133, 244, 0.08) 0%, transparent 50%),
                        radial-gradient(circle at 70% 50%, rgba(251, 191, 36, 0.06) 0%, transparent 50%)`,
                    pointerEvents: 'none',
                    contain: 'layout style paint',
                }}
            />

            {/* Particules réduites, positions fixes */}
            <div
                className="splash-particles"
                style={{ position: 'absolute', inset: 0, pointerEvents: 'none', contain: 'layout style paint' }}
                aria-hidden="true"
            >
                {PARTICLE_POSITIONS.map((pos, i) => (
                    <div
                        key={i}
                        className="splash-particle"
                        style={{
                            position: 'absolute',
                            left: `${pos.left}%`,
                            top: `${pos.top}%`,
                            width: 2,
                            height: 2,
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255, 255, 255, 0.12)',
                            animationDelay: `${pos.delay}s`,
                        }}
                    />
                ))}
            </div>

            {/* Contenu principal — priorité visuelle */}
            <div
                style={{
                    position: 'relative',
                    zIndex: 10,
                    textAlign: 'center',
                    padding: '0 20px',
                }}
            >
                <h1
                    style={{
                        margin: 0,
                        fontSize: 'clamp(3rem, 16vw, 12rem)',
                        fontWeight: 800,
                        letterSpacing: '0.08em',
                        lineHeight: 1,
                        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
                        userSelect: 'none',
                    }}
                    aria-hidden="true"
                >
                    <span
                        className="splash-storm"
                        style={{
                            display: 'inline-block',
                            color: darkTheme.text.primary,
                            marginRight: '0.04em',
                            textShadow: '0 0 40px rgba(255, 255, 255, 0.1)',
                            fontWeight: 800,
                        }}
                    >
                        STOR
                    </span>
                    <span
                        className="splash-mi"
                        style={{
                            display: 'inline-block',
                            background: 'linear-gradient(135deg, #fbbf24 0%, #fde047 30%, #fbbf24 60%, #f59e0b 100%)',
                            backgroundSize: '200% 100%',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            color: 'transparent',
                            filter: 'drop-shadow(0 0 24px rgba(251, 191, 36, 0.35))',
                            fontWeight: 800,
                        }}
                    >
                        MI
                    </span>
                </h1>

                {/* Fallback : chargement bloqué */}
                {loadingTimedOut && (
                    <div
                        style={{
                            marginTop: '1.5rem',
                            padding: '0.75rem 1rem',
                            backgroundColor: darkTheme.surface.warning,
                            color: darkTheme.text.secondary,
                            borderRadius: darkTheme.radius.medium,
                            fontSize: '0.875rem',
                            maxWidth: 320,
                        }}
                    >
                        <p style={{ margin: 0, marginBottom: '0.5rem' }}>
                            Le chargement prend plus de temps que prévu.
                        </p>
                        <button
                            type="button"
                            onClick={() => navigate('/login', { replace: true })}
                            style={{
                                padding: '0.4rem 0.8rem',
                                backgroundColor: darkTheme.accent.blue,
                                color: '#fff',
                                border: 'none',
                                borderRadius: darkTheme.radius.small,
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                            }}
                        >
                            Aller à la connexion
                        </button>
                    </div>
                )}
            </div>

            <style>{`
                .splash-gradient-bg {
                    animation: splash-gradient-in 0.6s ease-out forwards;
                }
                .splash-storm {
                    opacity: 0;
                    transform: scale(0.92) translateY(12px);
                    animation: splash-reveal 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
                }
                .splash-mi {
                    opacity: 0;
                    transform: scale(0.92) translateY(12px);
                    animation: splash-reveal 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.08s forwards,
                        splash-shimmer 3s ease-in-out infinite 0.6s;
                }
                .splash-particle {
                    opacity: 0;
                    animation: splash-particle-float 6s ease-in-out infinite;
                }
                .splash-particle:nth-child(odd) { animation-duration: 8s; }
                .splash-particle:nth-child(even) { animation-duration: 7s; }

                @keyframes splash-gradient-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes splash-reveal {
                    from {
                        opacity: 0;
                        transform: scale(0.92) translateY(12px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
                @keyframes splash-shimmer {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                @keyframes splash-particle-float {
                    0%, 100% { opacity: 0; transform: translate(0, 0); }
                    50% { opacity: 0.25; transform: translate(6px, -12px); }
                }

                @media (prefers-reduced-motion: reduce) {
                    .splash-gradient-bg,
                    .splash-storm,
                    .splash-mi,
                    .splash-particle {
                        animation: splash-reveal 0.2s ease-out forwards !important;
                    }
                    .splash-mi { animation-delay: 0.05s; }
                    .splash-particle { animation: none !important; opacity: 0.15; }
                }
            `}</style>
        </div>
    );
}
