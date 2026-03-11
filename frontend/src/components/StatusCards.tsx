import { IconDatabase, IconCloud, IconBolt } from '@tabler/icons-react';
import { FormattedMessage, useIntl } from 'react-intl';
import type { StatusInfo } from '../lib/api';

interface StatusCardsProps {
  status: StatusInfo | null;
}

export function StatusCards({ status }: StatusCardsProps) {
  const intl = useIntl();
  return (
    <div className="row row-cards mb-3">
      <div className="col-sm-6 col-lg-4">
        <div className="card card-sm">
          <div className="card-body">
            <div className="row align-items-center">
              <div className="col-auto">
                <span className="bg-green text-white avatar">
                  <IconBolt size={20} />
                </span>
              </div>
              <div className="col">
                <div className="fw-medium"><FormattedMessage id="status.dnsmasq" /></div>
                <div className="text-muted">
                  {status ? (
                    status.running ? (
                      <>
                        <span className="status-indicator status-online" />
                        <FormattedMessage id="status.running" />
                      </>
                    ) : (
                      <>
                        <span className="status-indicator status-offline" />
                        <FormattedMessage id="status.stopped" />
                      </>
                    )
                  ) : (
                    intl.formatMessage({ id: 'status.loading' })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-sm-6 col-lg-4">
        <div className="card card-sm">
          <div className="card-body">
            <div className="row align-items-center">
              <div className="col-auto">
                <span className="bg-blue text-white avatar">
                  <IconDatabase size={20} />
                </span>
              </div>
              <div className="col">
                <div className="fw-medium"><FormattedMessage id="status.records" /></div>
                <div className="text-muted">
                  <strong>{status?.records_count ?? 0}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-sm-6 col-lg-4">
        <div className="card card-sm">
          <div className="card-body">
            <div className="row align-items-center">
              <div className="col-auto">
                <span className="bg-cyan text-white avatar">
                  <IconCloud size={20} />
                </span>
              </div>
              <div className="col">
                <div className="fw-medium"><FormattedMessage id="status.upstream" /></div>
                <div className="text-muted">
                  <strong>{status?.upstream_count ?? 0}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
