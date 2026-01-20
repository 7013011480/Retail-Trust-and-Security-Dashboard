import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Video, Eye } from 'lucide-react';
import { Transaction } from '@/lib/mock-data';

interface TransactionTableProps {
  transactions: Transaction[];
  onWatchFootage: (transactionId: string) => void;
}

export function TransactionTable({ transactions, onWatchFootage }: TransactionTableProps) {
  const getFraudScoreBadge = (score: number) => {
    if (score >= 80) {
      return (
        <Badge className="bg-red-600/20 text-red-400 border-red-600/50 hover:bg-red-600/30">
          {score}% HIGH
        </Badge>
      );
    } else if (score >= 60) {
      return (
        <Badge className="bg-amber-600/20 text-amber-400 border-amber-600/50 hover:bg-amber-600/30">
          {score}% MEDIUM
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-green-600/20 text-green-400 border-green-600/50 hover:bg-green-600/30">
          {score}% LOW
        </Badge>
      );
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status || status === 'pending') {
      return (
        <Badge variant="outline" className="text-gray-400">
          Pending Review
        </Badge>
      );
    } else if (status === 'genuine') {
      return (
        <Badge className="bg-green-600/20 text-green-400 border-green-600/50">
          Genuine
        </Badge>
      );
    } else if (status === 'fraudulent') {
      return (
        <Badge className="bg-red-600/20 text-red-400 border-red-600/50">
          Fraudulent
        </Badge>
      );
    } else if (status === 'suspicious') {
      return (
        <Badge className="bg-amber-600/20 text-amber-400 border-amber-600/50">
          Suspicious
        </Badge>
      );
    }
  };

  return (
    <div className="rounded-lg border border-gray-800 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-900/50 hover:bg-gray-900/50 border-gray-800">
            <TableHead>Transaction ID</TableHead>
            <TableHead>Shop ID</TableHead>
            <TableHead>Cam ID</TableHead>
            <TableHead>POS ID</TableHead>
            <TableHead>Cashier Name</TableHead>
            <TableHead>Timestamp</TableHead>
            <TableHead className="text-right">Transaction Total</TableHead>
            <TableHead>Fraud Score</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow
              key={transaction.id}
              className="border-gray-800 hover:bg-gray-900/30"
            >
              <TableCell className="font-mono text-sm">{transaction.id}</TableCell>
              <TableCell className="font-mono text-sm">{transaction.shop_id}</TableCell>
              <TableCell className="font-mono text-sm">{transaction.cam_id}</TableCell>
              <TableCell className="font-mono text-sm">{transaction.pos_id}</TableCell>
              <TableCell>{transaction.cashier_name}</TableCell>
              <TableCell className="text-sm">
                {format(transaction.timestamp, 'MMM dd, yyyy HH:mm:ss')}
              </TableCell>
              <TableCell className="text-right font-mono">
                ${transaction.transaction_total.toFixed(2)}
              </TableCell>
              <TableCell>{getFraudScoreBadge(transaction.fraud_probability_score)}</TableCell>
              <TableCell>{getStatusBadge(transaction.status)}</TableCell>
              <TableCell className="text-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-blue-600/50 text-blue-400 hover:bg-blue-600/10 hover:text-blue-300"
                  onClick={() => onWatchFootage(transaction.id)}
                >
                  <Video className="h-4 w-4" />
                  Watch Footage
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
