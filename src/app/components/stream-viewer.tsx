import { useState, useEffect } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { RefreshCw, Activity } from 'lucide-react';
import { Badge } from '@/app/components/ui/badge';

interface StreamEvent {
    stream_id: string;
    data: any;
}

export function StreamViewer() {
    const [vasEvents, setVasEvents] = useState<StreamEvent[]>([]);
    const [posEvents, setPosEvents] = useState<StreamEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetchStreams = async () => {
        setLoading(true);
        try {
            const vasRes = await fetch('http://localhost:8000/api/streams/vas_stream?count=20');
            const vasData = await vasRes.json();
            if (vasData.status === 'success') {
                setVasEvents(vasData.data);
            }

            const posRes = await fetch('http://localhost:8000/api/streams/pos_stream?count=20');
            const posData = await posRes.json();
            if (posData.status === 'success') {
                setPosEvents(posData.data);
            }

            setLastUpdated(new Date());
        } catch (error) {
            console.error('Error fetching stream data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStreams();
        const interval = setInterval(fetchStreams, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold mb-1">Redis Stream Inspector</h2>
                    <p className="text-sm text-gray-400">Real-time view of raw events from VAS and POS systems</p>
                </div>
                <div className="flex items-center gap-4">
                    {lastUpdated && (
                        <span className="text-xs text-gray-500">
                            Last updated: {lastUpdated.toLocaleTimeString()}
                        </span>
                    )}
                    <Button variant="outline" size="sm" onClick={fetchStreams} disabled={loading} className="gap-2">
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
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
                            {vasEvents.length} Events
                        </Badge>
                    </div>
                    <div className="flex-1 overflow-auto p-4 space-y-3">
                        {vasEvents.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                <p>No VAS events found</p>
                            </div>
                        ) : (
                            vasEvents.map((event) => (
                                <div key={event.stream_id} className="bg-gray-800/40 border border-gray-700/50 rounded-md p-3 text-xs font-mono">
                                    <div className="flex justify-between items-center mb-2 text-gray-400 pb-2 border-b border-gray-700/50">
                                        <span>ID: {event.stream_id}</span>
                                    </div>
                                    <pre className="overflow-x-auto text-gray-300">
                                        {JSON.stringify(event.data, null, 2)}
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
                            {posEvents.length} Events
                        </Badge>
                    </div>
                    <div className="flex-1 overflow-auto p-4 space-y-3">
                        {posEvents.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                <p>No POS events found</p>
                            </div>
                        ) : (
                            posEvents.map((event) => (
                                <div key={event.stream_id} className="bg-gray-800/40 border border-gray-700/50 rounded-md p-3 text-xs font-mono">
                                    <div className="flex justify-between items-center mb-2 text-gray-400 pb-2 border-b border-gray-700/50">
                                        <span>ID: {event.stream_id}</span>
                                    </div>
                                    <pre className="overflow-x-auto text-gray-300">
                                        {JSON.stringify(event.data, null, 2)}
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
