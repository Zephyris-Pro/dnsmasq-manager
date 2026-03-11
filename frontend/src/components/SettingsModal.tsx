import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { changePassword, updateProfile, setToken } from '../lib/api';
import { FormattedMessage, useIntl } from 'react-intl';
import toast from 'react-hot-toast';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const intl = useIntl();
  const { user, refreshUser } = useAuth();

  // Profile
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (open && user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [open, user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error(intl.formatMessage({ id: 'toast.error.nameEmailRequired' }));
      return;
    }
    setProfileLoading(true);
    try {
      const res = await updateProfile(name.trim(), email.trim());
      if (res.token) setToken(res.token);
      await refreshUser();
      toast.success(intl.formatMessage({ id: 'toast.success.profileUpdated' }));
    } catch (err: any) {
      toast.error(err.message || intl.formatMessage({ id: 'toast.error.requiredFields' }));
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error(intl.formatMessage({ id: 'toast.error.requiredFields' }));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(intl.formatMessage({ id: 'toast.error.passwordMismatch' }));
      return;
    }
    if (newPassword.length < 6) {
      toast.error(intl.formatMessage({ id: 'toast.error.passwordLength' }));
      return;
    }
    setPasswordLoading(true);
    try {
      const res = await changePassword(currentPassword, newPassword);
      if (res.token) setToken(res.token);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success(intl.formatMessage({ id: 'toast.success.passwordChanged' }));
    } catch (err: any) {
      toast.error(err.message || intl.formatMessage({ id: 'toast.error.requiredFields' }));
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  };

  if (!open) return null;

  return (
    <>
      <div className="modal modal-blur show d-block" tabIndex={-1}>
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title"><FormattedMessage id="modal.settings.title" /></h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleClose}
                aria-label={intl.formatMessage({ id: 'modal.settings.close' })}
              />
            </div>
            <div className="modal-body">
              
              <h3 className="mb-3"><FormattedMessage id="modal.settings.profile" /></h3>
              <form onSubmit={handleProfileSubmit}>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label"><FormattedMessage id="modal.settings.name" /></label>
                    <input
                      type="text"
                      className="form-control"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={intl.formatMessage({ id: 'modal.settings.namePlaceholder' })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label"><FormattedMessage id="modal.settings.email" /></label>
                    <input
                      type="email"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={intl.formatMessage({ id: 'modal.settings.emailPlaceholder' })}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={profileLoading}
                >
                  {profileLoading ? <FormattedMessage id="modal.settings.saving" /> : <FormattedMessage id="modal.settings.saveProfile" />}
                </button>
              </form>

              <hr className="my-4" />

              <h3 className="mb-3"><FormattedMessage id="modal.settings.changePassword" /></h3>
              <form onSubmit={handlePasswordSubmit}>
                <div className="mb-3">
                  <label className="form-label"><FormattedMessage id="modal.settings.currentPassword" /></label>
                  <input
                    type="password"
                    className="form-control"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label"><FormattedMessage id="modal.settings.newPassword" /></label>
                    <input
                      type="password"
                      className="form-control"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label"><FormattedMessage id="modal.settings.confirmPassword" /></label>
                    <input
                      type="password"
                      className="form-control"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={passwordLoading}
                >
                  {passwordLoading ? <FormattedMessage id="modal.settings.changing" /> : <FormattedMessage id="modal.settings.changePasswordSubmit" />}
                </button>
              </form>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClose}
              >
                <FormattedMessage id="modal.settings.close" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop show" onClick={handleClose} />
    </>
  );
}
