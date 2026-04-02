import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
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

// Animated counter component
function AnimatedCount({ value }: { value: number }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (displayed === value) return;
    const diff = value - displayed;
    const step = Math.max(1, Math.abs(Math.ceil(diff / 15)));
    const timer = setTimeout(() => {
      setDisplayed(prev => {
        if (diff > 0) return Math.min(prev + step, value);
        return Math.max(prev - step, value);
      });
    }, 30);
    return () => clearTimeout(timer);
  }, [value, displayed]);

  return <>{displayed}</>;
}

function exportToCSV(transactions: Transaction[]) {
  const headers = ['Transaction ID', 'Shop ID', 'Cam ID', 'POS ID', 'Cashier Name', 'Timestamp', 'Total (\u20B9)', 'Risk Level', 'Status', 'Triggered Rules'];
  const rows = transactions.map(t => [
    t.id, t.shop_id, t.cam_id, t.pos_id, t.cashier_name,
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

export function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [billsMap, setBillsMap] = useState<Record<string, any>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('transactions');
  const [activeFilter, setActiveFilter] = useState<'all' | 'high' | 'medium' | 'pending'>('all');
  const [timeRange, setTimeRange] = useState<string>('all');
  const [storeFilter, setStoreFilter] = useState<string>('all');
  const [isConnected, setIsConnected] = useState(false);
  const [rawVasData, setRawVasData] = useState<any[]>([]);
  const [rawPosData, setRawPosData] = useState<any[]>([]);

  // Store name lookup
  const [storeNames, setStoreNames] = useState<Record<string, string>>({});

  // Advanced filters
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  // Transaction detail drawer
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
    // Sync new bills in background, reload when done
    const base = `http://${window.location.hostname}:8001`;
    fetch(`${base}/api/history?days=10`)
      .then(() => loadFromLocal())
      .catch(() => {});
  }, [loadFromLocal]);

  const reloadAfterConfigChange = useCallback(async () => {
    // Re-fetch and re-classify from POS API with new thresholds
    try {
      const base = `http://${window.location.hostname}:8001`;
      // Clear persisted data so history re-classifies everything
      await fetch(`${base}/api/history?days=10`);
      // Then load the re-classified data
      const res = await fetch(`${base}/api/transactions`);
      const data = await res.json();
      const txns = (data?.transactions || []).map((t: any) => ({ ...t, timestamp: new Date(t.timestamp) }));
      setTransactions(txns);
      setAlerts([]);
      setBillsMap(data?.bills_map || {});
      toast.success('Data re-classified with new thresholds');
    } catch {
      toast.error('Failed to reload data');
    }
  }, []);

  // Load store names from backend
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

  // Load historical data (once on mount)
  useEffect(() => {
    reloadHistoricalData();
  }, [reloadHistoricalData]);

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

  const handleRefresh = () => { toast.success('Dashboard refreshed'); };

  const handleFilterChange = (filter: 'all' | 'high' | 'medium' | 'pending') => {
    setActiveFilter(filter);
  };

  // Time-range filtered transactions
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

  // Unique stores for filter dropdown
  const uniqueStores = useMemo(() => {
    const map = new Map<string, string>();
    transactions.forEach(t => {
      if (!map.has(t.shop_id)) {
        map.set(t.shop_id, t.shop_name || storeNames[t.shop_id] || t.shop_id);
      }
    });
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [transactions, storeNames]);

  const getFilteredTransactions = () => {
    let filtered = timeFilteredTransactions.filter(t =>
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.cashier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.shop_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.shop_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (storeFilter !== 'all') filtered = filtered.filter(t => t.shop_id === storeFilter);

    if (activeFilter === 'high') filtered = filtered.filter(t => t.risk_level === 'High');
    else if (activeFilter === 'medium') filtered = filtered.filter(t => t.risk_level === 'Medium');
    else if (activeFilter === 'pending') filtered = filtered.filter(t => !t.status || t.status === 'pending');

    // Amount range filter
    const min = parseFloat(minAmount);
    const max = parseFloat(maxAmount);
    if (!isNaN(min)) filtered = filtered.filter(t => t.transaction_total >= min);
    if (!isNaN(max)) filtered = filtered.filter(t => t.transaction_total <= max);

    return filtered;
  };

  const filteredTransactions = getFilteredTransactions();
  const highCount = timeFilteredTransactions.filter(t => t.risk_level === 'High').length;
  const mediumCount = timeFilteredTransactions.filter(t => t.risk_level === 'Medium').length;
  const openAlertCount = alerts.filter(a => a.status === 'new' || a.status === 'Fraudulent' || a.status === 'Pending for review').length;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 px-4 py-2 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/20 rounded-md backdrop-blur-sm">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-base font-bold text-white">Retail Trust & Security</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs border-white/30 text-white hover:bg-white/10 bg-transparent" onClick={handleRefresh}>
              <RefreshCw className="h-3 w-3" /> Refresh
            </Button>
            <div className={`flex items-center gap-1.5 px-2 py-1 border rounded-md backdrop-blur-sm text-xs ${isConnected ? 'bg-green-500/20 border-green-300/50' : 'bg-red-500/20 border-red-300/50'}`}>
              <div className={`h-1.5 w-1.5 rounded-full animate-pulse ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className={`font-semibold ${isConnected ? 'text-green-100' : 'text-red-100'}`}>
                {isConnected ? 'Live' : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-3">
          <Card className={`bg-white/10 backdrop-blur-sm border-white/20 px-3 py-2 cursor-pointer transition-all hover:bg-white/20 ${activeFilter === 'all' ? 'ring-2 ring-white/50' : ''}`} onClick={() => handleFilterChange('all')}>
            <div className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4 text-blue-200" />
              <div>
                <div className="text-xs text-blue-100">Transactions</div>
                <div className="text-lg font-bold text-white leading-tight"><AnimatedCount value={timeFilteredTransactions.length} /></div>
              </div>
            </div>
          </Card>
          <Card className={`bg-red-500/20 backdrop-blur-sm border-red-300/30 px-3 py-2 cursor-pointer transition-all hover:bg-red-500/30 ${activeFilter === 'high' ? 'ring-2 ring-red-300' : ''}`} onClick={() => handleFilterChange('high')}>
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-red-200" />
              <div>
                <div className="text-xs text-red-200">High Risk</div>
                <div className="text-lg font-bold text-white leading-tight"><AnimatedCount value={highCount} /></div>
              </div>
            </div>
          </Card>
          <Card className={`bg-amber-500/20 backdrop-blur-sm border-amber-300/30 px-3 py-2 cursor-pointer transition-all hover:bg-amber-500/30 ${activeFilter === 'medium' ? 'ring-2 ring-amber-300' : ''}`} onClick={() => handleFilterChange('medium')}>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-200" />
              <div>
                <div className="text-xs text-amber-200">Medium Risk</div>
                <div className="text-lg font-bold text-white leading-tight"><AnimatedCount value={mediumCount} /></div>
              </div>
            </div>
          </Card>
          <Card className={`bg-white/10 backdrop-blur-sm border-white/20 px-3 py-2 cursor-pointer transition-all hover:bg-white/20`} onClick={() => setActiveTab('alerts')}>
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-blue-200" />
              <div>
                <div className="text-xs text-blue-100">Open Alerts</div>
                <div className="text-lg font-bold text-white leading-tight"><AnimatedCount value={openAlertCount} /></div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-white border border-gray-200 mb-6 shadow-sm">
                <TabsTrigger value="transactions" className="gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                  <LayoutDashboard className="h-4 w-4" /> Transactions
                </TabsTrigger>
                <TabsTrigger value="analytics" className="gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                  <BarChart3 className="h-4 w-4" /> Analytics
                </TabsTrigger>
                <TabsTrigger value="alerts" className="gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                  <Bell className="h-4 w-4" /> Alerts
                  {alerts.filter(a => a.status === 'new' || a.status === 'Fraudulent' || a.status === 'Pending for review').length > 0 && (
                    <Badge className="ml-1 bg-red-100 text-red-700 border-red-200 text-xs">
                      {alerts.filter(a => a.status === 'new' || a.status === 'Fraudulent' || a.status === 'Pending for review').length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="employees" className="gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                  <Users className="h-4 w-4" /> Store Scorecard
                </TabsTrigger>
                <TabsTrigger value="heatmap" className="gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                  <MapIcon className="h-4 w-4" /> Store Heatmap
                </TabsTrigger>
                <TabsTrigger value="streams" className="gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                  <Activity className="h-4 w-4" /> Stream Viewer
                </TabsTrigger>
                <TabsTrigger value="settings" className="gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                  <Settings className="h-4 w-4" /> Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="transactions" className="space-y-4">
                {/* Search, Filters, Time Range, Amount Range, Export */}
                <Card className="bg-white border-gray-200 p-4 shadow-sm">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input placeholder="Search by ID, Cashier, or Shop..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 bg-gray-50 border-gray-200" />
                    </div>
                    {activeFilter !== 'all' && (
                      <Badge variant="outline" className="gap-2 cursor-pointer hover:bg-gray-50 text-gray-700 border-gray-300" onClick={() => handleFilterChange('all')}>
                        {activeFilter === 'high' && 'High Risk'}
                        {activeFilter === 'medium' && 'Medium Risk'}
                        {activeFilter === 'pending' && 'Pending Review'}
                        <span className="text-xs">✕</span>
                      </Badge>
                    )}
                    <Select value={timeRange} onValueChange={setTimeRange}>
                      <SelectTrigger className="w-[130px] bg-white border-gray-200">
                        <SelectValue placeholder="Time range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="2days">Last 2 Days</SelectItem>
                        <SelectItem value="week">Last Week</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={storeFilter} onValueChange={setStoreFilter}>
                      <SelectTrigger className="w-[160px] bg-white border-gray-200">
                        <SelectValue placeholder="All Stores" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Stores</SelectItem>
                        {uniqueStores.map(([id, name]) => (
                          <SelectItem key={id} value={id}>{name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-1">
                      <Input type="number" placeholder="Min ₹" value={minAmount} onChange={e => setMinAmount(e.target.value)} className="w-[90px] bg-gray-50 border-gray-200 text-sm" />
                      <span className="text-gray-400 text-xs">-</span>
                      <Input type="number" placeholder="Max ₹" value={maxAmount} onChange={e => setMaxAmount(e.target.value)} className="w-[90px] bg-gray-50 border-gray-200 text-sm" />
                    </div>
                    <Button variant="outline" className="gap-2 border-gray-200" onClick={() => { handleFilterChange('all'); setMinAmount(''); setMaxAmount(''); setSearchTerm(''); setTimeRange('all'); setStoreFilter('all'); }}>
                      <Filter className="h-4 w-4" /> Clear
                    </Button>
                    <Button variant="outline" className="gap-2 border-gray-200 text-blue-600 hover:bg-blue-50" onClick={() => { exportToCSV(filteredTransactions); toast.success(`Exported ${filteredTransactions.length} transactions`); }}>
                      <Download className="h-4 w-4" /> CSV
                    </Button>
                  </div>
                </Card>

                <TransactionTable transactions={filteredTransactions} onRowClick={handleRowClick} />

                <div className="text-sm text-gray-500 text-center">
                  Showing {filteredTransactions.length} of {timeFilteredTransactions.length} transactions
                </div>
              </TabsContent>

              <TabsContent value="analytics">
                <AnalyticsView transactions={timeFilteredTransactions} />
              </TabsContent>

              <TabsContent value="alerts">
                <AlertWorkflow alerts={alerts} setAlerts={setAlerts} transactions={transactions} />
              </TabsContent>

              <TabsContent value="employees">
                <EmployeeScorecardView transactions={timeFilteredTransactions} />
              </TabsContent>

              <TabsContent value="heatmap">
                <HeatmapView transactions={timeFilteredTransactions} />
              </TabsContent>

              <TabsContent value="streams">
                <StreamViewer vasData={rawVasData} posData={rawPosData} />
              </TabsContent>

              <TabsContent value="settings">
                <SettingsPanel onConfigSaved={reloadAfterConfigChange} />
              </TabsContent>
            </Tabs>
          </div>
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
