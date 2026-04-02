// Data types for the Retail Trust & Security Dashboard

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
  shop_name?: string;
  cashier_name: string;
  risk_level: 'High' | 'Medium' | 'Low';
  triggered_rules?: string[];
  timestamp: Date;
  status: 'new' | 'reviewing' | 'resolved' | 'Fraudulent' | 'Pending for review' | 'Genuine';
}
