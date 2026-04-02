// Mock data for the Retail Trust & Security Dashboard

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

export interface ReceiptItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  timestamp_offset: number;
  scanned: boolean;
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

// Store and camera mappings matching the real backend
const STORES = [
  { id: 'NDCIN1223', cams: ['NDCIN1223_IN001_01'], pos: ['POS 3'] },
  { id: 'NSCIN8227', cams: ['NSCIN8227_CAM-02_W2'], pos: ['POS4'] },
  { id: 'NDCIN1227', cams: ['NDCIN1227_IN001_01'], pos: ['POS 2'] },
];

const RULES = [
  { name: 'Payment Mode Mismatch', risk: 'High' as const, status: 'fraudulent' as const },
  { name: 'Corresponding VAS data not found', risk: 'High' as const, status: 'fraudulent' as const },
  { name: 'Corresponding POS data not found', risk: 'High' as const, status: 'fraudulent' as const },
  { name: 'Bill not generated', risk: 'Medium' as const, status: 'suspicious' as const },
  { name: 'High Discount', risk: 'Medium' as const, status: 'suspicious' as const },
  { name: 'Refund Processed', risk: 'Medium' as const, status: 'suspicious' as const },
  { name: 'Complementary Order', risk: 'Medium' as const, status: 'suspicious' as const },
];

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

export function generateHistoricalTransactions(): Transaction[] {
  const rand = seededRandom(42);
  const transactions: Transaction[] = [];
  const now = Date.now();
  const FIVE_DAYS = 5 * 24 * 60 * 60 * 1000;

  for (let i = 0; i < 80; i++) {
    const store = STORES[Math.floor(rand() * STORES.length)];
    const timeOffset = rand() * FIVE_DAYS;
    const timestamp = new Date(now - timeOffset);

    // Distribution: ~70% Low, ~20% Medium, ~10% High
    const roll = rand();
    let riskLevel: 'High' | 'Medium' | 'Low';
    let status: 'genuine' | 'fraudulent' | 'suspicious' | 'pending';
    let triggeredRules: string[] = [];
    let fraudCategory: string | undefined;

    if (roll < 0.10) {
      // High risk
      const highRules = RULES.filter(r => r.risk === 'High');
      const rule = highRules[Math.floor(rand() * highRules.length)];
      riskLevel = 'High';
      status = 'fraudulent';
      triggeredRules = [rule.name];
      fraudCategory = rule.name;
    } else if (roll < 0.30) {
      // Medium risk
      const mediumRules = RULES.filter(r => r.risk === 'Medium');
      const rule = mediumRules[Math.floor(rand() * mediumRules.length)];
      riskLevel = 'Medium';
      status = 'suspicious';
      triggeredRules = [rule.name];
      fraudCategory = rule.name;
    } else {
      // Low risk
      riskLevel = 'Low';
      status = 'genuine';
    }

    const total = Math.round((100 + rand() * 4900) * 100) / 100; // ₹100 - ₹5000

    transactions.push({
      id: `TXN-HIST-${String(i + 1).padStart(3, '0')}`,
      shop_id: store.id,
      cam_id: store.cams[0],
      pos_id: store.pos[0],
      cashier_name: 'Unknown',
      timestamp,
      transaction_total: total,
      risk_level: riskLevel,
      triggered_rules: triggeredRules.length > 0 ? triggeredRules : undefined,
      status,
      fraud_category: fraudCategory,
    });
  }

  // Sort by timestamp descending (most recent first)
  transactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  return transactions;
}

export function generateHistoricalAlerts(transactions?: Transaction[]): Alert[] {
  const txns = transactions ?? generateHistoricalTransactions();
  const alerts: Alert[] = [];

  const flagged = txns.filter(t => t.risk_level !== 'Low');

  flagged.forEach((t, i) => {
    const statusOptions: Alert['status'][] = ['resolved', 'Genuine', 'Fraudulent'];
    // Most historical alerts are resolved
    const status = statusOptions[i % statusOptions.length];

    alerts.push({
      id: `ALT-HIST-${String(i + 1).padStart(3, '0')}`,
      transaction_id: t.id,
      shop_id: t.shop_id,
      cashier_name: t.cashier_name,
      risk_level: t.risk_level,
      triggered_rules: t.triggered_rules,
      timestamp: t.timestamp,
      status,
    });
  });

  return alerts;
}

// Mock receipt items for a transaction
export const mockReceiptItems: ReceiptItem[] = [
  { id: 'ITEM-001', name: 'Organic Bananas (2 lbs)', quantity: 1, price: 3.99, timestamp_offset: 5, scanned: true },
  { id: 'ITEM-002', name: 'Whole Milk (1 Gallon)', quantity: 1, price: 4.29, timestamp_offset: 12, scanned: true },
  { id: 'ITEM-003', name: 'Premium Steak (1.5 lbs)', quantity: 1, price: 24.99, timestamp_offset: 18, scanned: false },
  { id: 'ITEM-004', name: 'Bread Loaf', quantity: 2, price: 5.98, timestamp_offset: 25, scanned: true },
  { id: 'ITEM-005', name: 'Fresh Lettuce', quantity: 1, price: 2.49, timestamp_offset: 32, scanned: true },
  { id: 'ITEM-006', name: 'Orange Juice (64 oz)', quantity: 1, price: 6.79, timestamp_offset: 38, scanned: true },
  { id: 'ITEM-007', name: 'Cheese Block (8 oz)', quantity: 1, price: 7.99, timestamp_offset: 45, scanned: true },
  { id: 'ITEM-008', name: 'Pasta Package', quantity: 3, price: 8.97, timestamp_offset: 52, scanned: true },
];

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

// Video event markers (timestamps in seconds)
export const mockVideoMarkers = [
  { time: 5, label: 'Item 1 Scanned', type: 'normal' },
  { time: 12, label: 'Item 2 Scanned', type: 'normal' },
  { time: 18, label: 'SUSPICIOUS: Item Bypassed', type: 'fraud' },
  { time: 25, label: 'Item 4 Scanned', type: 'normal' },
  { time: 32, label: 'Item 5 Scanned', type: 'normal' },
  { time: 38, label: 'Item 6 Scanned', type: 'normal' },
  { time: 45, label: 'Item 7 Scanned', type: 'normal' },
  { time: 52, label: 'Item 8 Scanned', type: 'normal' },
  { time: 60, label: 'Payment Complete', type: 'normal' },
];
