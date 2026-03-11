import { useState, useEffect, useCallback } from 'react';
import { IconPlus } from '@tabler/icons-react';
import { FormattedMessage, useIntl } from 'react-intl';
import toast from 'react-hot-toast';
import {
  fetchStatus,
  fetchRecords,
  fetchUpstream,
  addRecord,
  toggleRecord,
  deleteRecord,
  addUpstream,
  deleteUpstream,
  type StatusInfo,
  type DnsRecord,
} from '../lib/api';
import { StatusCards } from '../components/StatusCards';
import { RecordsTable } from '../components/RecordsTable';
import { UpstreamList } from '../components/UpstreamList';
import { AddRecordModal } from '../components/AddRecordModal';
import { AddUpstreamModal } from '../components/AddUpstreamModal';

export default function DashboardPage() {
  const intl = useIntl();
  const [status, setStatus] = useState<StatusInfo | null>(null);
  const [records, setRecords] = useState<DnsRecord[]>([]);
  const [upstream, setUpstream] = useState<string[]>([]);
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [showAddUpstream, setShowAddUpstream] = useState(false);

  const refreshAll = useCallback(async () => {
    try {
      const [s, r, u] = await Promise.all([
        fetchStatus(),
        fetchRecords(),
        fetchUpstream(),
      ]);
      setStatus(s);
      setRecords(r);
      setUpstream(u);
    } catch (err) {
      console.error('Refresh error:', err);
    }
  }, []);

  useEffect(() => {
    refreshAll();
    const interval = setInterval(refreshAll, 30000);
    return () => clearInterval(interval);
  }, [refreshAll]);

  const handleAddRecord = async (
    hostname: string,
    ip: string,
    type: string,
  ) => {
    try {
      await addRecord(hostname, ip, type);
      toast.success(intl.formatMessage({ id: 'toast.success.recordAdded' }));
      await refreshAll();
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    }
  };

  const handleToggleRecord = async (id: number, enabled: boolean) => {
    try {
      await toggleRecord(id, enabled);
      await refreshAll();
    } catch (err: any) {
      toast.error(err.message);
      await refreshAll();
    }
  };

  const handleDeleteRecord = async (id: number, hostname: string) => {
    if (!confirm(intl.formatMessage({ id: 'confirm.deleteRecord' }, { hostname }))) return;
    try {
      await deleteRecord(id);
      toast.success(intl.formatMessage({ id: 'toast.success.recordDeleted' }));
      await refreshAll();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleAddUpstream = async (server: string) => {
    try {
      await addUpstream(server);
      toast.success(intl.formatMessage({ id: 'toast.success.upstreamAdded' }));
      await refreshAll();
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    }
  };

  const handleDeleteUpstream = async (server: string) => {
    if (!confirm(intl.formatMessage({ id: 'confirm.deleteUpstream' }, { server }))) return;
    try {
      await deleteUpstream(server);
      toast.success(intl.formatMessage({ id: 'toast.success.upstreamDeleted' }));
      await refreshAll();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <>
      <div className="page-header d-print-none">
        <div className="container-xl">
          <div className="row g-2 align-items-center">
            <div className="col">
              <h2 className="page-title"><FormattedMessage id="dashboard.title" /></h2>
              <div className="text-muted mt-1">
                <FormattedMessage id="dashboard.subtitle" />
              </div>
            </div>
            <div className="col-auto ms-auto d-print-none">
              <button
                className="btn btn-primary"
                onClick={() => setShowAddRecord(true)}
              >
                <IconPlus size={16} className="me-1" />
                <FormattedMessage id="dashboard.addRecord" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="page-body">
        <div className="container-xl">
          <StatusCards status={status} />

          <div className="row">
            <div className="col-12">
              <RecordsTable
                records={records}
                onToggle={handleToggleRecord}
                onDelete={handleDeleteRecord}
              />
            </div>
          </div>

          <div className="row mt-4">
            <div className="col-12">
              <UpstreamList
                servers={upstream}
                onDelete={handleDeleteUpstream}
                onAdd={() => setShowAddUpstream(true)}
              />
            </div>
          </div>
        </div>
      </div>

      <AddRecordModal
        open={showAddRecord}
        onClose={() => setShowAddRecord(false)}
        onAdd={handleAddRecord}
      />

      <AddUpstreamModal
        open={showAddUpstream}
        onClose={() => setShowAddUpstream(false)}
        onAdd={handleAddUpstream}
      />
    </>
  );
}
