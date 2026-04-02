// Data types and processing for the Retail Trust & Security Dashboard

export interface Transaction {
  id: string;
  shop_id: string;
  shop_name?: string;
  cam_id: string;
  pos_id: string;
  cashier_name: string;
  timestamp: Date;
  transaction_total: number;
  risk_level: 'High' | 'Medium' | 'Low';
  triggered_rules?: string[];
  status?: 'genuine' | 'fraudulent' | 'suspicious' | 'pending';
  fraud_category?: string;
  notes?: string;
}

export interface Alert {
  id: string;
  transaction_id: string;
  shop_id: string;
  cashier_name: string;
  risk_level: 'High' | 'Medium' | 'Low';
  triggered_rules?: string[];
  timestamp: Date;
  status: 'new' | 'reviewing' | 'resolved' | 'Fraudulent' | 'Pending for review' | 'Genuine';
}

export interface HeatmapData {
  camera_id: string;
  lane: string;
  x: number;
  y: number;
  flagged_count: number;
}

export function generateAlertsFromTransactions(transactions: Transaction[]): Alert[] {
  const flagged = transactions.filter(t => t.risk_level !== 'Low');

  return flagged.map((t, i) => {
    const statusOptions: Alert['status'][] = ['resolved', 'Genuine', 'Fraudulent'];
    return {
      id: `ALT-${String(i + 1).padStart(3, '0')}`,
      transaction_id: t.id,
      shop_id: t.shop_id,
      cashier_name: t.cashier_name,
      risk_level: t.risk_level,
      triggered_rules: t.triggered_rules,
      timestamp: t.timestamp,
      status: statusOptions[i % statusOptions.length],
    };
  });
}

function parseTransactions(data: any): { transactions: Transaction[]; alerts: Alert[]; billsMap: Record<string, any> } {
  const rawTransactions = data?.transactions || [];
  const billsMap: Record<string, any> = data?.bills_map || {};
  const transactions: Transaction[] = rawTransactions.map((t: any) => ({
    ...t,
    timestamp: new Date(t.timestamp),
  }));
  const alerts = generateAlertsFromTransactions(transactions);
  return { transactions, alerts, billsMap };
}

/**
 * Load data: first try local persisted data (/api/transactions),
 * then sync new bills from POS API (/api/history).
 */
export async function loadHistoricalData(onSyncComplete?: () => void): Promise<{ transactions: Transaction[]; alerts: Alert[]; billsMap: Record<string, any> }> {
  const base = `http://${window.location.hostname}:8001`;

  try {
    // 1. Try persisted local data first (fast, no external API call)
    const localRes = await fetch(`${base}/api/transactions`);
    const localData = await localRes.json();
    const localCount = localData?.transactions?.length || 0;

    if (localCount > 0) {
      console.log(`Loaded ${localCount} persisted transactions, syncing delta in background...`);
      // Sync new bills since last timestamp in background
      fetch(`${base}/api/history?days=10`)
        .then(() => {
          console.log('Background sync complete');
          onSyncComplete?.();
        })
        .catch(() => {});
      return parseTransactions(localData);
    }

    // 2. No local data — fetch from POS API (first time only)
    console.log('No persisted data, fetching from POS API...');
    const histRes = await fetch(`${base}/api/history?days=10`);
    const histData = await histRes.json();
    return parseTransactions(histData);
  } catch (error) {
    console.error('Failed to load data:', error);
    return { transactions: [], alerts: [], billsMap: {} };
  }
}

// Mock heatmap data
export const mockHeatmapData: HeatmapData[] = [
  { camera_id: 'CAM-01-A', lane: 'Lane 1', x: 10, y: 15, flagged_count: 28 },
  { camera_id: 'CAM-01-B', lane: 'Lane 2', x: 30, y: 15, flagged_count: 12 },
  { camera_id: 'CAM-01-C', lane: 'Lane 3', x: 50, y: 15, flagged_count: 8 },
  { camera_id: 'CAM-01-D', lane: 'Lane 4', x: 70, y: 15, flagged_count: 15 },
  { camera_id: 'CAM-02-A', lane: 'Lane 1', x: 10, y: 50, flagged_count: 19 },
  { camera_id: 'CAM-02-B', lane: 'Lane 2', x: 30, y: 50, flagged_count: 24 },
  { camera_id: 'CAM-02-C', lane: 'Lane 3', x: 50, y: 50, flagged_count: 6 },
  { camera_id: 'CAM-03-A', lane: 'Lane 1', x: 10, y: 85, flagged_count: 31 },
  { camera_id: 'CAM-03-B', lane: 'Lane 2', x: 30, y: 85, flagged_count: 11 },
  { camera_id: 'CAM-03-C', lane: 'Lane 3', x: 50, y: 85, flagged_count: 9 },
];
