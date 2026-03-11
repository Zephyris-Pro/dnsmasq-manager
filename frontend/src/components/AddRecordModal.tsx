import { useState, type FormEvent } from 'react';
import { IconCheck } from '@tabler/icons-react';
import { FormattedMessage, useIntl } from 'react-intl';

interface AddRecordModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (hostname: string, ip: string, type: string) => Promise<void>;
}

export function AddRecordModal({ open, onClose, onAdd }: AddRecordModalProps) {
  const intl = useIntl();
  const [hostname, setHostname] = useState('');
  const [ip, setIp] = useState('');
  const [type, setType] = useState('A');
  const [loading, setLoading] = useState(false);

  const isCname = type === 'CNAME';
  const isTxt = type === 'TXT';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!hostname.trim() || !ip.trim()) return;

    setLoading(true);
    try {
      await onAdd(hostname.trim(), ip.trim(), type);
      setHostname('');
      setIp('');
      setType('A');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setHostname('');
    setIp('');
    setType('A');
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
                  <FormattedMessage id="modal.addRecord.title" />
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleClose}
                />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label required"><FormattedMessage id="modal.addRecord.hostname" /></label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={intl.formatMessage({ id: 'modal.addRecord.hostnamePlaceholder' })}
                    autoComplete="off"
                    autoFocus
                    value={hostname}
                    onChange={(e) => setHostname(e.target.value)}
                  />
                  <small className="form-hint">
                    <FormattedMessage id="modal.addRecord.hostnameHint" />
                  </small>
                </div>
                <div className="mb-3">
                  <label className="form-label"><FormattedMessage id="modal.addRecord.type" /></label>
                  <select
                    className="form-select"
                    value={type}
                    onChange={(e) => {
                      setType(e.target.value);
                      setIp('');
                    }}
                  >
                    <option value="A">A (IPv4)</option>
                    <option value="AAAA">AAAA (IPv6)</option>
                    <option value="CNAME">CNAME (Alias)</option>
                    <option value="TXT">TXT (Texte)</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label required">
                    {isCname ? <FormattedMessage id="modal.addRecord.cname" /> : isTxt ? <FormattedMessage id="modal.addRecord.txt" /> : <FormattedMessage id="modal.addRecord.ipAddress" />}
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={intl.formatMessage({ id: isCname ? 'modal.addRecord.cnamePlaceholder' : isTxt ? 'modal.addRecord.txtPlaceholder' : 'modal.addRecord.ipPlaceholder' })}
                    autoComplete="off"
                    value={ip}
                    onChange={(e) => setIp(e.target.value)}
                  />
                  <small className="form-hint">
                    <FormattedMessage id={isCname ? 'modal.addRecord.cnameHint' : isTxt ? 'modal.addRecord.txtHint' : 'modal.addRecord.ipHint'} />
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn"
                  onClick={handleClose}
                >
                  <FormattedMessage id="modal.addRecord.cancel" />
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading || !hostname.trim() || !ip.trim()}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" />
                      <FormattedMessage id="modal.addRecord.adding" />
                    </>
                  ) : (
                    <>
                      <IconCheck size={16} className="me-1" />
                      <FormattedMessage id="modal.addRecord.add" />
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
