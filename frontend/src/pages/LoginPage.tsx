import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLocale } from '../contexts/LocaleContext';
import { login as apiLogin, forceChangePassword, setToken, fetchVersion } from '../lib/api';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  IconLogin,
  IconCheck,
  IconMail,
  IconLock,
  IconEye,
  IconEyeOff,
  IconMoon,
  IconSun,
} from '@tabler/icons-react';

export default function LoginPage() {
  const intl = useIntl();
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();
  const { locale, setLocale } = useLocale();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [version, setVersion] = useState('');

  const languages = {
    en: { flag: '🇬🇧', name: 'English' },
    fr: { flag: '🇫🇷', name: 'Français' },
    it: { flag: '🇮🇹', name: 'Italiano' },
  };

  useEffect(() => {
    fetchVersion()
      .then((s) => setVersion(s.version ?? ''))
      .catch(() => {});
  }, []);

  // Force change password flow
  const [mustChange, setMustChange] = useState(false);
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [changeError, setChangeError] = useState('');
  const [changingPwd, setChangingPwd] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !user.mustChangePassword) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError(intl.formatMessage({ id: 'login.error.fillAllFields' }));
      return;
    }

    setLoading(true);
    try {
      const data = await apiLogin(email.trim(), password);

      if (data.user.mustChangePassword) {
        setToken(data.token);
        setMustChange(true);
      } else {
        login(data.token, data.user);
        navigate('/', { replace: true });
      }
    } catch (err: any) {
      setError(err.message || intl.formatMessage({ id: 'login.error.connection' }));
    } finally {
      setLoading(false);
    }
  };

  const handleChangePwd = async (e: FormEvent) => {
    e.preventDefault();
    setChangeError('');

    if (!newPwd || newPwd.length < 6) {
      setChangeError(intl.formatMessage({ id: 'toast.error.passwordLength' }));
      return;
    }
    if (newPwd !== confirmPwd) {
      setChangeError(intl.formatMessage({ id: 'toast.error.passwordMismatch' }));
      return;
    }

    setChangingPwd(true);
    try {
      const data = await forceChangePassword(newPwd);
      if (data.token) {
        setToken(data.token);
      }
      navigate('/', { replace: true });
      window.location.reload();
    } catch (err: any) {
      setChangeError(err.message || intl.formatMessage({ id: 'login.error.generic' }));
    } finally {
      setChangingPwd(false);
    }
  };

  return (
    <div className="page page-center">
      <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <div className={`dropdown ${langDropdownOpen ? 'show' : ''}`} style={{ position: 'relative' }}>
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
        <a
          href="#"
          className="nav-link px-0"
          title={intl.formatMessage({ id: 'nav.changeTheme' })}
          onClick={(e) => {
            e.preventDefault();
            toggleTheme();
          }}
        >
          {theme === 'light' ? <IconMoon size={20} /> : <IconSun size={20} />}
        </a>
        {langDropdownOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 999,
            }}
            onClick={() => setLangDropdownOpen(false)}
          />
        )}
      </div>
      <div className="container container-tight py-4">
        {/* Logo */}
        <div className="text-center mb-4">
          <img src="/images/logo-text-3.png" alt={intl.formatMessage({ id: 'app.title' })} style={{ height: '100px' }} className="mt-2" />
        </div>

        {/* Login Card */}
        {!mustChange && (
          <div className="card card-md">
            <div className="card-body">
              <h2 className="h2 text-center mb-4"><FormattedMessage id="login.title" /></h2>

              {error && (
                <div className="alert alert-danger">{error}</div>
              )}

              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <label className="form-label"><FormattedMessage id="login.email" /></label>
                  <div className="input-group input-group-flat">
                    <span className="input-group-text">
                      <IconMail size={16} />
                    </span>
                    <input
                      type="email"
                      className="form-control"
                      placeholder={intl.formatMessage({ id: 'login.email' })}
                      autoComplete="email"
                      autoFocus
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label"><FormattedMessage id="login.password" /></label>
                  <div className="input-group input-group-flat">
                    <span className="input-group-text">
                      <IconLock size={16} />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control"
                      placeholder={intl.formatMessage({ id: 'login.password' })}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <span className="input-group-text">
                      <a
                        href="#"
                        className="link-secondary"
                        title={intl.formatMessage({ id: showPassword ? 'login.hidePassword' : 'login.showPassword' })}
                        onClick={(e) => {
                          e.preventDefault();
                          setShowPassword(!showPassword);
                        }}
                      >
                        {showPassword ? (
                          <IconEyeOff size={16} />
                        ) : (
                          <IconEye size={16} />
                        )}
                      </a>
                    </span>
                  </div>
                </div>

                <div className="form-footer">
                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1" />
                        <FormattedMessage id="login.submit" />...
                      </>
                    ) : (
                      <>
                        <IconLogin size={16} className="me-1" />
                        <FormattedMessage id="login.submit" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Change Password Card */}
        {mustChange && (
          <div className="card card-md">
            <div className="card-body">
              <h2 className="h2 text-center mb-2">
                <FormattedMessage id="login.changePassword" />
              </h2>
              <p className="text-muted text-center mb-4">
                <FormattedMessage id="login.changePassword" />
              </p>

              {changeError && (
                <div className="alert alert-danger">{changeError}</div>
              )}

              <form onSubmit={handleChangePwd}>
                <div className="mb-3">
                  <label className="form-label"><FormattedMessage id="login.newPassword" /></label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder={intl.formatMessage({ id: 'login.newPassword' })}
                    autoComplete="new-password"
                    autoFocus
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    <FormattedMessage id="login.confirmPassword" />
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder={intl.formatMessage({ id: 'login.confirmPassword' })}
                    autoComplete="new-password"
                    value={confirmPwd}
                    onChange={(e) => setConfirmPwd(e.target.value)}
                  />
                </div>

                <div className="form-footer">
                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={changingPwd}
                  >
                    {changingPwd ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1" />
                        <FormattedMessage id="login.changePasswordSubmit" />...
                      </>
                    ) : (
                      <>
                        <IconCheck size={16} className="me-1" />
                        <FormattedMessage id="login.changePasswordSubmit" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Version */}
        {version && (
          <div className="text-center mt-3">
            <a
              href={`https://github.com/Zephyris-Pro/dnsmasq-manager/releases/tag/v${version}`}
              className="link-secondary text-muted"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: '0.875rem' }}
            >
              <FormattedMessage id="footer.version" values={{ version }} />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
