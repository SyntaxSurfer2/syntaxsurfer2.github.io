// DEV: Kian Heydari - Ultimate Network Speed & Analyzer
// Professional network analysis dashboard with real-time monitoring

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SpeedTest from './SpeedTest';
import NetworkInfo from './NetworkInfo';
import PerformanceCharts from './PerformanceCharts';
import TestHistory from './TestHistory';
import { Activity, Wifi, BarChart3, History, Zap } from 'lucide-react';

export interface NetworkData {
  download: number;
  upload: number;
  ping: number;
  jitter: number;
  packetLoss: number;
  timestamp: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface NetworkInfo {
  publicIp: string;
  localIp: string;
  hostname: string;
  os: string;
  isp: string;
  connectionType: string;
  location: string;
}

const NetworkAnalyzer = () => {
  const [testHistory, setTestHistory] = useState<NetworkData[]>([]);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);

  // Initialize network info on component mount
  useEffect(() => {
    fetchNetworkInfo();
  }, []);

  const fetchNetworkInfo = async () => {
    try {
      // Simulate fetching network information
      const info: NetworkInfo = {
        publicIp: await getPublicIP(),
        localIp: getLocalIP(),
        hostname: window.location.hostname || 'localhost',
        os: getOS(),
        isp: 'Detecting ISP...',
        connectionType: getConnectionType(),
        location: 'Detecting location...'
      };
      setNetworkInfo(info);
    } catch (error) {
      console.error('Error fetching network info:', error);
    }
  };

  const getPublicIP = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'Unknown';
    }
  };

  const getLocalIP = (): string => {
    // This is a simplified approach - in a real app, you might use WebRTC
    return '192.168.1.1';
  };

  const getOS = (): string => {
    const platform = navigator.platform;
    const userAgent = navigator.userAgent;
    
    if (platform.includes('Win')) return 'Windows';
    if (platform.includes('Mac')) return 'macOS';
    if (platform.includes('Linux')) return 'Linux';
    if (/Android/.test(userAgent)) return 'Android';
    if (/iPhone|iPad/.test(userAgent)) return 'iOS';
    return 'Unknown';
  };

  const getConnectionType = (): string => {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      return connection.effectiveType || connection.type || 'Unknown';
    }
    return 'Unknown';
  };

  const handleTestComplete = (results: NetworkData) => {
    setTestHistory(prev => [results, ...prev.slice(0, 99)]); // Keep last 100 tests
  };

  const getNetworkQuality = (download: number, ping: number): 'excellent' | 'good' | 'fair' | 'poor' => {
    if (download >= 100 && ping <= 20) return 'excellent';
    if (download >= 50 && ping <= 50) return 'good';
    if (download >= 25 && ping <= 100) return 'fair';
    return 'poor';
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4 mb-8">
        <div className="inline-flex items-center gap-3 px-6 py-3 glass-card rounded-2xl">
          <Zap className="w-8 h-8 text-primary animate-pulse" />
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Network Speed Analyzer
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Professional network analysis with real-time monitoring, detailed diagnostics, and performance insights
        </p>
      </div>

      {/* Main Dashboard */}
      <Tabs defaultValue="speed-test" className="w-full max-w-7xl mx-auto">
        <TabsList className="grid w-full grid-cols-4 glass-card p-2 h-auto">
          <TabsTrigger 
            value="speed-test" 
            className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground"
          >
            <Activity className="w-4 h-4" />
            Speed Test
          </TabsTrigger>
          <TabsTrigger 
            value="network-info"
            className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground"
          >
            <Wifi className="w-4 h-4" />
            Network Info
          </TabsTrigger>
          <TabsTrigger 
            value="charts"
            className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground"
          >
            <BarChart3 className="w-4 h-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger 
            value="history"
            className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground"
          >
            <History className="w-4 h-4" />
            History
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="speed-test" className="space-y-4">
            <SpeedTest 
              onTestComplete={handleTestComplete}
              isRunning={isTestRunning}
              setIsRunning={setIsTestRunning}
              getNetworkQuality={getNetworkQuality}
            />
          </TabsContent>

          <TabsContent value="network-info" className="space-y-4">
            <NetworkInfo networkInfo={networkInfo} />
          </TabsContent>

          <TabsContent value="charts" className="space-y-4">
            <PerformanceCharts testHistory={testHistory} />
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <TestHistory testHistory={testHistory} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default NetworkAnalyzer;