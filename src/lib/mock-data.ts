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
  timestamp_offset: number; // seconds from transaction start
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

export interface EmployeeScorecard {
  id: string;
  name: string;
  shop_id: string;
  total_transactions: number;
  flagged_transactions: number;
  fraud_rate: number;
  average_fraud_score: number;
  last_incident: Date;
}

export interface HeatmapData {
  camera_id: string;
  lane: string;
  x: number;
  y: number;
  flagged_count: number;
}

// Generate mock transactions
export const mockTransactions: Transaction[] = [
  {
    id: 'TXN-001',
    shop_id: 'SHOP-01',
    cam_id: 'CAM-01-A',
    pos_id: 'POS-01',
    cashier_name: 'Sarah Johnson',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    transaction_total: 87.45,
    risk_level: 'High',
    triggered_rules: ['Payment Mismatch'],
    status: 'fraudulent',
  },
  {
    id: 'TXN-002',
    shop_id: 'SHOP-01',
    cam_id: 'CAM-01-B',
    pos_id: 'POS-02',
    cashier_name: 'Michael Chen',
    timestamp: new Date(Date.now() - 1000 * 60 * 25),
    transaction_total: 156.78,
    risk_level: 'Medium',
    triggered_rules: ['High Discount'],
    status: 'suspicious',
  },
  {
    id: 'TXN-003',
    shop_id: 'SHOP-02',
    cam_id: 'CAM-02-A',
    pos_id: 'POS-03',
    cashier_name: 'Emily Rodriguez',
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    transaction_total: 234.99,
    risk_level: 'High',
    triggered_rules: ['Corresponding object not present'],
    status: 'fraudulent',
  },
  {
    id: 'TXN-004',
    shop_id: 'SHOP-01',
    cam_id: 'CAM-01-C',
    pos_id: 'POS-04',
    cashier_name: 'James Williams',
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    transaction_total: 45.20,
    risk_level: 'Low',
    status: 'genuine', // Was pending logic typically, but Low usually implies Genuine unless Pending Review. Let's keep pending or Genuine? User cares about High/Medium mapping. Low -> Genuine makes sense for cleared ones.
  },
  {
    id: 'TXN-005',
    shop_id: 'SHOP-03',
    cam_id: 'CAM-03-A',
    pos_id: 'POS-05',
    cashier_name: 'Amanda Foster',
    timestamp: new Date(Date.now() - 1000 * 60 * 90),
    transaction_total: 312.50,
    risk_level: 'High',
    triggered_rules: ['Bill not generated'],
    status: 'fraudulent',
  },
  {
    id: 'TXN-006',
    shop_id: 'SHOP-02',
    cam_id: 'CAM-02-B',
    pos_id: 'POS-06',
    cashier_name: 'David Kim',
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
    transaction_total: 67.89,
    risk_level: 'Medium',
    triggered_rules: ['Refund Processed'],
    status: 'suspicious',
  },
  {
    id: 'TXN-007',
    shop_id: 'SHOP-01',
    cam_id: 'CAM-01-A',
    pos_id: 'POS-01',
    cashier_name: 'Sarah Johnson',
    timestamp: new Date(Date.now() - 1000 * 60 * 150),
    transaction_total: 189.99,
    risk_level: 'High',
    triggered_rules: ['Payment Mismatch'],
    status: 'fraudulent',
    fraud_category: 'Payment Mismatch',
  },
  {
    id: 'TXN-008',
    shop_id: 'SHOP-03',
    cam_id: 'CAM-03-B',
    pos_id: 'POS-07',
    cashier_name: 'Lisa Martinez',
    timestamp: new Date(Date.now() - 1000 * 60 * 180),
    transaction_total: 523.45,
    risk_level: 'Low',
    status: 'genuine',
  },
];

// Mock receipt items for a transaction
export const mockReceiptItems: ReceiptItem[] = [
  {
    id: 'ITEM-001',
    name: 'Organic Bananas (2 lbs)',
    quantity: 1,
    price: 3.99,
    timestamp_offset: 5,
    scanned: true,
  },
  {
    id: 'ITEM-002',
    name: 'Whole Milk (1 Gallon)',
    quantity: 1,
    price: 4.29,
    timestamp_offset: 12,
    scanned: true,
  },
  {
    id: 'ITEM-003',
    name: 'Premium Steak (1.5 lbs)',
    quantity: 1,
    price: 24.99,
    timestamp_offset: 18,
    scanned: false, // Not scanned - fraud indicator
  },
  {
    id: 'ITEM-004',
    name: 'Bread Loaf',
    quantity: 2,
    price: 5.98,
    timestamp_offset: 25,
    scanned: true,
  },
  {
    id: 'ITEM-005',
    name: 'Fresh Lettuce',
    quantity: 1,
    price: 2.49,
    timestamp_offset: 32,
    scanned: true,
  },
  {
    id: 'ITEM-006',
    name: 'Orange Juice (64 oz)',
    quantity: 1,
    price: 6.79,
    timestamp_offset: 38,
    scanned: true,
  },
  {
    id: 'ITEM-007',
    name: 'Cheese Block (8 oz)',
    quantity: 1,
    price: 7.99,
    timestamp_offset: 45,
    scanned: true,
  },
  {
    id: 'ITEM-008',
    name: 'Pasta Package',
    quantity: 3,
    price: 8.97,
    timestamp_offset: 52,
    scanned: true,
  },
];

// Mock alerts
export const mockAlerts: Alert[] = [
  {
    id: 'ALERT-001',
    transaction_id: 'TXN-005',
    shop_id: 'SHOP-03',
    cashier_name: 'Amanda Foster',
    risk_level: 'High',
    triggered_rules: ['Bill not generated'],
    timestamp: new Date(Date.now() - 1000 * 60 * 90),
    status: 'new',
  },
  {
    id: 'ALERT-002',
    transaction_id: 'TXN-001',
    shop_id: 'SHOP-01',
    cashier_name: 'Sarah Johnson',
    risk_level: 'High',
    triggered_rules: ['Payment Mismatch'],
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    status: 'new',
  },
  {
    id: 'ALERT-003',
    transaction_id: 'TXN-003',
    shop_id: 'SHOP-02',
    cashier_name: 'Emily Rodriguez',
    risk_level: 'Medium',
    triggered_rules: ['High Discount'],
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    status: 'reviewing',
  },
  {
    id: 'ALERT-004',
    transaction_id: 'TXN-006',
    shop_id: 'SHOP-01',
    cashier_name: 'Michael Chen',
    risk_level: 'Medium',
    triggered_rules: ['Refund Processed'],
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
    status: 'resolved',
  },
  {
    id: 'ALERT-005',
    transaction_id: 'TXN-008',
    shop_id: 'SHOP-03',
    cashier_name: 'Lisa Martinez',
    risk_level: 'Low',
    timestamp: new Date(Date.now() - 1000 * 60 * 180),
    status: 'resolved',
  },
  {
    id: 'ALERT-006',
    transaction_id: 'TXN-009',
    shop_id: 'SHOP-02',
    cashier_name: 'David Kim',
    risk_level: 'Medium',
    timestamp: new Date(Date.now() - 1000 * 60 * 200),
    status: 'resolved',
  },
  {
    id: 'ALERT-007',
    transaction_id: 'TXN-010',
    shop_id: 'SHOP-01',
    cashier_name: 'Sarah Johnson',
    risk_level: 'Low',
    timestamp: new Date(Date.now() - 1000 * 60 * 220),
    status: 'resolved',
  },
  {
    id: 'ALERT-008',
    transaction_id: 'TXN-011',
    shop_id: 'SHOP-03',
    cashier_name: 'Amanda Foster',
    risk_level: 'Medium',
    timestamp: new Date(Date.now() - 1000 * 60 * 240),
    status: 'resolved',
  },
  {
    id: 'ALERT-009',
    transaction_id: 'TXN-012',
    shop_id: 'SHOP-02',
    cashier_name: 'Emily Rodriguez',
    fraud_probability_score: 80,
    timestamp: new Date(Date.now() - 1000 * 60 * 260),
    status: 'resolved',
  },
  {
    id: 'ALERT-010',
    transaction_id: 'TXN-013',
    shop_id: 'SHOP-01',
    cashier_name: 'James Williams',
    fraud_probability_score: 60,
    timestamp: new Date(Date.now() - 1000 * 60 * 280),
    status: 'resolved',
  },
  {
    id: 'ALERT-011',
    transaction_id: 'TXN-014',
    shop_id: 'SHOP-03',
    cashier_name: 'Lisa Martinez',
    fraud_probability_score: 50,
    timestamp: new Date(Date.now() - 1000 * 60 * 300),
    status: 'resolved',
  },
];

// Mock employee scorecards
export const mockEmployeeScorecard: EmployeeScorecard[] = [
  {
    id: 'EMP-001',
    name: 'Sarah Johnson',
    shop_id: 'SHOP-01',
    total_transactions: 247,
    flagged_transactions: 18,
    fraud_rate: 7.29,
    average_fraud_score: 76.5,
    last_incident: new Date(Date.now() - 1000 * 60 * 15),
  },
  {
    id: 'EMP-002',
    name: 'Michael Chen',
    shop_id: 'SHOP-01',
    total_transactions: 312,
    flagged_transactions: 8,
    fraud_rate: 2.56,
    average_fraud_score: 52.3,
    last_incident: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
  },
  {
    id: 'EMP-003',
    name: 'Emily Rodriguez',
    shop_id: 'SHOP-02',
    total_transactions: 189,
    flagged_transactions: 14,
    fraud_rate: 7.41,
    average_fraud_score: 71.2,
    last_incident: new Date(Date.now() - 1000 * 60 * 45),
  },
  {
    id: 'EMP-004',
    name: 'James Williams',
    shop_id: 'SHOP-01',
    total_transactions: 298,
    flagged_transactions: 5,
    fraud_rate: 1.68,
    average_fraud_score: 48.9,
    last_incident: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
  },
  {
    id: 'EMP-005',
    name: 'Amanda Foster',
    shop_id: 'SHOP-03',
    total_transactions: 156,
    flagged_transactions: 22,
    fraud_rate: 14.10,
    average_fraud_score: 82.1,
    last_incident: new Date(Date.now() - 1000 * 60 * 90),
  },
  {
    id: 'EMP-006',
    name: 'David Kim',
    shop_id: 'SHOP-02',
    total_transactions: 278,
    flagged_transactions: 9,
    fraud_rate: 3.24,
    average_fraud_score: 55.7,
    last_incident: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
  },
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
