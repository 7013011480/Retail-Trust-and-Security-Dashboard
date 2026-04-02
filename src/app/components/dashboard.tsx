import { useState, useEffect } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Badge } from '@/app/components/ui/badge';
import {
  LayoutDashboard,
  Shield,
  Search,
  Filter,
  RefreshCw,
  Activity,
  BarChart3,
  Users,
  Map,
  ShieldAlert,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { TransactionTable } from '@/app/components/transaction-table';
import { StreamViewer } from '@/app/components/stream-viewer';
import { AnalyticsView } from '@/app/components/analytics-view';
import { EmployeeScorecardView } from '@/app/components/employee-scorecard-view';
import { HeatmapView } from '@/app/components/heatmap-view';
import {
  mockHeatmapData,
  loadHistoricalData,
  Transaction,
  Alert,
} from '@/lib/mock-data';
import { toast } from 'sonner';

export function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('transactions');
  const [activeFilter, setActiveFilter] = useState<'all' | 'high' | 'medium' | 'pending'>('all');
  const [isConnected, setIsConnected] = useState(false);
  const [rawVasData, setRawVasData] = useState<any[]>([]);
  const [rawPosData, setRawPosData] = useState<any[]>([]);

  // Load historical data from JSON file
  useEffect(() => {
    loadHistoricalData().then(({ transactions: hist, alerts: histAlerts }) => {
      setTransactions(prev => [...prev, ...hist]);
      setAlerts(prev => [...prev, ...histAlerts]);
    });
  }, []);

  useEffect(() => {
    const ws = new WebSocket(`ws://${window.location.hostname}:8001/ws`);

    ws.onopen = () => {
      console.log('Connected to WebSocket');
      setIsConnected(true);
      toast.success('Connected to Live Service');
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'NEW_TRANSACTION') {
          const newTxn = {
            ...message.data,
            timestamp: new Date(message.data.timestamp)
          };
          setTransactions((prev) => [newTxn, ...prev]);
        } else if (message.type === 'NEW_ALERT') {
          const newAlert = {
            ...message.data,
            timestamp: new Date(message.data.timestamp)
          };
          setAlerts((prev) => [newAlert, ...prev]);
        } else if (message.type === 'TRANSACTION_UPDATE') {
          const { id, status, notes } = message.data;
          setTransactions((prev) =>
            prev.map((t) =>
              t.id === id ? { ...t, status, notes } : t
            )
          );
          setAlerts((prev) =>
            prev.map((alert) =>
              alert.transaction_id === id ? { ...alert, status: 'resolved' } : alert
            )
          );
        } else if (message.type === 'RAW_VAS_DATA') {
          setRawVasData(message.data);
        } else if (message.type === 'RAW_POS_DATA') {
          setRawPosData(message.data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket');
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleRefresh = () => {
    toast.success('Dashboard refreshed');
  };

  const handleFilterChange = (filter: 'all' | 'high' | 'medium' | 'pending') => {
    setActiveFilter(filter);
    toast.info(
      `Filtering: ${filter === 'all'
        ? 'All Transactions'
        : filter === 'high'
          ? 'High Risk'
          : filter === 'medium'
            ? 'Medium Risk'
            : 'Pending Review'
      }`
    );
  };

  const getFilteredTransactions = () => {
    let filtered = transactions.filter(
      (t) =>
        t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.cashier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.shop_id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (activeFilter === 'high') {
      filtered = filtered.filter((t) => t.risk_level === 'High');
    } else if (activeFilter === 'medium') {
      filtered = filtered.filter((t) => t.risk_level === 'Medium');
    } else if (activeFilter === 'pending') {
      filtered = filtered.filter((t) => !t.status || t.status === 'pending');
    }

    return filtered;
  };

  const filteredTransactions = getFilteredTransactions();

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Retail Trust & Security</h1>
              <p className="text-sm text-blue-100">
                Real-time fraud detection & monitoring system
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-white/30 text-white hover:bg-white/10 bg-transparent"
              onClick={handleRefresh}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <div className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg backdrop-blur-sm ${isConnected ? 'bg-green-500/20 border-green-300/50' : 'bg-red-500/20 border-red-300/50'}`}>
              <div className={`h-2 w-2 rounded-full animate-pulse ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className={`text-sm font-semibold ${isConnected ? 'text-green-100' : 'text-red-100'}`}>
                {isConnected ? 'System Active' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4">
          <Card
            className={`bg-white/10 backdrop-blur-sm border-white/20 p-4 cursor-pointer transition-all hover:bg-white/20 ${activeFilter === 'all' ? 'ring-2 ring-white/50' : ''}`}
            onClick={() => handleFilterChange('all')}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <LayoutDashboard className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-sm text-blue-100">Total Transactions</div>
                <div className="text-2xl font-bold text-white">{transactions.length}</div>
              </div>
            </div>
          </Card>
          <Card
            className={`bg-red-500/20 backdrop-blur-sm border-red-300/30 p-4 cursor-pointer transition-all hover:bg-red-500/30 ${activeFilter === 'high' ? 'ring-2 ring-red-300' : ''}`}
            onClick={() => handleFilterChange('high')}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/30 rounded-lg">
                <ShieldAlert className="h-5 w-5 text-red-200" />
              </div>
              <div>
                <div className="text-sm text-red-200">High Risk</div>
                <div className="text-2xl font-bold text-white">
                  {transactions.filter((t) => t.risk_level === 'High').length}
                </div>
              </div>
            </div>
          </Card>
          <Card
            className={`bg-amber-500/20 backdrop-blur-sm border-amber-300/30 p-4 cursor-pointer transition-all hover:bg-amber-500/30 ${activeFilter === 'medium' ? 'ring-2 ring-amber-300' : ''}`}
            onClick={() => handleFilterChange('medium')}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/30 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-amber-200" />
              </div>
              <div>
                <div className="text-sm text-amber-200">Medium Risk</div>
                <div className="text-2xl font-bold text-white">
                  {transactions.filter((t) => t.risk_level === 'Medium').length}
                </div>
              </div>
            </div>
          </Card>
          <Card
            className={`bg-white/10 backdrop-blur-sm border-white/20 p-4 cursor-pointer transition-all hover:bg-white/20 ${activeFilter === 'pending' ? 'ring-2 ring-white/50' : ''}`}
            onClick={() => handleFilterChange('pending')}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-sm text-blue-100">Pending Review</div>
                <div className="text-2xl font-bold text-white">
                  {transactions.filter((t) => !t.status || t.status === 'pending').length}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-white border border-gray-200 mb-6 shadow-sm">
                <TabsTrigger value="transactions" className="gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                  <LayoutDashboard className="h-4 w-4" />
                  Transactions
                </TabsTrigger>
                <TabsTrigger value="analytics" className="gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="employees" className="gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                  <Users className="h-4 w-4" />
                  Store Scorecard
                </TabsTrigger>
                <TabsTrigger value="heatmap" className="gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                  <Map className="h-4 w-4" />
                  Store Heatmap
                </TabsTrigger>
                <TabsTrigger value="streams" className="gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                  <Activity className="h-4 w-4" />
                  Stream Viewer
                </TabsTrigger>
              </TabsList>

              <TabsContent value="transactions" className="space-y-4">
                {/* Search and Filters */}
                <Card className="bg-white border-gray-200 p-4 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by Transaction ID, Cashier, or Shop ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-gray-50 border-gray-200"
                      />
                    </div>
                    {activeFilter !== 'all' && (
                      <Badge
                        variant="outline"
                        className="gap-2 cursor-pointer hover:bg-gray-50 text-gray-700 border-gray-300"
                        onClick={() => handleFilterChange('all')}
                      >
                        {activeFilter === 'high' && 'High Risk'}
                        {activeFilter === 'medium' && 'Medium Risk'}
                        {activeFilter === 'pending' && 'Pending Review'}
                        <span className="text-xs">✕</span>
                      </Badge>
                    )}
                    <Button
                      variant="outline"
                      className="gap-2 border-gray-200"
                      onClick={() => handleFilterChange('all')}
                    >
                      <Filter className="h-4 w-4" />
                      {activeFilter === 'all' ? 'Filters' : 'Clear Filters'}
                    </Button>
                  </div>
                </Card>

                {/* Transaction Table */}
                <TransactionTable
                  transactions={filteredTransactions}
                />

                {/* Results count */}
                <div className="text-sm text-gray-500 text-center">
                  Showing {filteredTransactions.length} of {transactions.length}{' '}
                  transactions
                </div>
              </TabsContent>

              <TabsContent value="analytics">
                <AnalyticsView transactions={transactions} />
              </TabsContent>

              <TabsContent value="employees">
                <EmployeeScorecardView transactions={transactions} />
              </TabsContent>

              <TabsContent value="heatmap">
                <HeatmapView data={mockHeatmapData} />
              </TabsContent>

              <TabsContent value="streams">
                <StreamViewer vasData={rawVasData} posData={rawPosData} />
              </TabsContent>
            </Tabs>
          </div>
        </div>

      </div>
    </div>
  );
}
