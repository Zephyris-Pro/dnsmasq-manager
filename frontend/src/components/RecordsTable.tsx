import { IconWorld, IconTrash, IconDatabaseOff } from '@tabler/icons-react';
import { FormattedMessage, useIntl } from 'react-intl';
import type { DnsRecord } from '../lib/api';

interface RecordsTableProps {
  records: DnsRecord[];
  onToggle: (id: number, enabled: boolean) => void;
  onDelete: (id: number, hostname: string) => void;
}

export function RecordsTable({ records, onToggle, onDelete }: RecordsTableProps) {
  const intl = useIntl();
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title"><FormattedMessage id="records.title" /></h3>
      </div>
      <div className="table-responsive">
        <table className="table table-vcenter card-table table-striped">
          <thead>
            <tr>
              <th><FormattedMessage id="records.hostname" /></th>
              <th><FormattedMessage id="records.target" /></th>
              <th><FormattedMessage id="records.type" /></th>
              <th><FormattedMessage id="records.active" /></th>
              <th className="text-end"><FormattedMessage id="records.actions" /></th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-muted">
                  <div className="my-3">
                    <IconDatabaseOff size={32} className="mb-2" />
                    <p><FormattedMessage id="records.empty" /></p>
                  </div>
                </td>
              </tr>
            ) : (
              records.map((r) => (
                <tr key={r.id} className={r.enabled ? '' : 'text-muted'}>
                  <td>
                    <div className="d-flex align-items-center">
                      <IconWorld size={16} className="text-muted me-2" />
                      <a className="text-reset domain-name" href={`http://${r.hostname}`} target="_blank" rel="noopener noreferrer"><strong>{r.hostname}</strong></a>
                    </div>
                  </td>
                  <td>
                    <code className="text-primary">{r.ip}</code>
                  </td>
                  <td>
                    <span className={`badge ${r.type === 'CNAME' ? 'bg-purple-lt' : r.type === 'TXT' ? 'bg-yellow-lt' : 'bg-blue-lt'}`}>{r.type}</span>
                  </td>
                  <td>
                    <label className="form-check form-switch m-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={r.enabled}
                        onChange={(e) => onToggle(r.id, e.target.checked)}
                      />
                    </label>
                  </td>
                  <td className="text-end">
                    <button
                      className="btn btn-sm btn-ghost-danger"
                      title={intl.formatMessage({ id: 'records.delete' })}
                      onClick={() => onDelete(r.id, r.hostname)}
                    >
                      <IconTrash size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
