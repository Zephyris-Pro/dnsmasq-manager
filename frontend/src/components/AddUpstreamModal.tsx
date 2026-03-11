import { useState, type FormEvent } from 'react';
import { IconCheck } from '@tabler/icons-react';
import { FormattedMessage, useIntl } from 'react-intl';

interface AddUpstreamModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (server: string) => Promise<void>;
}

export function AddUpstreamModal({ open, onClose, onAdd }: AddUpstreamModalProps) {
  const intl = useIntl();
  const [server, setServer] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!server.trim()) return;

    setLoading(true);
    try {
      await onAdd(server.trim());
      setServer('');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setServer('');
    onClose();
  };

  if (!open) return null;

  return (
    <>
      <div className="modal modal-blur fade show d-block" tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <form onSubmit={handleSubmit}>
              <div className="modal-header">
                <h5 className="modal-title">
                  <FormattedMessage id="modal.addUpstream.title" />
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleClose}
                />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label required">
                    <FormattedMessage id="modal.addUpstream.server" />
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={intl.formatMessage({ id: 'modal.addUpstream.serverPlaceholder' })}
                    autoComplete="off"
                    autoFocus
                    value={server}
                    onChange={(e) => setServer(e.target.value)}
                  />
                  <small className="form-hint">
                    <FormattedMessage id="modal.addUpstream.serverHint" />
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn"
                  onClick={handleClose}
                >
                  <FormattedMessage id="modal.addUpstream.cancel" />
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading || !server.trim()}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" />
                      <FormattedMessage id="modal.addUpstream.adding" />
                    </>
                  ) : (
                    <>
                      <IconCheck size={16} className="me-1" />
                      <FormattedMessage id="modal.addUpstream.add" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" onClick={handleClose} />
    </>
  );
}
