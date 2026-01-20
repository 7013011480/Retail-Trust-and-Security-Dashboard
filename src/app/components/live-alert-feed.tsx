import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Bell, AlertTriangle, Eye, X } from 'lucide-react';
import { Alert } from '@/lib/mock-data';

interface LiveAlertFeedProps {
  alerts: Alert[];
  onViewAlert: (transactionId: string) => void;
  onDismissAlert: (alertId: string) => void;
}

export function LiveAlertFeed({ alerts, onViewAlert, onDismissAlert }: LiveAlertFeedProps) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse((prev) => !prev);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const activeAlerts = alerts.filter((alert) => alert.status === 'new');

  return (
    <Card className="bg-gray-900/50 border-gray-800 h-full flex flex-col">
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell className="h-5 w-5 text-red-500" />
            {activeAlerts.length > 0 && (
              <span
                className={`absolute -top-1 -right-1 h-3 w-3 bg-red-600 rounded-full transition-opacity duration-500 ${
                  pulse ? 'opacity-100' : 'opacity-50'
                }`}
              />
            )}
          </div>
          <h3 className="font-semibold">Real-time Alerts</h3>
          {activeAlerts.length > 0 && (
            <Badge className="bg-red-600/20 text-red-400 border-red-600/50">
              {activeAlerts.length} New
            </Badge>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p>No active alerts</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <Card
                key={alert.id}
                className={`p-3 border ${
                  alert.status === 'new'
                    ? 'bg-red-950/30 border-red-600/50'
                    : alert.status === 'reviewing'
                    ? 'bg-amber-950/30 border-amber-600/50'
                    : 'bg-gray-800/50 border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle
                      className={`h-4 w-4 ${
                        alert.status === 'new'
                          ? 'text-red-500'
                          : alert.status === 'reviewing'
                          ? 'text-amber-500'
                          : 'text-gray-500'
                      }`}
                    />
                    <span className="text-xs font-mono text-gray-400">
                      {alert.transaction_id}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => onDismissAlert(alert.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>

                <div className="space-y-1 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Shop: {alert.shop_id}</span>
                    <Badge
                      className={`${
                        alert.fraud_probability_score >= 85
                          ? 'bg-red-600/20 text-red-400 border-red-600/50'
                          : 'bg-amber-600/20 text-amber-400 border-amber-600/50'
                      }`}
                    >
                      {alert.fraud_probability_score}%
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-400">
                    Cashier: {alert.cashier_name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {format(alert.timestamp, 'MMM dd, yyyy HH:mm:ss')}
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 border-blue-600/50 text-blue-400 hover:bg-blue-600/10"
                  onClick={() => onViewAlert(alert.transaction_id)}
                >
                  <Eye className="h-4 w-4" />
                  Review Transaction
                </Button>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
