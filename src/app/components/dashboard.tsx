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
  Users,
} from 'lucide-react';
import { TransactionTable } from '@/app/components/transaction-table';
import { LiveAlertFeed } from '@/app/components/live-alert-feed';
import { EmployeeScorecardView } from '@/app/components/employee-scorecard-view';
import { VideoPlaybackView } from '@/app/components/video-playback-view';
import {
  mockTransactions,
  mockAlerts,
  mockEmployeeScorecard,
  mockVideoMarkers,
  Transaction,
} from '@/lib/mock-data';
import { toast } from 'sonner';

export function Dashboard() {
  const [activeView, setActiveView] = useState<'dashboard' | 'video'>('dashboard');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [transactions, setTransactions] = useState(mockTransactions);
  const [alerts, setAlerts] = useState(mockAlerts);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('transactions');
  const [activeFilter, setActiveFilter] = useState<'all' | 'high' | 'medium' | 'pending'>('all');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8001/ws');

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
            timestamp: new Date(message.data.timestamp) // Convert string to Date
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
          // Also resolve alert if exists
          setAlerts((prev) =>
            prev.map((alert) =>
              alert.transaction_id === id ? { ...alert, status: 'resolved' } : alert
            )
          );
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

  const handleWatchFootage = (transactionId: string) => {
    const transaction = transactions.find((t) => t.id === transactionId);
    if (transaction) {
      setSelectedTransaction(transaction);
      setActiveView('video');
    }
  };

  const handleViewAlert = (transactionId: string) => {
    handleWatchFootage(transactionId);
  };

  const handleDismissAlert = (alertId: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
    toast.info('Alert dismissed');
  };

  const handleSubmitDecision = async (
    transactionId: string,
    status: string,
    notes: string
  ) => {
    try {
      await fetch(`http://localhost:8001/api/admin/validate?transaction_id=${transactionId}&decision=${status}&notes=${encodeURIComponent(notes)}`, {
        method: 'POST'
      });
      toast.success(`Decision submitted: ${status}`);
      setActiveView('dashboard');
    } catch (error) {
      console.error("Error submitting decision", error);
      toast.error("Failed to submit decision to server");
    }
  };

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

  // Filter transactions based on search and active filter
  const getFilteredTransactions = () => {
    let filtered = transactions.filter(
      (t) =>
        t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.cashier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.shop_id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Apply active filter
    if (activeFilter === 'high') {
      filtered = filtered.filter((t) => t.risk_level === 'High');
    } else if (activeFilter === 'medium') {
      filtered = filtered.filter(
        (t) => t.risk_level === 'Medium'
      );
    } else if (activeFilter === 'pending') {
      filtered = filtered.filter((t) => !t.status || t.status === 'pending');
    }

    // Return filtered list without sorting (append behavior)
    return filtered;
  };

  const filteredTransactions = getFilteredTransactions();

  if (activeView === 'video' && selectedTransaction) {
    return (
      <VideoPlaybackView
        transaction={selectedTransaction}
        receiptItems={mockReceiptItems}
        videoMarkers={mockVideoMarkers}
        onBack={() => setActiveView('dashboard')}
        onSubmitDecision={handleSubmitDecision}
      />
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <Shield className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Retail Trust & Security</h1>
              <p className="text-sm text-gray-400">
                Real-time fraud detection & monitoring system
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleRefresh}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <div className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg ${isConnected ? 'bg-green-600/20 border-green-600/50' : 'bg-red-600/20 border-red-600/50'}`}>
              <div className={`h-2 w-2 rounded-full animate-pulse ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className={`text-sm font-semibold ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                {isConnected ? 'System Active' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-gray-800/50 border-gray-700 p-4">
            <div className="text-sm text-gray-400 mb-1">Total Transactions</div>
            <div className="text-2xl font-bold">{transactions.length}</div>
          </Card>
          <Card
            className={`bg-red-950/30 border-red-600/50 p-4 cursor-pointer transition-all hover:bg-red-950/50 ${activeFilter === 'high' ? 'ring-2 ring-red-500' : ''
              }`}
            onClick={() => handleFilterChange('high')}
          >
            <div className="text-sm text-red-400 mb-1">High Risk</div>
            <div className="text-2xl font-bold text-red-400">
              {transactions.filter((t) => t.risk_level === 'High').length}
            </div>
          </Card>
          <Card
            className={`bg-amber-950/30 border-amber-600/50 p-4 cursor-pointer transition-all hover:bg-amber-950/50 ${activeFilter === 'medium' ? 'ring-2 ring-amber-500' : ''
              }`}
            onClick={() => handleFilterChange('medium')}
          >
            <div className="text-sm text-amber-400 mb-1">Medium Risk</div>
            <div className="text-2xl font-bold text-amber-400">
              {
                transactions.filter(
                  (t) =>
                    t.risk_level === 'Medium'
                ).length
              }
            </div>
          </Card>
          <Card
            className={`bg-gray-800/50 border-gray-700 p-4 cursor-pointer transition-all hover:bg-gray-800 ${activeFilter === 'pending' ? 'ring-2 ring-blue-500' : ''
              }`}
            onClick={() => handleFilterChange('pending')}
          >
            <div className="text-sm text-gray-400 mb-1">Pending Review</div>
            <div className="text-2xl font-bold">
              {
                transactions.filter(
                  (t) => !t.status || t.status === 'pending'
                ).length
              }
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
              <TabsList className="bg-gray-900 border border-gray-800 mb-6">
                <TabsTrigger value="transactions" className="gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Transaction Monitoring
                </TabsTrigger>
                <TabsTrigger value="employees" className="gap-2">
                  <Users className="h-4 w-4" />
                  Employee Scorecards
                </TabsTrigger>
              </TabsList>

              <TabsContent value="transactions" className="space-y-4">
                {/* Search and Filters */}
                <Card className="bg-gray-900/50 border-gray-800 p-4">
                  <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by Transaction ID, Cashier, or Shop ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-gray-800 border-gray-700"
                      />
                    </div>
                    {activeFilter !== 'all' && (
                      <Badge
                        variant="outline"
                        className="gap-2 cursor-pointer hover:bg-gray-800"
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
                      className="gap-2"
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
                  onWatchFootage={handleWatchFootage}
                />

                {/* Results count */}
                <div className="text-sm text-gray-400 text-center">
                  Showing {filteredTransactions.length} of {transactions.length}{' '}
                  transactions
                </div>
              </TabsContent>

              <TabsContent value="employees">
                <EmployeeScorecardView employees={mockEmployeeScorecard} />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Live Alerts Sidebar */}
        <div className="w-96 border-l border-gray-800 p-4 flex flex-col overflow-hidden">
          <LiveAlertFeed
            alerts={alerts}
            onViewAlert={handleViewAlert}
            onDismissAlert={handleDismissAlert}
          />
        </div>
      </div>
    </div>
  );
}