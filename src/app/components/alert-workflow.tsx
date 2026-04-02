import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Textarea } from '@/app/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { AlertTriangle, CheckCircle, Search as SearchIcon, XCircle, Clock } from 'lucide-react';
import { Alert, Transaction } from '@/lib/mock-data';
import { toast } from 'sonner';

interface AlertWorkflowProps {
  alerts: Alert[];
  setAlerts: React.Dispatch<React.SetStateAction<Alert[]>>;
  transactions: Transaction[];
}

export function AlertWorkflow({ alerts, setAlerts, transactions }: AlertWorkflowProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [remarks, setRemarks] = useState('');
  const [newStatus, setNewStatus] = useState<string>('');

  const filteredAlerts = useMemo(() => {
    if (statusFilter === 'all') return alerts;
    if (statusFilter === 'open') return alerts.filter(a => a.status === 'new' || a.status === 'Fraudulent' || a.status === 'Pending for review');
    if (statusFilter === 'investigating') return alerts.filter(a => a.status === 'reviewing');
    if (statusFilter === 'closed') return alerts.filter(a => a.status === 'resolved' || a.status === 'Genuine');
    return alerts;
  }, [alerts, statusFilter]);

  const summary = useMemo(() => {
    const open = alerts.filter(a => a.status === 'new' || a.status === 'Fraudulent' || a.status === 'Pending for review').length;
    const investigating = alerts.filter(a => a.status === 'reviewing').length;
    const closed = alerts.filter(a => a.status === 'resolved' || a.status === 'Genuine').length;
    return { total: alerts.length, open, investigating, closed };
  }, [alerts]);

  const handleResolve = (alertId: string, status: string, remarksText: string) => {
    if (!status) { toast.error('Please select a resolution status'); return; }
    if (!remarksText.trim()) { toast.error('Please add remarks before resolving'); return; }

    setAlerts(prev => prev.map(a =>
      a.id === alertId ? { ...a, status: status as Alert['status'] } : a
    ));

    // Also send to backend
    const alert = alerts.find(a => a.id === alertId);
    if (alert) {
      fetch(`http://${window.location.hostname}:8001/api/admin/validate?transaction_id=${alert.transaction_id}&decision=${status}&notes=${encodeURIComponent(remarksText)}`, {
        method: 'POST'
      }).catch(() => {});
    }

    toast.success(`Alert ${alertId} resolved as "${status}"`);
    setSelectedAlertId(null);
    setRemarks('');
    setNewStatus('');
  };

  const getStatusIcon = (status: string) => {
    if (status === 'new' || status === 'Fraudulent' || status === 'Pending for review')
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (status === 'reviewing')
      return <Clock className="h-4 w-4 text-amber-500" />;
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'new' || status === 'Fraudulent')
      return <Badge className="bg-red-50 text-red-700 border-red-200">{status}</Badge>;
    if (status === 'Pending for review' || status === 'reviewing')
      return <Badge className="bg-amber-50 text-amber-700 border-amber-200">{status}</Badge>;
    return <Badge className="bg-green-50 text-green-700 border-green-200">{status}</Badge>;
  };

  const getTransaction = (txnId: string) => transactions.find(t => t.id === txnId);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-gray-200 p-4 shadow-sm cursor-pointer hover:bg-gray-50" onClick={() => setStatusFilter('all')}>
          <p className="text-sm text-gray-500">Total Alerts</p>
          <p className="text-3xl font-bold text-gray-800">{summary.total}</p>
        </Card>
        <Card className="bg-red-50 border-red-200 p-4 shadow-sm cursor-pointer hover:bg-red-100" onClick={() => setStatusFilter('open')}>
          <p className="text-sm text-red-600">Open / Active</p>
          <p className="text-3xl font-bold text-red-700">{summary.open}</p>
        </Card>
        <Card className="bg-amber-50 border-amber-200 p-4 shadow-sm cursor-pointer hover:bg-amber-100" onClick={() => setStatusFilter('investigating')}>
          <p className="text-sm text-amber-600">Under Investigation</p>
          <p className="text-3xl font-bold text-amber-700">{summary.investigating}</p>
        </Card>
        <Card className="bg-green-50 border-green-200 p-4 shadow-sm cursor-pointer hover:bg-green-100" onClick={() => setStatusFilter('closed')}>
          <p className="text-sm text-green-600">Closed / Resolved</p>
          <p className="text-3xl font-bold text-green-700">{summary.closed}</p>
        </Card>
      </div>

      {/* Alert List */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Alert Management</h3>
          <Badge variant="outline" className="text-gray-500">
            {filteredAlerts.length} {statusFilter === 'all' ? 'total' : statusFilter}
          </Badge>
        </div>

        <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <SearchIcon className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p>No alerts in this category</p>
            </div>
          ) : (
            filteredAlerts.map(alert => {
              const txn = getTransaction(alert.transaction_id);
              const isSelected = selectedAlertId === alert.id;

              return (
                <div key={alert.id} className={`p-4 ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      {getStatusIcon(alert.status)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm font-medium text-gray-800">{alert.transaction_id}</span>
                          {getStatusBadge(alert.status)}
                          <Badge className={`${alert.risk_level === 'High' ? 'bg-red-50 text-red-700 border-red-200' :
                            alert.risk_level === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-green-50 text-green-700 border-green-200'}`}>
                            {alert.risk_level}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          Store: {alert.shop_id} | Cashier: {alert.cashier_name}
                          {txn && ` | ${'\u20B9'}${txn.transaction_total.toLocaleString('en-IN')}`}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {format(alert.timestamp, 'MMM dd, yyyy HH:mm:ss')}
                          {alert.triggered_rules && alert.triggered_rules.length > 0 && (
                            <span className="ml-2 text-red-500">{alert.triggered_rules.join(', ')}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {(alert.status === 'new' || alert.status === 'Fraudulent' || alert.status === 'Pending for review' || alert.status === 'reviewing') && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-blue-200 text-blue-600 hover:bg-blue-50"
                        onClick={() => setSelectedAlertId(isSelected ? null : alert.id)}
                      >
                        {isSelected ? 'Cancel' : 'Resolve'}
                      </Button>
                    )}
                  </div>

                  {/* Resolution form */}
                  {isSelected && (
                    <div className="mt-4 ml-7 p-4 bg-white rounded-lg border border-gray-200 space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-600 mb-1 block">Resolution Status *</label>
                        <Select value={newStatus} onValueChange={setNewStatus}>
                          <SelectTrigger className="bg-gray-50 border-gray-200">
                            <SelectValue placeholder="Select resolution..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="resolved">Closed - Resolved</SelectItem>
                            <SelectItem value="Genuine">Closed - Genuine (No Fraud)</SelectItem>
                            <SelectItem value="reviewing">Under Investigation</SelectItem>
                            <SelectItem value="Fraudulent">Confirmed Fraudulent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600 mb-1 block">Remarks *</label>
                        <Textarea
                          value={remarks}
                          onChange={e => setRemarks(e.target.value)}
                          placeholder="Add investigation notes or resolution remarks..."
                          className="bg-gray-50 border-gray-200 min-h-[80px]"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => handleResolve(alert.id, newStatus, remarks)}
                        >
                          Submit Resolution
                        </Button>
                        <Button variant="outline" onClick={() => { setSelectedAlertId(null); setRemarks(''); setNewStatus(''); }}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}
