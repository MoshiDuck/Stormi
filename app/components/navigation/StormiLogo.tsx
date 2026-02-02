// INFO : Logotype produit « STORMI » — wordmark majuscules (nav/header), style Netflix.
// Usage : <StormiLogo theme="dark" /> dans un <Link to="…">. Focus visible inclus.

import React from 'react';

const SVG_VIEWBOX = '0 0 140 28';
const SVG_ID = 'stormi-logo-svg';

export type StormiLogoTheme = 'dark' | 'light';

interface StormiLogoProps {
    theme?: StormiLogoTheme;
    className?: string;
}

const FONT_STACK =
    'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export function StormiLogo({ theme = 'dark', className = '' }: StormiLogoProps) {
    const rootClass = ['stormi-logo', `stormi-logo--${theme}`, className].filter(Boolean).join(' ');

    return (
        <span className={rootClass} aria-hidden>
            <svg
                viewBox={SVG_VIEWBOX}
                width="auto"
                height="1.25rem"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                aria-label="STORMI"
                className="stormi-logo__svg"
            >
                <defs>
                    <linearGradient
                        id={`${SVG_ID}-gold`}
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                    >
                        <stop offset="0%" stopColor="#fef08a" />
                        <stop offset="50%" stopColor="#fde047" />
                        <stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                    <linearGradient
                        id={`${SVG_ID}-gold-light`}
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                    >
                        <stop offset="0%" stopColor="#b45309" />
                        <stop offset="50%" stopColor="#d97706" />
                        <stop offset="100%" stopColor="#92400e" />
                    </linearGradient>
                </defs>

                {/* Wordmark majuscules : STOR + MI, style Netflix */}
                <text
                    x="0"
                    y="20"
                    fontFamily={FONT_STACK}
                    fontSize="20"
                    fontWeight="800"
                    letterSpacing="0.12em"
                    className="stormi-logo__wordmark"
                >
                    <tspan className="stormi-logo__stor">STOR</tspan>
                    <tspan className="stormi-logo__mi">MI</tspan>
                </text>
            </svg>

            <style>{stormiLogoStyles}</style>
        </span>
    );
}

const stormiLogoStyles = `
.stormi-logo {
    display: inline-flex;
    align-items: center;
    transition: opacity 0.15s ease, transform 0.15s ease;
}
.stormi-logo__svg {
    height: 1.25rem;
    width: auto;
    display: block;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

.stormi-logo--dark .stormi-logo__stor { fill: #ffffff; }
.stormi-logo--dark .stormi-logo__mi { fill: url(#stormi-logo-svg-gold); }
.stormi-logo--light .stormi-logo__stor { fill: #0f0f0f; }
.stormi-logo--light .stormi-logo__mi { fill: url(#stormi-logo-svg-gold-light); }

a:hover .stormi-logo { opacity: 0.92; }
a:active .stormi-logo { opacity: 0.88; }

a:focus-visible .stormi-logo,
.stormi-logo:focus-visible {
    outline: 2px solid #4285f4;
    outline-offset: 3px;
    border-radius: 4px;
}
`;
