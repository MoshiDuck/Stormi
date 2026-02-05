// INFO : menu au survol de l'image de profil (Manage profile, Account, Help center) — cibles tactiles ≥ 44px
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import type { User as UserProfile, StreamingProfile } from '~/types/auth';
import { useTheme } from '~/contexts/ThemeContext';
import { TOUCH_TARGET_MIN } from '~/utils/ui/breakpoints';
import { useLanguage } from '~/contexts/LanguageContext';
import { UserCircle, User, HelpCircle, LogOut } from 'lucide-react';

const CLOSE_DELAY_MS = 220;

interface ProfileDropdownProps {
    user: UserProfile;
    activeProfile?: StreamingProfile | null;
    onLogout: () => void;
    onSwitchProfile?: () => void;
}

export function ProfileDropdown({ user, activeProfile, onLogout, onSwitchProfile }: ProfileDropdownProps) {
    const navigate = useNavigate();
    // Profil actif (principal ou secondaire) : afficher son avatar ou l’initiale de son nom
    const displayName = activeProfile?.name ?? user.name;
    const displayPicture = activeProfile
        ? (activeProfile.avatar_url && String(activeProfile.avatar_url).trim() !== '' ? activeProfile.avatar_url : null)
        : user.picture;

    const handleSwitchProfile = () => {
        setOpen(false);
        onSwitchProfile?.();
        navigate('/select-profile');
    };
    const { theme } = useTheme();
    const { t } = useLanguage();
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearCloseTimeout = () => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }
    };

    const scheduleClose = () => {
        clearCloseTimeout();
        closeTimeoutRef.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            clearCloseTimeout();
        };
    }, []);

    const menuItemClass = 'profile-dropdown-item';

    return (
        <div
            ref={containerRef}
            className="profile-dropdown-root"
            onMouseEnter={() => {
                clearCloseTimeout();
                setOpen(true);
            }}
            onMouseLeave={scheduleClose}
        >
            <button
                type="button"
                aria-haspopup="true"
                aria-expanded={open}
                aria-label={t('profileMenu.account')}
                className="profile-dropdown-trigger"
            >
                {displayPicture ? (
                    <img
                        src={displayPicture}
                        alt=""
                        className="profile-dropdown-avatar-img"
                    />
                ) : (
                    <span className="profile-dropdown-avatar-fallback">
                        {displayName?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                )}
            </button>

            {open && (
                <>
                    <div aria-hidden className="profile-dropdown-bridge" />
                    <div role="menu" className="profile-dropdown-menu">
                        <Link
                            to="/manage-profile"
                            prefetch="intent"
                            role="menuitem"
                            className={menuItemClass}
                        >
                            <UserCircle size={18} strokeWidth={2} aria-hidden />
                            {t('profileMenu.manageProfile')}
                        </Link>
                        <Link
                            to="/profile"
                            prefetch="intent"
                            role="menuitem"
                            className={menuItemClass}
                        >
                            <User size={18} strokeWidth={2} aria-hidden />
                            {t('profileMenu.account')}
                        </Link>
                        {onSwitchProfile && (
                            <button
                                type="button"
                                role="menuitem"
                                onClick={handleSwitchProfile}
                                className={menuItemClass}
                            >
                                <User size={18} strokeWidth={2} aria-hidden />
                                {t('selectProfile.switchProfile')}
                            </button>
                        )}
                        <Link
                            to="/help"
                            prefetch="intent"
                            role="menuitem"
                            className={menuItemClass}
                        >
                            <HelpCircle size={18} strokeWidth={2} aria-hidden />
                            {t('profileMenu.helpCenter')}
                        </Link>
                        <div role="separator" className="profile-dropdown-separator" />
                        <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                                setOpen(false);
                                onLogout();
                            }}
                            className={`${menuItemClass} profile-dropdown-logout`}
                        >
                            <LogOut size={18} strokeWidth={2} aria-hidden />
                            {t('nav.logout')}
                        </button>
                    </div>
                </>
            )}

            <style>{`
                .profile-dropdown-root {
                    position: relative;
                    display: inline-block;
                }

                .profile-dropdown-trigger {
                    padding: 0;
                    min-width: ${TOUCH_TARGET_MIN}px;
                    min-height: ${TOUCH_TARGET_MIN}px;
                    border: none;
                    background: none;
                    cursor: pointer;
                    border-radius: 50%;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    transition: ${theme.transition.normal};
                }

                .profile-dropdown-trigger:hover {
                    transform: scale(1.05);
                }

                .profile-dropdown-trigger:focus-visible {
                    outline: 2px solid ${theme.accent.blue};
                    outline-offset: 3px;
                }

                .profile-dropdown-avatar-img,
                .profile-dropdown-avatar-fallback {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 2px solid ${theme.border.secondary};
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    transition: ${theme.transition.normal};
                }

                .profile-dropdown-trigger:hover .profile-dropdown-avatar-img,
                .profile-dropdown-trigger:hover .profile-dropdown-avatar-fallback {
                    border-color: ${theme.accent.blue};
                    box-shadow: 0 0 0 1px ${theme.accent.blue};
                }

                .profile-dropdown-avatar-fallback {
                    background: ${theme.background.tertiary};
                    color: ${theme.text.primary};
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1rem;
                    font-weight: 600;
                }

                .profile-dropdown-bridge {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    width: 240px;
                    height: 14px;
                }

                .profile-dropdown-menu {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    margin-top: 8px;
                    min-width: 220px;
                    background: ${theme.background.secondary};
                    border-radius: ${theme.radius.large};
                    box-shadow: ${theme.shadow.large};
                    border: 1px solid ${theme.border.primary};
                    padding: 6px 0;
                    z-index: 1000;
                    animation: profileDropdownFade 0.2s ease;
                }

                @keyframes profileDropdownFade {
                    from { opacity: 0; transform: translateY(-4px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .profile-dropdown-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    width: 100%;
                    min-height: ${TOUCH_TARGET_MIN}px;
                    padding: 10px 16px;
                    box-sizing: border-box;
                    color: ${theme.text.primary};
                    text-decoration: none;
                    font-size: 0.9375rem;
                    font-weight: 500;
                    transition: ${theme.transition.fast};
                    border: none;
                    background: none;
                    cursor: pointer;
                    text-align: left;
                    box-sizing: border-box;
                }

                .profile-dropdown-item:hover {
                    background: ${theme.background.tertiary};
                }

                .profile-dropdown-item:focus-visible {
                    outline: none;
                    background: ${theme.background.tertiary};
                }

                .profile-dropdown-logout {
                    color: ${theme.accent.red};
                }

                .profile-dropdown-logout:hover {
                    background: rgba(234, 67, 53, 0.12);
                }

                .profile-dropdown-separator {
                    height: 1px;
                    margin: 6px 12px;
                    background: ${theme.border.primary};
                }
            `}</style>
        </div>
    );
}
