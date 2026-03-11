import { IconServer, IconTrash, IconCloudOff, IconPlus } from '@tabler/icons-react';
import { FormattedMessage, useIntl } from 'react-intl';

interface UpstreamListProps {
  servers: string[];
  onDelete: (server: string) => void;
  onAdd: () => void;
}

export function UpstreamList({ servers, onDelete, onAdd }: UpstreamListProps) {
  const intl = useIntl();
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title"><FormattedMessage id="upstream.title" /></h3>
        <div className="card-actions">
          <button className="btn btn-primary btn-sm" onClick={onAdd}>
            <IconPlus size={16} className="me-1" />
            <FormattedMessage id="dashboard.addUpstream" />
          </button>
        </div>
      </div>
      <div className="list-group list-group-flush">
        {servers.length === 0 ? (
          <div className="list-group-item text-muted text-center py-4">
            <IconCloudOff size={32} className="mb-2" />
            <p><FormattedMessage id="upstream.empty" /></p>
          </div>
        ) : (
          servers.map((s) => (
            <div key={s} className="list-group-item">
              <div className="row align-items-center">
                <div className="col">
                  <IconServer size={16} className="text-muted me-2" />
                  <code className="text-primary">{s}</code>
                </div>
                <div className="col-auto">
                  <button
                    className="btn btn-sm btn-ghost-danger"
                    title={intl.formatMessage({ id: 'upstream.delete' })}
                    onClick={() => onDelete(s)}
                  >
                    <IconTrash size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
