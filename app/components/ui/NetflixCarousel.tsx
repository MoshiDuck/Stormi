// INFO : app/components/ui/NetflixCarousel.tsx
// Composant Carrousel style Netflix réutilisable (responsive : padding réduit sur mobile)

import React, { useState, useRef } from 'react';
import { useLanguage } from '~/contexts/LanguageContext';
import { useBreakpoint } from '~/hooks/useBreakpoint';

const netflixTheme = {
    text: {
        primary: '#ffffff',
        secondary: '#d2d2d2'
    },
    bg: {
        primary: '#141414'
    }
};

interface NetflixCarouselProps {
    title: string;
    icon?: string;
    children: React.ReactNode;
}

export const NetflixCarousel = ({ title, icon, children }: NetflixCarouselProps) => {
    const { t } = useLanguage();
    const breakpoint = useBreakpoint();
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);
    const isPhone = breakpoint === 'phone';
    const edgePadding = isPhone ? 12 : 40;
    const arrowWidth = isPhone ? 36 : 50;
    const marginBottom = isPhone ? 28 : 50;

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = scrollRef.current.clientWidth * 0.8;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const handleScroll = () => {
        if (scrollRef.current) {
            setShowLeftArrow(scrollRef.current.scrollLeft > 0);
            setShowRightArrow(
                scrollRef.current.scrollLeft < scrollRef.current.scrollWidth - scrollRef.current.clientWidth - 10
            );
        }
    };

    return (
        <div style={{ marginBottom: marginBottom, position: 'relative', minWidth: 0 }}>
            <h2 style={{
                fontSize: isPhone ? 18 : 'clamp(18px, 2vw, 24px)',
                fontWeight: 800,
                color: netflixTheme.text.primary,
                marginBottom: isPhone ? 12 : 20,
                marginLeft: edgePadding,
                marginRight: edgePadding,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                letterSpacing: '-0.02em',
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
            }}>
                {icon && <span style={{ fontSize: isPhone ? 20 : 24 }}>{icon}</span>} <span style={{ minWidth: 0 }}>{title}</span>
            </h2>
            
            <div style={{ position: 'relative', overflow: 'visible', minWidth: 0 }}>
                {/* Flèche gauche */}
                {showLeftArrow && (
                    <button
                        onClick={() => scroll('left')}
                        aria-label={t('carousel.scrollLeft')}
                        style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: arrowWidth,
                            background: 'linear-gradient(to right, rgba(20,20,20,0.95) 0%, rgba(20,20,20,0.7) 50%, transparent 100%)',
                            border: 'none',
                            cursor: 'pointer',
                            zIndex: 10,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontSize: 'clamp(32px, 4vw, 48px)',
                            opacity: 0,
                            transition: 'opacity 0.3s ease',
                            backdropFilter: 'blur(2px)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                        className="carousel-arrow"
                    >
                        ‹
                    </button>
                )}
                
                {/* Conteneur scrollable */}
                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    onMouseEnter={() => {
                        const arrows = document.querySelectorAll('.carousel-arrow');
                        arrows.forEach(arrow => (arrow as HTMLElement).style.opacity = '0.8');
                    }}
                    onMouseLeave={() => {
                        const arrows = document.querySelectorAll('.carousel-arrow');
                        arrows.forEach(arrow => (arrow as HTMLElement).style.opacity = '0');
                    }}
                    style={{
                        display: 'flex',
                        gap: isPhone ? 8 : 10,
                        overflowX: 'auto',
                        overflowY: 'hidden',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        paddingLeft: edgePadding,
                        paddingRight: edgePadding,
                        paddingTop: isPhone ? 40 : 60,
                        paddingBottom: isPhone ? 40 : 60,
                        scrollBehavior: 'smooth',
                        WebkitOverflowScrolling: 'touch',
                    }}
                >
                    {children}
                </div>
                
                {/* Flèche droite moderne */}
                {showRightArrow && (
                    <button
                        onClick={() => scroll('right')}
                        aria-label={t('carousel.scrollRight')}
                        style={{
                            position: 'absolute',
                            right: 0,
                            top: 0,
                            bottom: 0,
                            width: arrowWidth,
                            background: 'linear-gradient(to left, rgba(20,20,20,0.95) 0%, rgba(20,20,20,0.7) 50%, transparent 100%)',
                            border: 'none',
                            cursor: 'pointer',
                            zIndex: 10,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontSize: 'clamp(32px, 4vw, 48px)',
                            opacity: 0,
                            transition: 'opacity 0.3s ease',
                            backdropFilter: 'blur(2px)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                        className="carousel-arrow"
                    >
                        ›
                    </button>
                )}
            </div>
        </div>
    );
};
