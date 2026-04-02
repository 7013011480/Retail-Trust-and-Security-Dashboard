import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { TrendingUp, TrendingDown, AlertCircle, Store } from 'lucide-react';
import { Transaction } from '@/lib/mock-data';
import { useMemo } from 'react';

interface EmployeeScorecardViewProps {
  transactions: Transaction[];
}

interface StoreScorecard {
  store_id: string;
  total_transactions: number;
  flagged_transactions: number;
  fraud_rate: number;
  high_risk: number;
  medium_risk: number;
  total_value: number;
}

export function EmployeeScorecardView({ transactions }: EmployeeScorecardViewProps) {

  const storeScores = useMemo(() => {
    const storeMap: Record<string, StoreScorecard> = {};

    transactions.forEach(t => {
      if (!storeMap[t.shop_id]) {
        storeMap[t.shop_id] = {
          store_id: t.shop_id,
          total_transactions: 0,
          flagged_transactions: 0,
          fraud_rate: 0,
          high_risk: 0,
          medium_risk: 0,
          total_value: 0,
        };
      }
      const s = storeMap[t.shop_id];
      s.total_transactions++;
      s.total_value += t.transaction_total;
      if (t.risk_level === 'High') {
        s.flagged_transactions++;
        s.high_risk++;
      } else if (t.risk_level === 'Medium') {
        s.flagged_transactions++;
        s.medium_risk++;
      }
    });

    return Object.values(storeMap).map(s => ({
      ...s,
      fraud_rate: s.total_transactions > 0
        ? (s.flagged_transactions / s.total_transactions) * 100
        : 0,
    })).sort((a, b) => b.fraud_rate - a.fraud_rate);
  }, [transactions]);

  const totalStores = storeScores.length;
  const avgFraudRate = totalStores > 0
    ? storeScores.reduce((acc, s) => acc + s.fraud_rate, 0) / totalStores
    : 0;
  const highRiskStores = storeScores.filter(s => s.fraud_rate >= 30).length;

  const getFraudRateBadge = (rate: number) => {
    if (rate >= 30) {
      return (
        <Badge className="bg-red-50 text-red-700 border-red-200">
          {rate.toFixed(1)}%
        </Badge>
      );
    } else if (rate >= 15) {
      return (
        <Badge className="bg-amber-50 text-amber-700 border-amber-200">
          {rate.toFixed(1)}%
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-green-50 text-green-700 border-green-200">
          {rate.toFixed(1)}%
        </Badge>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Stores</p>
              <p className="text-2xl font-bold text-gray-800">{totalStores}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Store className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="bg-white border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg Flag Rate</p>
              <p className="text-2xl font-bold text-gray-800">
                {avgFraudRate.toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <TrendingUp className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </Card>

        <Card className="bg-white border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">High Risk Stores</p>
              <p className="text-2xl font-bold text-gray-800">
                {highRiskStores}
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Store Table */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Store Performance & Risk Assessment</h3>
          <p className="text-sm text-gray-500 mt-1">
            Sorted by flag rate (highest risk first)
          </p>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50 border-gray-200">
                <TableHead className="text-gray-600">Store ID</TableHead>
                <TableHead className="text-right text-gray-600">Total Transactions</TableHead>
                <TableHead className="text-right text-gray-600">Flagged</TableHead>
                <TableHead className="text-right text-gray-600">High Risk</TableHead>
                <TableHead className="text-right text-gray-600">Medium Risk</TableHead>
                <TableHead className="text-gray-600">Flag Rate</TableHead>
                <TableHead className="text-right text-gray-600">Total Value</TableHead>
                <TableHead className="text-gray-600">Risk Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {storeScores.map((store, index) => (
                <TableRow
                  key={store.store_id}
                  className={`border-gray-100 hover:bg-blue-50/50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                >
                  <TableCell className="font-mono text-sm font-semibold text-gray-800">{store.store_id}</TableCell>
                  <TableCell className="text-right font-mono text-gray-700">
                    {store.total_transactions}
                  </TableCell>
                  <TableCell className="text-right font-mono text-gray-700">
                    {store.flagged_transactions}
                  </TableCell>
                  <TableCell className="text-right font-mono text-red-600">
                    {store.high_risk}
                  </TableCell>
                  <TableCell className="text-right font-mono text-amber-600">
                    {store.medium_risk}
                  </TableCell>
                  <TableCell>{getFraudRateBadge(store.fraud_rate)}</TableCell>
                  <TableCell className="text-right font-mono text-gray-700">
                    {'\u20B9'}{store.total_value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </TableCell>
                  <TableCell>
                    {store.fraud_rate >= 30 ? (
                      <div className="flex items-center gap-2 text-red-600">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm font-semibold">High Risk</span>
                      </div>
                    ) : store.fraud_rate >= 15 ? (
                      <div className="flex items-center gap-2 text-amber-600">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm font-semibold">Medium Risk</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-green-600">
                        <TrendingDown className="h-4 w-4" />
                        <span className="text-sm font-semibold">Low Risk</span>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
