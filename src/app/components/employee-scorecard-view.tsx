import { format } from 'date-fns';
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
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Search, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { EmployeeScorecard } from '@/lib/mock-data';
import { useState } from 'react';

interface EmployeeScorecardViewProps {
  employees: EmployeeScorecard[];
}

export function EmployeeScorecardView({ employees }: EmployeeScorecardViewProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.shop_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedEmployees = [...filteredEmployees].sort(
    (a, b) => b.fraud_rate - a.fraud_rate
  );

  const getFraudRateBadge = (rate: number) => {
    if (rate >= 10) {
      return (
        <Badge className="bg-red-600/20 text-red-400 border-red-600/50">
          {rate.toFixed(2)}%
        </Badge>
      );
    } else if (rate >= 5) {
      return (
        <Badge className="bg-amber-600/20 text-amber-400 border-amber-600/50">
          {rate.toFixed(2)}%
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-green-600/20 text-green-400 border-green-600/50">
          {rate.toFixed(2)}%
        </Badge>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-900/50 border-gray-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Employees</p>
              <p className="text-2xl font-bold">{employees.length}</p>
            </div>
            <div className="p-3 bg-blue-600/20 rounded-lg">
              <AlertCircle className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Avg Fraud Rate</p>
              <p className="text-2xl font-bold">
                {(
                  employees.reduce((acc, emp) => acc + emp.fraud_rate, 0) /
                  employees.length
                ).toFixed(2)}
                %
              </p>
            </div>
            <div className="p-3 bg-amber-600/20 rounded-lg">
              <TrendingUp className="h-6 w-6 text-amber-400" />
            </div>
          </div>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">High Risk Employees</p>
              <p className="text-2xl font-bold">
                {employees.filter((emp) => emp.fraud_rate >= 10).length}
              </p>
            </div>
            <div className="p-3 bg-red-600/20 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name or shop ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-900/50 border-gray-800"
          />
        </div>
      </div>

      {/* Employee Table */}
      <Card className="bg-gray-900/50 border-gray-800">
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-lg font-semibold">Employee Performance & Risk Assessment</h3>
          <p className="text-sm text-gray-400 mt-1">
            Sorted by fraud rate (highest risk first)
          </p>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-900/50 hover:bg-gray-900/50 border-gray-800">
                <TableHead>Employee Name</TableHead>
                <TableHead>Shop ID</TableHead>
                <TableHead className="text-right">Total Transactions</TableHead>
                <TableHead className="text-right">Flagged</TableHead>
                <TableHead>Fraud Rate</TableHead>
                <TableHead className="text-right">Avg Fraud Score</TableHead>
                <TableHead>Last Incident</TableHead>
                <TableHead>Risk Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedEmployees.map((employee) => (
                <TableRow
                  key={employee.id}
                  className="border-gray-800 hover:bg-gray-900/30"
                >
                  <TableCell className="font-semibold">{employee.name}</TableCell>
                  <TableCell className="font-mono text-sm">{employee.shop_id}</TableCell>
                  <TableCell className="text-right font-mono">
                    {employee.total_transactions}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {employee.flagged_transactions}
                  </TableCell>
                  <TableCell>{getFraudRateBadge(employee.fraud_rate)}</TableCell>
                  <TableCell className="text-right font-mono">
                    {employee.average_fraud_score.toFixed(1)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(employee.last_incident, 'MMM dd, yyyy HH:mm')}
                  </TableCell>
                  <TableCell>
                    {employee.fraud_rate >= 10 ? (
                      <div className="flex items-center gap-2 text-red-400">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm font-semibold">High Risk</span>
                      </div>
                    ) : employee.fraud_rate >= 5 ? (
                      <div className="flex items-center gap-2 text-amber-400">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm font-semibold">Medium Risk</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-green-400">
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
