// Data types and processing for the Retail Trust & Security Dashboard

export interface Transaction {
  id: string;
  shop_id: string;
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

// Camera mapping (same as backend mapping.json)
const CAMERA_MAP: Record<string, string> = {
  'NDCIN1223_POS 3': 'NDCIN1223_IN001_01',
  'NSCIN8227_POS4': 'NSCIN8227_CAM-02_W2',
  'NDCIN1227_POS 2': 'NDCIN1227_IN001_01',
};

/**
 * Process raw API bills into classified transactions.
 * Applies POS-only fraud rules (same logic as backend fraud_engine).
 */
export function processBillsToTransactions(bills: any[]): Transaction[] {
  return bills.map((bill, i) => {
    const storeId = bill.ndcin || 'Unknown';
    const posId = bill.terminalName || 'Unknown';
    const camId = CAMERA_MAP[`${storeId}_${posId}`] || 'Unknown';
    const totalAmt = parseFloat(bill.actualBillAmt || 0);
    const discAmt = parseFloat(bill.discAmt || 0);
    const returnAmt = parseFloat(bill.returnAmt || 0);
    const discountPercent = totalAmt > 0 && discAmt > 0 ? (discAmt / totalAmt) * 100 : 0;

    const triggeredRules: string[] = [];

    // Rule: High Discount (>20%)
    if (discountPercent > 20) {
      triggeredRules.push(`High Discount (${discountPercent.toFixed(1)}%)`);
    }

    // Rule: Refund Processed
    if (returnAmt > 0) {
      triggeredRules.push(`Refund Processed (Rs.${returnAmt})`);
    }

    // Rule: Complementary Order
    if (bill.isComplementary === 'Yes') {
      triggeredRules.push('Complementary Order');
    }

    // Determine risk level
    let riskLevel: 'High' | 'Medium' | 'Low' = 'Low';
    let status: 'genuine' | 'fraudulent' | 'suspicious' | 'pending' = 'genuine';

    if (triggeredRules.length > 0) {
      riskLevel = 'Medium';
      status = 'suspicious';
    }

    const timestamp = new Date(`${bill.billDate}T${bill.billTime}+05:30`);

    return {
      id: `TXN-${bill.billNo || String(i + 1).padStart(3, '0')}`,
      shop_id: storeId,
      cam_id: camId,
      pos_id: posId,
      cashier_name: bill.cashierName || 'Unknown',
      timestamp,
      transaction_total: totalAmt,
      risk_level: riskLevel,
      triggered_rules: triggeredRules.length > 0 ? triggeredRules : undefined,
      status,
      fraud_category: triggeredRules[0] || undefined,
    };
  }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
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

/**
 * Fetch historical bills from the JSON file in public/ and process them.
 */
export async function loadHistoricalData(): Promise<{ transactions: Transaction[]; alerts: Alert[] }> {
  try {
    const response = await fetch('/historical-data.json');
    const data = await response.json();
    const bills = data?.data?.bills || [];
    const transactions = processBillsToTransactions(bills);
    const alerts = generateAlertsFromTransactions(transactions);
    return { transactions, alerts };
  } catch (error) {
    console.error('Failed to load historical data:', error);
    return { transactions: [], alerts: [] };
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
