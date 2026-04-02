import { useMemo } from 'react';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Transaction } from '@/lib/mock-data';

interface HeatmapViewProps {
  transactions: Transaction[];
}

interface StoreNode {
  store_id: string;
  cam_id: string;
  pos_id: string;
  total_count: number;
  flagged_count: number;
}

export function HeatmapView({ transactions }: HeatmapViewProps) {

  const storeNodes = useMemo(() => {
    const nodeMap: Record<string, StoreNode> = {};

    transactions.forEach(t => {
      const key = `${t.shop_id}_${t.cam_id}_${t.pos_id}`;
      if (!nodeMap[key]) {
        nodeMap[key] = {
          store_id: t.shop_id,
          cam_id: t.cam_id,
          pos_id: t.pos_id,
          total_count: 0,
          flagged_count: 0,
        };
      }
      nodeMap[key].total_count++;
      if (t.risk_level !== 'Low') {
        nodeMap[key].flagged_count++;
      }
    });

    return Object.values(nodeMap);
  }, [transactions]);

  const maxFlagged = Math.max(...storeNodes.map(n => n.flagged_count), 1);

  const getHeatColor = (count: number) => {
    if (count === 0) return 'bg-green-500';
    const intensity = count / maxFlagged;
    if (intensity >= 0.7) return 'bg-red-500';
    if (intensity >= 0.5) return 'bg-orange-500';
    if (intensity >= 0.3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getHeatOpacity = (count: number) => {
    if (count === 0) return 'opacity-25';
    const intensity = count / maxFlagged;
    if (intensity >= 0.7) return 'opacity-70';
    if (intensity >= 0.5) return 'opacity-55';
    if (intensity >= 0.3) return 'opacity-40';
    return 'opacity-25';
  };

  // Lay out nodes in a grid
  const cols = Math.min(storeNodes.length, 3);
  const getPosition = (index: number) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const totalRows = Math.ceil(storeNodes.length / cols);
    return {
      x: cols === 1 ? 50 : 20 + (col * 60) / Math.max(cols - 1, 1),
      y: totalRows === 1 ? 50 : 20 + (row * 60) / Math.max(totalRows - 1, 1),
    };
  };

  return (
    <Card className="bg-white border-gray-200 p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Store & Camera Heatmap</h3>
        <p className="text-sm text-gray-500">
          Flagged transaction frequency per store camera/POS — computed from actual transaction data
        </p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-200">
        <span className="text-sm text-gray-500">Intensity:</span>
        <div className="flex items-center gap-2">
          <div className="w-8 h-4 bg-green-500 opacity-25 rounded" />
          <span className="text-xs text-gray-500">Low</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-4 bg-yellow-500 opacity-40 rounded" />
          <span className="text-xs text-gray-500">Medium</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-4 bg-orange-500 opacity-55 rounded" />
          <span className="text-xs text-gray-500">High</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-4 bg-red-500 opacity-70 rounded" />
          <span className="text-xs text-gray-500">Critical</span>
        </div>
      </div>

      {storeNodes.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p>No transaction data available for heatmap</p>
        </div>
      ) : (
        <div className="relative bg-blue-50/50 rounded-lg p-8 min-h-[400px] border border-blue-100">
          {storeNodes.map((node, index) => {
            const pos = getPosition(index);
            return (
              <div
                key={`${node.store_id}_${node.cam_id}`}
                className="absolute group cursor-pointer"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {/* Heat circle */}
                <div
                  className={`w-20 h-20 rounded-full ${getHeatColor(node.flagged_count)} ${getHeatOpacity(node.flagged_count)} blur-sm transition-all group-hover:blur-md group-hover:scale-110`}
                />

                {/* Camera icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white border-2 border-gray-300 rounded-lg p-2 group-hover:border-blue-400 transition-colors shadow-sm">
                    <svg
                      className="w-6 h-6 text-gray-500 group-hover:text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>

                {/* Tooltip on hover */}
                <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <div className="bg-white border border-gray-200 rounded-lg p-3 whitespace-nowrap shadow-lg">
                    <div className="text-xs font-mono text-gray-500 mb-1">{node.store_id}</div>
                    <div className="text-sm font-semibold text-gray-800">{node.cam_id}</div>
                    <div className="text-xs text-gray-500 mb-1">POS: {node.pos_id}</div>
                    <div className="flex gap-2 mt-1">
                      <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                        {node.total_count} Total
                      </Badge>
                      <Badge className="bg-red-50 text-red-700 border-red-200">
                        {node.flagged_count} Flagged
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
