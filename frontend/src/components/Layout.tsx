import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLocale } from '../contexts/LocaleContext';
import { SettingsModal } from './SettingsModal';
import { SiteFooter } from './SiteFooter';
import { IconMoon, IconSun, IconUser, IconSettings, IconLogout } from '@tabler/icons-react';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import type { ReactNode } from 'react';

export function Layout({ children }: { children: ReactNode }) {
  const intl = useIntl();
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const { locale, setLocale } = useLocale();
  const [showSettings, setShowSettings] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const languages = {
    en: { flag: '🇬🇧', name: 'English' },
    fr: { flag: '🇫🇷', name: 'Français' },
    it: { flag: '🇮🇹', name: 'Italiano' },
  };

  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header className="navbar navbar-expand-md d-print-none">
        <div className="container-xl">
            
          <h1 className="navbar-brand d-none-navbar-horizontal pe-0 pe-md-3">
            <a href="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <img src="/images/logo.png" alt={intl.formatMessage({ id: 'app.title' })} height="32" className="navbar-brand-image" />
              <FormattedMessage id="app.title" />
            </a>
          </h1>

          <div className="navbar-nav flex-row order-md-last">
            <div className={`nav-item dropdown me-2 ${langDropdownOpen ? 'show' : ''}`} style={{ position: 'relative' }}>
              <a
                href="#"
                className="nav-link px-2 d-flex align-items-center"
                onClick={(e) => {
                  e.preventDefault();
                  setLangDropdownOpen(!langDropdownOpen);
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>{languages[locale].flag}</span>
              </a>
              <div
                className={`dropdown-menu dropdown-menu-end ${langDropdownOpen ? 'show' : ''}`}
                style={langDropdownOpen ? { position: 'absolute', top: '100%', right: 0, minWidth: '150px' } : undefined}
              >
                {Object.entries(languages).map(([code, lang]) => (
                  <a
                    key={code}
                    href="#"
                    className={`dropdown-item d-flex align-items-center ${locale === code ? 'active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setLocale(code as 'fr' | 'en');
                      setLangDropdownOpen(false);
                    }}
                  >
                    <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="nav-item me-2">
              <a
                href="#"
                className="nav-link px-0"
                title={intl.formatMessage({ id: 'nav.changeTheme' })}
                onClick={(e) => {
                  e.preventDefault();
                  toggle();
                }}
              >
                {theme === 'light' ? (
                  <IconMoon size={20} />
                ) : (
                  <IconSun size={20} />
                )}
              </a>
            </div>

            <div className={`nav-item dropdown ${dropdownOpen ? 'show' : ''}`} style={{ position: 'relative' }}>
              <a
                href="#"
                className="nav-link d-flex lh-1 text-reset p-0"
                onClick={(e) => {
                  e.preventDefault();
                  setDropdownOpen(!dropdownOpen);
                }}
              >
                <span className="avatar avatar-sm bg-primary text-white">
                  <IconUser size={18} />
                </span>
                <div className="d-none d-xl-block ps-2">
                  <div>{user?.name || user?.email || 'Utilisateur'}</div>
                </div>
              </a>
              <div
                className={`dropdown-menu dropdown-menu-end dropdown-menu-arrow ${dropdownOpen ? 'show' : ''}`}
                style={dropdownOpen ? { position: 'absolute', top: '100%', right: 0 } : undefined}
              >
                <a
                  href="#"
                  className="dropdown-item"
                  onClick={(e) => {
                    e.preventDefault();
                    setDropdownOpen(false);
                    setShowSettings(true);
                  }}
                >
                  <IconSettings size={16} className="me-2" />
                  <FormattedMessage id="nav.settings" />
                </a>
                <div className="dropdown-divider" />
                <a
                  href="#"
                  className="dropdown-item"
                  onClick={(e) => {
                    e.preventDefault();
                    logout();
                  }}
                >
                  <IconLogout size={16} className="me-2" />
                  <FormattedMessage id="nav.logout" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="page-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1 }}>
          {children}
        </div>

        <SiteFooter />
      </div>

      <SettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
      />

      {/* Backdrop to close dropdowns */}
      {(dropdownOpen || langDropdownOpen) && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
          }}
          onClick={() => {
            setDropdownOpen(false);
            setLangDropdownOpen(false);
          }}
        />
      )}
    </div>
  );
}
