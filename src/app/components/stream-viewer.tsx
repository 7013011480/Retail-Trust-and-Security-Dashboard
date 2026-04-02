import { Card } from '@/app/components/ui/card';
import { Activity } from 'lucide-react';
import { Badge } from '@/app/components/ui/badge';

interface StreamViewerProps {
    vasData: any[];
    posData: any[];
}

export function StreamViewer({ vasData, posData }: StreamViewerProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold mb-1">Live Stream Inspector</h2>
                    <p className="text-sm text-gray-400">Push-based view of raw events from VAS and POS (Syncs every 30s)</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* VAS Stream Column */}
                <Card className="bg-gray-900/50 border-gray-800 flex flex-col h-[700px]">
                    <div className="p-4 border-b border-gray-800 bg-gray-900/80 sticky top-0 backdrop-blur flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-purple-400" />
                            <h3 className="font-semibold text-purple-100">VAS Stream</h3>
                        </div>
                        <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                            {vasData.length} Events
                        </Badge>
                    </div>
                    <div className="flex-1 overflow-auto p-4 space-y-3">
                        {vasData.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                <p>No VAS events found</p>
                            </div>
                        ) : (
                            vasData.map((event, idx) => (
                                <div key={event.SessionId || idx} className="bg-gray-800/40 border border-gray-700/50 rounded-md p-3 text-xs font-mono">
                                    <div className="flex justify-between items-center mb-2 text-gray-400 pb-2 border-b border-gray-700/50">
                                        <span>ID: {event.SessionId || `VAS-${idx}`}</span>
                                    </div>
                                    <pre className="overflow-x-auto text-gray-300">
                                        {JSON.stringify(event, null, 2)}
                                    </pre>
                                </div>
                            ))
                        )}
                    </div>
                </Card>

                {/* POS Stream Column */}
                <Card className="bg-gray-900/50 border-gray-800 flex flex-col h-[700px]">
                    <div className="p-4 border-b border-gray-800 bg-gray-900/80 sticky top-0 backdrop-blur flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-emerald-400" />
                            <h3 className="font-semibold text-emerald-100">POS Stream</h3>
                        </div>
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                            {posData.length} Events
                        </Badge>
                    </div>
                    <div className="flex-1 overflow-auto p-4 space-y-3">
                        {posData.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                <p>No POS events found</p>
                            </div>
                        ) : (
                            posData.map((event, idx) => (
                                <div key={event.billNo || idx} className="bg-gray-800/40 border border-gray-700/50 rounded-md p-3 text-xs font-mono">
                                    <div className="flex justify-between items-center mb-2 text-gray-400 pb-2 border-b border-gray-700/50">
                                        <span>ID: {event.billNo || `POS-${idx}`}</span>
                                    </div>
                                    <pre className="overflow-x-auto text-gray-300">
                                        {JSON.stringify(event, null, 2)}
                                    </pre>
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
