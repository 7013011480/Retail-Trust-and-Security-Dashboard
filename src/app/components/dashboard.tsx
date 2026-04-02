import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  LayoutDashboard,
  Shield,
  Search,
  Filter,
  RefreshCw,
  Activity,
  BarChart3,
  Users,
  Map as MapIcon,
  ShieldAlert,
  AlertTriangle,
  Clock,
  Download,
  Settings,
  Bell,
} from 'lucide-react';
import { TransactionTable } from '@/app/components/transaction-table';
import { TransactionDetailDrawer } from '@/app/components/transaction-detail-drawer';
import { StreamViewer } from '@/app/components/stream-viewer';
import { AnalyticsView } from '@/app/components/analytics-view';
import { EmployeeScorecardView } from '@/app/components/employee-scorecard-view';
import { HeatmapView } from '@/app/components/heatmap-view';
import { SettingsPanel } from '@/app/components/settings-panel';
import { AlertWorkflow } from '@/app/components/alert-workflow';
import {
  loadHistoricalData,
  generateAlertsFromTransactions,
  Transaction,
  Alert,
} from '@/lib/mock-data';
import { toast } from 'sonner';
import { subDays, startOfDay } from 'date-fns';

function AnimatedCount({ value }: { value: number }) {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    if (displayed === value) return;
    const diff = value - displayed;
    const step = Math.max(1, Math.abs(Math.ceil(diff / 15)));
    const timer = setTimeout(() => {
      setDisplayed(prev => diff > 0 ? Math.min(prev + step, value) : Math.max(prev - step, value));
    }, 30);
    return () => clearTimeout(timer);
  }, [value, displayed]);
  return <>{displayed}</>;
}

function exportToCSV(transactions: Transaction[]) {
  const headers = ['Transaction ID', 'Shop ID', 'Store Name', 'POS ID', 'Cashier Name', 'Timestamp', 'Total (\u20B9)', 'Risk Level', 'Status', 'Triggered Rules'];
  const rows = transactions.map(t => [
    t.id, t.shop_id, t.shop_name || '', t.pos_id, t.cashier_name,
    t.timestamp.toISOString(), t.transaction_total.toFixed(2),
    t.risk_level, t.status || 'pending', (t.triggered_rules || []).join('; '),
  ]);
  const csv = [headers, ...rows].map(row =>
    row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  ).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `transactions_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

const NAV_ITEMS = [
  { id: 'transactions', label: 'Transactions', icon: LayoutDashboard },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'alerts', label: 'Alerts', icon: Bell },
  { id: 'scorecard', label: 'Store Scorecard', icon: Users },
  { id: 'heatmap', label: 'Store Overview', icon: MapIcon },
  { id: 'streams', label: 'Stream Viewer', icon: Activity },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [billsMap, setBillsMap] = useState<Record<string, any>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('transactions');
  const [activeFilter, setActiveFilter] = useState<'all' | 'high' | 'medium' | 'pending'>('all');
  const [timeRange, setTimeRange] = useState<string>('all');
  const [storeFilter, setStoreFilter] = useState<string>('all');
  const [storeNames, setStoreNames] = useState<Record<string, string>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [rawVasData, setRawVasData] = useState<any[]>([]);
  const [rawPosData, setRawPosData] = useState<any[]>([]);
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleRowClick = useCallback((transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDrawerOpen(true);
  }, []);

  const loadFromLocal = useCallback(async () => {
    try {
      const base = `http://${window.location.hostname}:8001`;
      const [txnRes, storesRes] = await Promise.all([
        fetch(`${base}/api/transactions`),
        fetch(`${base}/api/stores`).catch(() => null),
      ]);
      const data = await txnRes.json();
      const names: Record<string, string> = {};
      if (storesRes?.ok) {
        const stores = await storesRes.json();
        stores.forEach((s: any) => { names[s.cin] = s.name; });
        setStoreNames(names);
      }
      const txns = (data?.transactions || []).map((t: any) => ({
        ...t,
        timestamp: new Date(t.timestamp),
        shop_name: t.shop_name || names[t.shop_id] || t.shop_id,
      }));
      setTransactions(txns);
      setBillsMap(data?.bills_map || {});
      setAlerts(generateAlertsFromTransactions(txns));
    } catch (e) {
      console.error('Failed to load from local:', e);
    }
  }, []);

  const reloadHistoricalData = useCallback(async () => {
    await loadFromLocal();
    const base = `http://${window.location.hostname}:8001`;
    fetch(`${base}/api/history?days=10`)
      .then(() => loadFromLocal())
      .catch(() => {});
  }, [loadFromLocal]);

  const reloadAfterConfigChange = useCallback(async () => {
    try {
      const base = `http://${window.location.hostname}:8001`;
      await fetch(`${base}/api/history?days=10`);
      await loadFromLocal();
      toast.success('Data re-classified with new thresholds');
    } catch {
      toast.error('Failed to reload data');
    }
  }, [loadFromLocal]);

  useEffect(() => {
    fetch(`http://${window.location.hostname}:8001/api/stores`)
      .then(r => r.json())
      .then((stores: any[]) => {
        const map: Record<string, string> = {};
        stores.forEach(s => { map[s.cin] = s.name; });
        setStoreNames(map);
      })
      .catch(() => {});
  }, []);

  useEffect(() => { reloadHistoricalData(); }, [reloadHistoricalData]);

  useEffect(() => {
    const ws = new WebSocket(`ws://${window.location.hostname}:8001/ws`);
    ws.onopen = () => { setIsConnected(true); toast.success('Connected to Live Service'); };
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'NEW_TRANSACTION') {
          setTransactions(prev => [{ ...message.data, timestamp: new Date(message.data.timestamp) }, ...prev]);
        } else if (message.type === 'NEW_ALERT') {
          setAlerts(prev => [{ ...message.data, timestamp: new Date(message.data.timestamp) }, ...prev]);
        } else if (message.type === 'TRANSACTION_UPDATE') {
          const { id, status, notes } = message.data;
          setTransactions(prev => prev.map(t => t.id === id ? { ...t, status, notes } : t));
          setAlerts(prev => prev.map(a => a.transaction_id === id ? { ...a, status: 'resolved' } : a));
        } else if (message.type === 'RAW_VAS_DATA') { setRawVasData(message.data); }
        else if (message.type === 'RAW_POS_DATA') { setRawPosData(message.data); }
      } catch (error) { console.error('Error parsing WebSocket message:', error); }
    };
    ws.onclose = () => { setIsConnected(false); };
    return () => { ws.close(); };
  }, []);

  const handleFilterChange = (filter: 'all' | 'high' | 'medium' | 'pending') => { setActiveFilter(filter); };

  const timeFilteredTransactions = useMemo(() => {
    if (timeRange === 'all') return transactions;
    const now = new Date();
    let cutoff: Date;
    switch (timeRange) {
      case 'today': cutoff = startOfDay(now); break;
      case '2days': cutoff = startOfDay(subDays(now, 2)); break;
      case 'week': cutoff = startOfDay(subDays(now, 7)); break;
      default: return transactions;
    }
    return transactions.filter(t => t.timestamp >= cutoff);
  }, [transactions, timeRange]);

  const uniqueStores = useMemo(() => {
    const map = new Map<string, string>();
    transactions.forEach(t => {
      if (!map.has(t.shop_id)) map.set(t.shop_id, t.shop_name || storeNames[t.shop_id] || t.shop_id);
    });
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [transactions, storeNames]);

  const filteredTransactions = useMemo(() => {
    const search = searchTerm.toLowerCase();
    let filtered = timeFilteredTransactions;
    if (search) {
      filtered = filtered.filter(t =>
        t.id.toLowerCase().includes(search) || t.cashier_name.toLowerCase().includes(search) ||
        t.shop_id.toLowerCase().includes(search) || (t.shop_name || '').toLowerCase().includes(search)
      );
    }
    if (storeFilter !== 'all') filtered = filtered.filter(t => t.shop_id === storeFilter);
    if (activeFilter === 'high') filtered = filtered.filter(t => t.risk_level === 'High');
    else if (activeFilter === 'medium') filtered = filtered.filter(t => t.risk_level === 'Medium');
    else if (activeFilter === 'pending') filtered = filtered.filter(t => !t.status || t.status === 'pending');
    const min = parseFloat(minAmount); const max = parseFloat(maxAmount);
    if (!isNaN(min)) filtered = filtered.filter(t => t.transaction_total >= min);
    if (!isNaN(max)) filtered = filtered.filter(t => t.transaction_total <= max);
    return filtered;
  }, [timeFilteredTransactions, searchTerm, storeFilter, activeFilter, minAmount, maxAmount]);

  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;
  const paginatedTransactions = useMemo(() => filteredTransactions.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE), [filteredTransactions, page]);
  const totalPages = Math.ceil(filteredTransactions.length / PAGE_SIZE);
  useEffect(() => { setPage(0); }, [searchTerm, storeFilter, activeFilter, timeRange, minAmount, maxAmount]);

  const highCount = timeFilteredTransactions.filter(t => t.risk_level === 'High').length;
  const mediumCount = timeFilteredTransactions.filter(t => t.risk_level === 'Medium').length;
  const openAlertCount = alerts.filter(a => a.status === 'new' || a.status === 'Fraudulent' || a.status === 'Pending for review').length;

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-56 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        {/* Logo */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-600 rounded-lg">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-800">Retail Trust</h1>
              <p className="text-[10px] text-gray-400">Security Dashboard</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                {item.label}
                {item.id === 'alerts' && openAlertCount > 0 && (
                  <Badge className="ml-auto bg-red-100 text-red-700 border-red-200 text-[10px] px-1.5 py-0">
                    {openAlertCount}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>

        {/* Connection Status */}
        <div className="px-3 py-3 border-t border-gray-100">
          <div className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs ${isConnected ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            <div className={`h-1.5 w-1.5 rounded-full animate-pulse ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            {isConnected ? 'System Active' : 'Disconnected'}
          </div>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar with Stats */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 px-5 py-2.5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <Card className={`bg-white/10 backdrop-blur-sm border-white/20 px-3 py-1.5 cursor-pointer transition-all hover:bg-white/20 ${activeFilter === 'all' ? 'ring-1 ring-white/50' : ''}`} onClick={() => handleFilterChange('all')}>
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="h-3.5 w-3.5 text-blue-200" />
                  <span className="text-xs text-blue-100">Transactions</span>
                  <span className="text-sm font-bold text-white"><AnimatedCount value={timeFilteredTransactions.length} /></span>
                </div>
              </Card>
              <Card className={`bg-red-500/20 backdrop-blur-sm border-red-300/30 px-3 py-1.5 cursor-pointer transition-all hover:bg-red-500/30 ${activeFilter === 'high' ? 'ring-1 ring-red-300' : ''}`} onClick={() => handleFilterChange('high')}>
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-3.5 w-3.5 text-red-200" />
                  <span className="text-xs text-red-200">High Risk</span>
                  <span className="text-sm font-bold text-white"><AnimatedCount value={highCount} /></span>
                </div>
              </Card>
              <Card className={`bg-amber-500/20 backdrop-blur-sm border-amber-300/30 px-3 py-1.5 cursor-pointer transition-all hover:bg-amber-500/30 ${activeFilter === 'medium' ? 'ring-1 ring-amber-300' : ''}`} onClick={() => handleFilterChange('medium')}>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-200" />
                  <span className="text-xs text-amber-200">Medium Risk</span>
                  <span className="text-sm font-bold text-white"><AnimatedCount value={mediumCount} /></span>
                </div>
              </Card>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 px-3 py-1.5 cursor-pointer transition-all hover:bg-white/20" onClick={() => setActiveTab('alerts')}>
                <div className="flex items-center gap-2">
                  <Bell className="h-3.5 w-3.5 text-blue-200" />
                  <span className="text-xs text-blue-100">Alerts</span>
                  <span className="text-sm font-bold text-white"><AnimatedCount value={openAlertCount} /></span>
                </div>
              </Card>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs border-white/30 text-white hover:bg-white/10 bg-transparent" onClick={() => { reloadHistoricalData(); toast.success('Refreshing...'); }}>
              <RefreshCw className="h-3 w-3" /> Refresh
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-5">
          {activeTab === 'transactions' && (
            <div className="space-y-4">
              <Card className="bg-white border-gray-200 p-3 shadow-sm">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input placeholder="Search by ID, Cashier, or Store..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 bg-gray-50 border-gray-200 h-9" />
                  </div>
                  {activeFilter !== 'all' && (
                    <Badge variant="outline" className="gap-1 cursor-pointer hover:bg-gray-50 text-gray-700 border-gray-300 text-xs" onClick={() => handleFilterChange('all')}>
                      {activeFilter === 'high' ? 'High Risk' : activeFilter === 'medium' ? 'Medium Risk' : 'Pending'}
                      <span>✕</span>
                    </Badge>
                  )}
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-[120px] bg-white border-gray-200 h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="2days">Last 2 Days</SelectItem>
                      <SelectItem value="week">Last Week</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={storeFilter} onValueChange={setStoreFilter}>
                    <SelectTrigger className="w-[150px] bg-white border-gray-200 h-9 text-xs"><SelectValue placeholder="All Stores" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Stores</SelectItem>
                      {uniqueStores.map(([id, name]) => (
                        <SelectItem key={id} value={id}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-1">
                    <Input type="number" placeholder="Min ₹" value={minAmount} onChange={e => setMinAmount(e.target.value)} className="w-[80px] bg-gray-50 border-gray-200 text-xs h-9" />
                    <span className="text-gray-300">-</span>
                    <Input type="number" placeholder="Max ₹" value={maxAmount} onChange={e => setMaxAmount(e.target.value)} className="w-[80px] bg-gray-50 border-gray-200 text-xs h-9" />
                  </div>
                  <Button variant="outline" size="sm" className="gap-1 border-gray-200 h-9 text-xs" onClick={() => { handleFilterChange('all'); setMinAmount(''); setMaxAmount(''); setSearchTerm(''); setTimeRange('all'); setStoreFilter('all'); }}>
                    <Filter className="h-3 w-3" /> Clear
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1 border-gray-200 text-blue-600 hover:bg-blue-50 h-9 text-xs" onClick={() => { exportToCSV(filteredTransactions); toast.success(`Exported ${filteredTransactions.length} transactions`); }}>
                    <Download className="h-3 w-3" /> CSV
                  </Button>
                </div>
              </Card>

              <TransactionTable transactions={paginatedTransactions} onRowClick={handleRowClick} />

              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Showing {filteredTransactions.length > 0 ? page * PAGE_SIZE + 1 : 0}-{Math.min((page + 1) * PAGE_SIZE, filteredTransactions.length)} of {filteredTransactions.length}</span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)} className="border-gray-200 h-7 text-xs">Previous</Button>
                  <span className="text-gray-600 text-xs font-medium">Page {page + 1} of {totalPages || 1}</span>
                  <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="border-gray-200 h-7 text-xs">Next</Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && <AnalyticsView transactions={timeFilteredTransactions} />}
          {activeTab === 'alerts' && <AlertWorkflow alerts={alerts} setAlerts={setAlerts} transactions={transactions} />}
          {activeTab === 'scorecard' && <EmployeeScorecardView transactions={timeFilteredTransactions} storeNames={storeNames} />}
          {activeTab === 'heatmap' && <HeatmapView transactions={timeFilteredTransactions} storeNames={storeNames} />}
          {activeTab === 'streams' && <StreamViewer vasData={rawVasData} posData={rawPosData} />}
          {activeTab === 'settings' && <SettingsPanel onConfigSaved={reloadAfterConfigChange} />}
        </div>
      </div>

      <TransactionDetailDrawer
        transaction={selectedTransaction}
        billData={selectedTransaction ? billsMap[selectedTransaction.id] : null}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
