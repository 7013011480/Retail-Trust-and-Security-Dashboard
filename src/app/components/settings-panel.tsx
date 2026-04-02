import { useState, useEffect } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Settings, Save } from 'lucide-react';
import { toast } from 'sonner';

interface RuleConfig {
  discount_threshold_percent: number;
  refund_amount_threshold: number;
  high_value_threshold: number;
  bulk_quantity_threshold: number;
  idle_pos_minutes: number;
}

interface SettingsPanelProps {
  onConfigSaved?: () => void;
}

export function SettingsPanel({ onConfigSaved }: SettingsPanelProps) {
  const [config, setConfig] = useState<RuleConfig>({
    discount_threshold_percent: 20,
    refund_amount_threshold: 0,
    high_value_threshold: 2000,
    bulk_quantity_threshold: 10,
    idle_pos_minutes: 30,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://${window.location.hostname}:8001/api/config`)
      .then(res => res.json())
      .then(data => {
        setConfig(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    try {
      const res = await fetch(`http://${window.location.hostname}:8001/api/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        toast.success('Rule thresholds updated — reloading data...');
        onConfigSaved?.();
      } else {
        toast.error('Failed to update thresholds');
      }
    } catch {
      toast.error('Failed to connect to backend');
    }
  };

  const updateField = (field: keyof RuleConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400">
        Loading configuration...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-1">Rule Configuration</h2>
        <p className="text-sm text-gray-500">Configure fraud detection thresholds. Changes apply to both live and historical classification.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-4">Discount Rules</h3>
          <div className="space-y-3">
            <div>
              <Label className="text-gray-600">Discount Threshold (%)</Label>
              <p className="text-xs text-gray-400 mb-1">Flag transactions with discount above this percentage</p>
              <Input
                type="number"
                value={config.discount_threshold_percent}
                onChange={(e) => updateField('discount_threshold_percent', e.target.value)}
                className="bg-gray-50 border-gray-200"
              />
            </div>
          </div>
        </Card>

        <Card className="bg-white border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-4">Refund Rules</h3>
          <div className="space-y-3">
            <div>
              <Label className="text-gray-600">Refund Amount Threshold ({'\u20B9'})</Label>
              <p className="text-xs text-gray-400 mb-1">Flag refunds above this amount (0 = flag all refunds)</p>
              <Input
                type="number"
                value={config.refund_amount_threshold}
                onChange={(e) => updateField('refund_amount_threshold', e.target.value)}
                className="bg-gray-50 border-gray-200"
              />
            </div>
          </div>
        </Card>

        <Card className="bg-white border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-4">Transaction Value</h3>
          <div className="space-y-3">
            <div>
              <Label className="text-gray-600">High Value Threshold ({'\u20B9'})</Label>
              <p className="text-xs text-gray-400 mb-1">Flag transactions exceeding this amount</p>
              <Input
                type="number"
                value={config.high_value_threshold}
                onChange={(e) => updateField('high_value_threshold', e.target.value)}
                className="bg-gray-50 border-gray-200"
              />
            </div>
          </div>
        </Card>

        <Card className="bg-white border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-4">Bulk Purchase</h3>
          <div className="space-y-3">
            <div>
              <Label className="text-gray-600">Bulk Quantity Threshold</Label>
              <p className="text-xs text-gray-400 mb-1">Flag transactions with total items above this count</p>
              <Input
                type="number"
                value={config.bulk_quantity_threshold}
                onChange={(e) => updateField('bulk_quantity_threshold', e.target.value)}
                className="bg-gray-50 border-gray-200"
              />
            </div>
          </div>
        </Card>

        <Card className="bg-white border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-4">POS Idle Time</h3>
          <div className="space-y-3">
            <div>
              <Label className="text-gray-600">Idle POS Alert (minutes)</Label>
              <p className="text-xs text-gray-400 mb-1">Alert when a POS has no transactions for this duration</p>
              <Input
                type="number"
                value={config.idle_pos_minutes}
                onChange={(e) => updateField('idle_pos_minutes', e.target.value)}
                className="bg-gray-50 border-gray-200"
              />
            </div>
          </div>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6"
        >
          <Save className="h-4 w-4" />
          Save Configuration
        </Button>
      </div>
    </div>
  );
}
