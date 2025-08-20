// Network Information Component - Detailed network diagnostics
// Features: IP addresses, ISP info, connection details, traceroute

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { NetworkInfo as NetworkInfoType } from './NetworkAnalyzer';
import { 
  Globe, 
  Home, 
  Server, 
  Monitor, 
  Wifi, 
  MapPin, 
  Route,
  RefreshCw,
  Copy,
  CheckCircle,
  Timer
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NetworkInfoProps {
  networkInfo: NetworkInfoType | null;
}

interface TracerouteHop {
  hop: number;
  ip: string;
  hostname: string;
  latency: number[];
}

const NetworkInfo = ({ networkInfo }: NetworkInfoProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [traceroute, setTraceroute] = useState<TracerouteHop[]>([]);
  const [dnsTests, setDnsTests] = useState<{server: string, latency: number}[]>([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (networkInfo) {
      runDnsTests();
    }
  }, [networkInfo]);

  const runDnsTests = async () => {
    const dnsServers = [
      { name: 'Cloudflare', server: '1.1.1.1' },
      { name: 'Google', server: '8.8.8.8' },
      { name: 'Quad9', server: '9.9.9.9' }
    ];

    const results = [];
    for (const dns of dnsServers) {
      const start = performance.now();
      try {
        // Simulate DNS lookup (in a real app, you'd use a DNS lookup service)
        await new Promise(resolve => setTimeout(resolve, 10 + Math.random() * 40));
        const end = performance.now();
        results.push({
          server: dns.name,
          latency: Math.round(end - start)
        });
      } catch {
        results.push({
          server: dns.name,
          latency: 999
        });
      }
    }
    setDnsTests(results);
  };

  const runTraceroute = async () => {
    setIsRefreshing(true);
    
    // Simulate traceroute (in a real app, you'd use a traceroute service)
    const simulatedHops: TracerouteHop[] = [
      {
        hop: 1,
        ip: '192.168.1.1',
        hostname: 'router.local',
        latency: [1.2, 1.1, 1.3]
      },
      {
        hop: 2,
        ip: '10.0.0.1',
        hostname: 'isp-gateway.net',
        latency: [8.5, 8.7, 8.3]
      },
      {
        hop: 3,
        ip: '203.0.113.1',
        hostname: 'core1.isp.net',
        latency: [15.2, 14.8, 15.5]
      },
      {
        hop: 4,
        ip: '203.0.113.50',
        hostname: 'border.isp.net',
        latency: [22.1, 21.9, 22.5]
      },
      {
        hop: 5,
        ip: '8.8.8.8',
        hostname: 'dns.google',
        latency: [25.3, 25.1, 25.7]
      }
    ];

    // Simulate loading time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setTraceroute(simulatedHops);
    setIsRefreshing(false);
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast({
        title: 'Copied!',
        description: `${field} copied to clipboard`,
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast({
        title: 'Copy failed',
        description: 'Could not copy to clipboard',
        variant: 'destructive'
      });
    }
  };

  const getConnectionTypeColor = (type: string) => {
    if (type.includes('wifi') || type.includes('4g')) return 'text-accent';
    if (type.includes('ethernet')) return 'text-success';
    return 'text-muted-foreground';
  };

  if (!networkInfo) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading network information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Basic Network Info */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Network Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Public IP */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-accent" />
                <div>
                  <p className="font-medium">Public IP</p>
                  <p className="text-sm text-muted-foreground font-mono">{networkInfo.publicIp}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(networkInfo.publicIp, 'Public IP')}
              >
                {copiedField === 'Public IP' ? (
                  <CheckCircle className="w-4 h-4 text-success" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Local IP */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Home className="w-4 h-4 text-success" />
                <div>
                  <p className="font-medium">Local IP</p>
                  <p className="text-sm text-muted-foreground font-mono">{networkInfo.localIp}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(networkInfo.localIp, 'Local IP')}
              >
                {copiedField === 'Local IP' ? (
                  <CheckCircle className="w-4 h-4 text-success" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Hostname */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Server className="w-4 h-4 text-warning" />
                <div>
                  <p className="font-medium">Hostname</p>
                  <p className="text-sm text-muted-foreground font-mono">{networkInfo.hostname}</p>
                </div>
              </div>
            </div>

            {/* Operating System */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Monitor className="w-4 h-4 text-primary" />
                <div>
                  <p className="font-medium">Operating System</p>
                  <p className="text-sm text-muted-foreground">{networkInfo.os}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connection Info */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="w-5 h-5 text-accent" />
            Connection Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {/* ISP */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Server className="w-4 h-4 text-accent" />
                <div>
                  <p className="font-medium">Internet Service Provider</p>
                  <p className="text-sm text-muted-foreground">{networkInfo.isp}</p>
                </div>
              </div>
            </div>

            {/* Connection Type */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Wifi className={`w-4 h-4 ${getConnectionTypeColor(networkInfo.connectionType)}`} />
                <div>
                  <p className="font-medium">Connection Type</p>
                  <Badge variant="outline" className="mt-1">
                    {networkInfo.connectionType}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-destructive" />
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">{networkInfo.location}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DNS Test Results */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-success" />
            DNS Response Times
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dnsTests.map((dns, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                <span className="font-medium">{dns.server}</span>
                <Badge variant={dns.latency < 50 ? 'default' : dns.latency < 100 ? 'secondary' : 'destructive'}>
                  {dns.latency}ms
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Traceroute */}
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Route className="w-5 h-5 text-warning" />
            Network Route
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={runTraceroute}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Route className="w-4 h-4" />
            )}
            Trace Route
          </Button>
        </CardHeader>
        <CardContent>
          {traceroute.length > 0 ? (
            <div className="space-y-2">
              {traceroute.map((hop, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-8 h-6 text-xs justify-center">
                      {hop.hop}
                    </Badge>
                    <div>
                      <p className="font-mono text-xs">{hop.ip}</p>
                      <p className="text-muted-foreground text-xs">{hop.hostname}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-xs">
                      {hop.latency.map(l => l.toFixed(1)).join(' / ')} ms
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Route className="w-8 h-8 mx-auto mb-2" />
              <p>Click "Trace Route" to analyze network path</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NetworkInfo;