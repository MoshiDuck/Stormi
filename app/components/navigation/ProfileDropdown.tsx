// INFO : menu au survol de l'image de profil (Manage profile, Account, Help center)
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router';
import type { User } from '~/types/auth';
import { darkTheme } from '~/utils/ui/theme';
import { useLanguage } from '~/contexts/LanguageContext';

const CLOSE_DELAY_MS = 220;

interface ProfileDropdownProps {
    user: User;
    onLogout: () => void;
}

export function ProfileDropdown({ user, onLogout }: ProfileDropdownProps) {
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

    return (
        <div
            ref={containerRef}
            style={{ position: 'relative', display: 'inline-block' }}
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
                style={{
                    padding: 0,
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    borderRadius: '50%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {user.picture ? (
                    <img
                        src={user.picture}
                        alt=""
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            border: `2px solid ${darkTheme.accent.blue}`,
                            objectFit: 'cover',
                        }}
                    />
                ) : (
                    <span
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            backgroundColor: darkTheme.background.tertiary,
                            color: darkTheme.text.primary,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 16,
                            fontWeight: 600,
                        }}
                    >
                        {user.name?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                )}
            </button>

            {open && (
                <>
                    {/* Passerelle invisible : garde le survol entre l'avatar et le menu */}
                    <div
                        aria-hidden
                        style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            width: 220,
                            height: 12,
                            marginTop: 0,
                        }}
                    />
                    <div
                        role="menu"
                        style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            marginTop: 2,
                            minWidth: 200,
                            backgroundColor: darkTheme.background.secondary,
                            borderRadius: darkTheme.radius.medium,
                            boxShadow: darkTheme.shadow.medium,
                            border: `1px solid ${darkTheme.border.primary}`,
                            padding: '8px 0',
                            zIndex: 1000,
                        }}
                    >
                    <Link
                        to="/manage-profile"
                        prefetch="intent"
                        role="menuitem"
                        style={{
                            display: 'block',
                            padding: '10px 16px',
                            color: darkTheme.text.primary,
                            textDecoration: 'none',
                            fontSize: 14,
                            fontWeight: 500,
                            transition: darkTheme.transition.fast,
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = darkTheme.background.tertiary;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                    >
                        {t('profileMenu.manageProfile')}
                    </Link>
                    <Link
                        to="/profile"
                        prefetch="intent"
                        role="menuitem"
                        style={{
                            display: 'block',
                            padding: '10px 16px',
                            color: darkTheme.text.primary,
                            textDecoration: 'none',
                            fontSize: 14,
                            fontWeight: 500,
                            transition: darkTheme.transition.fast,
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = darkTheme.background.tertiary;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                    >
                        {t('profileMenu.account')}
                    </Link>
                    <Link
                        to="/help"
                        prefetch="intent"
                        role="menuitem"
                        style={{
                            display: 'block',
                            padding: '10px 16px',
                            color: darkTheme.text.primary,
                            textDecoration: 'none',
                            fontSize: 14,
                            fontWeight: 500,
                            transition: darkTheme.transition.fast,
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = darkTheme.background.tertiary;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                    >
                        {t('profileMenu.helpCenter')}
                    </Link>
                    <div
                        role="separator"
                        style={{
                            height: 1,
                            margin: '8px 0',
                            backgroundColor: darkTheme.border.primary,
                        }}
                    />
                    <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                            setOpen(false);
                            onLogout();
                        }}
                        style={{
                            display: 'block',
                            width: '100%',
                            padding: '10px 16px',
                            color: darkTheme.accent.red,
                            textDecoration: 'none',
                            fontSize: 14,
                            fontWeight: 500,
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: darkTheme.transition.fast,
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = darkTheme.background.tertiary;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                    >
                        {t('nav.logout')}
                    </button>
                    </div>
                </>
            )}
        </div>
    );
}
