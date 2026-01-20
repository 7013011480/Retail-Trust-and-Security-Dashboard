import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { HeatmapData } from '@/lib/mock-data';

interface HeatmapViewProps {
  data: HeatmapData[];
}

export function HeatmapView({ data }: HeatmapViewProps) {
  const maxFlagged = Math.max(...data.map((d) => d.flagged_count));

  const getHeatColor = (count: number) => {
    const intensity = count / maxFlagged;
    if (intensity >= 0.7) return 'bg-red-600';
    if (intensity >= 0.5) return 'bg-orange-600';
    if (intensity >= 0.3) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  const getHeatOpacity = (count: number) => {
    const intensity = count / maxFlagged;
    if (intensity >= 0.7) return 'opacity-90';
    if (intensity >= 0.5) return 'opacity-70';
    if (intensity >= 0.3) return 'opacity-50';
    return 'opacity-30';
  };

  return (
    <Card className="bg-gray-900/50 border-gray-800 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Store Floor Plan - Flagged Events</h3>
        <p className="text-sm text-gray-400">
          Heat intensity shows frequency of flagged transactions per checkout lane
        </p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-800">
        <span className="text-sm text-gray-400">Intensity:</span>
        <div className="flex items-center gap-2">
          <div className="w-8 h-4 bg-green-600 opacity-30 rounded" />
          <span className="text-xs text-gray-500">Low</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-4 bg-yellow-600 opacity-50 rounded" />
          <span className="text-xs text-gray-500">Medium</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-4 bg-orange-600 opacity-70 rounded" />
          <span className="text-xs text-gray-500">High</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-4 bg-red-600 opacity-90 rounded" />
          <span className="text-xs text-gray-500">Critical</span>
        </div>
      </div>

      {/* Store layout visualization */}
      <div className="relative bg-gray-950/50 rounded-lg p-8 min-h-[400px] border border-gray-800">
        {/* Store sections */}
        <div className="absolute top-4 left-4 text-xs text-gray-500 font-mono">SHOP-01</div>
        <div className="absolute top-[33%] left-4 text-xs text-gray-500 font-mono">SHOP-02</div>
        <div className="absolute top-[66%] left-4 text-xs text-gray-500 font-mono">SHOP-03</div>

        {/* Entrance label */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-gray-500 font-semibold">
          ← ENTRANCE →
        </div>

        {/* Camera/Lane markers */}
        {data.map((item) => (
          <div
            key={item.camera_id}
            className="absolute group cursor-pointer"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Heat circle */}
            <div
              className={`w-16 h-16 rounded-full ${getHeatColor(
                item.flagged_count
              )} ${getHeatOpacity(
                item.flagged_count
              )} blur-sm transition-all group-hover:blur-md group-hover:scale-110`}
            />

            {/* Camera icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-gray-900 border-2 border-gray-700 rounded-lg p-2 group-hover:border-gray-500 transition-colors">
                <svg
                  className="w-6 h-6 text-gray-400 group-hover:text-gray-200"
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
            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="bg-gray-950 border border-gray-700 rounded-lg p-2 whitespace-nowrap shadow-xl">
                <div className="text-xs font-mono text-gray-400 mb-1">{item.camera_id}</div>
                <div className="text-sm font-semibold">{item.lane}</div>
                <div className="text-xs text-gray-400">
                  <Badge className="mt-1 bg-red-600/20 text-red-400 border-red-600/50">
                    {item.flagged_count} Flagged Events
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Grid lines for reference */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <div className="w-full h-px bg-gray-600" style={{ top: '33.33%' }} />
          <div className="w-full h-px bg-gray-600" style={{ top: '66.66%' }} />
        </div>
      </div>
    </Card>
  );
}
