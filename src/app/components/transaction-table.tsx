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
import { Video } from 'lucide-react';
import { Transaction } from '@/lib/mock-data';

interface TransactionTableProps {
  transactions: Transaction[];
  onWatchFootage: (transactionId: string) => void;
}

export function TransactionTable({ transactions, onWatchFootage }: TransactionTableProps) {

  const getStatusBadge = (status?: string) => {
    if (!status || status === 'pending') {
      return (
        <Badge variant="outline" className="text-gray-500 border-gray-300">
          Pending Review
        </Badge>
      );
    } else if (status === 'genuine') {
      return (
        <Badge className="bg-green-50 text-green-700 border-green-200">
          Genuine
        </Badge>
      );
    } else if (status === 'fraudulent') {
      return (
        <Badge className="bg-red-50 text-red-700 border-red-200">
          Fraudulent
        </Badge>
      );
    } else if (status === 'suspicious') {
      return (
        <Badge className="bg-amber-50 text-amber-700 border-amber-200">
          Suspicious
        </Badge>
      );
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 hover:bg-gray-50 border-gray-200">
            <TableHead className="text-gray-600">Transaction ID</TableHead>
            <TableHead className="text-gray-600">Shop ID</TableHead>
            <TableHead className="text-gray-600">Cam ID</TableHead>
            <TableHead className="text-gray-600">POS ID</TableHead>
            <TableHead className="text-gray-600">Cashier Name</TableHead>
            <TableHead className="text-gray-600">Timestamp</TableHead>
            <TableHead className="text-right text-gray-600">Total</TableHead>
            <TableHead className="text-gray-600">Status</TableHead>
            <TableHead className="text-center text-gray-600">Actions</TableHead>
            <TableHead className="text-gray-600">Triggered Rules</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction, index) => (
            <TableRow
              key={transaction.id}
              className={`border-gray-100 hover:bg-blue-50/50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
            >
              <TableCell className="font-mono text-sm text-gray-700">{transaction.id}</TableCell>
              <TableCell className="font-mono text-sm text-gray-700">{transaction.shop_id}</TableCell>
              <TableCell className="font-mono text-sm text-gray-700">{transaction.cam_id}</TableCell>
              <TableCell className="font-mono text-sm text-gray-700">{transaction.pos_id}</TableCell>
              <TableCell className="text-gray-800">{transaction.cashier_name}</TableCell>
              <TableCell className="text-sm text-gray-600">
                {format(transaction.timestamp, 'MMM dd, yyyy HH:mm:ss')}
              </TableCell>
              <TableCell className="text-right font-mono text-gray-800">
                {'\u20B9'}{transaction.transaction_total.toFixed(2)}
              </TableCell>
              <TableCell>{getStatusBadge(transaction.status)}</TableCell>
              <TableCell className="text-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                  onClick={() => onWatchFootage(transaction.id)}
                >
                  <Video className="h-4 w-4" />
                  Watch Footage
                </Button>
              </TableCell>
              <TableCell className="text-xs text-gray-500 max-w-[200px] truncate">
                {transaction.triggered_rules?.join(', ')}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
