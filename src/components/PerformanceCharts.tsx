// Performance Charts Component - Real-time network performance visualization
// Features: Speed over time, latency trends, quality metrics

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NetworkData } from './NetworkAnalyzer';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Activity, 
  Gauge, 
  PieChart as PieChartIcon,
  Clock,
  Zap
} from 'lucide-react';

interface PerformanceChartsProps {
  testHistory: NetworkData[];
}

const PerformanceCharts = ({ testHistory }: PerformanceChartsProps) => {
  // Format data for charts
  const chartData = testHistory
    .slice(0, 20) // Last 20 tests
    .reverse()
    .map((test, index) => ({
      test: index + 1,
      download: test.download,
      upload: test.upload,
      ping: test.ping,
      jitter: test.jitter,
      packetLoss: test.packetLoss,
      timestamp: new Date(test.timestamp).toLocaleTimeString(),
      quality: test.quality
    }));

  // Quality distribution data
  const qualityData = testHistory.reduce((acc, test) => {
    acc[test.quality] = (acc[test.quality] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(qualityData).map(([quality, count]) => ({
    name: quality,
    value: count,
    color: getQualityColor(quality)
  }));

  // Performance statistics
  const stats = testHistory.length > 0 ? {
    avgDownload: testHistory.reduce((sum, test) => sum + test.download, 0) / testHistory.length,
    avgUpload: testHistory.reduce((sum, test) => sum + test.upload, 0) / testHistory.length,
    avgPing: testHistory.reduce((sum, test) => sum + test.ping, 0) / testHistory.length,
    maxDownload: Math.max(...testHistory.map(test => test.download)),
    minPing: Math.min(...testHistory.map(test => test.ping))
  } : null;

  function getQualityColor(quality: string): string {
    switch (quality) {
      case 'excellent': return '#10b981';
      case 'good': return '#34d399';
      case 'fair': return '#fbbf24';
      case 'poor': return '#ef4444';
      default: return '#6b7280';
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-sm">{`Test #${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}${entry.dataKey.includes('ping') || entry.dataKey.includes('jitter') ? 'ms' : entry.dataKey.includes('Loss') ? '%' : 'Mbps'}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (testHistory.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground" />
          <div>
            <h3 className="text-lg font-medium">No Performance Data</h3>
            <p className="text-muted-foreground">Run some speed tests to see performance charts</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Speed Over Time */}
      <Card className="glass-card lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            Speed Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="test" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="download"
                stackId="1"
                stroke="hsl(var(--accent))"
                fill="hsl(var(--accent) / 0.3)"
                name="Download"
              />
              <Area
                type="monotone"
                dataKey="upload"
                stackId="2"
                stroke="hsl(var(--success))"
                fill="hsl(var(--success) / 0.3)"
                name="Upload"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Latency Trends */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-warning" />
            Latency & Jitter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="test" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="ping"
                stroke="hsl(var(--warning))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--warning))', r: 4 }}
                name="Ping"
              />
              <Line
                type="monotone"
                dataKey="jitter"
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--destructive))', r: 4 }}
                name="Jitter"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Quality Distribution */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-primary" />
            Connection Quality
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
                        <p className="font-medium text-sm capitalize">{data.name}</p>
                        <p className="text-sm">{`Tests: ${data.value}`}</p>
                        <p className="text-sm">{`${((data.value / testHistory.length) * 100).toFixed(1)}%`}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {pieData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm capitalize">{entry.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Statistics */}
      {stats && (
        <Card className="glass-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="w-5 h-5 text-success" />
              Performance Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-accent" />
                </div>
                <p className="text-2xl font-bold font-mono">{stats.avgDownload.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">Avg Download</p>
                <p className="text-xs text-muted-foreground">Mbps</p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center">
                  <Zap className="w-6 h-6 text-success" />
                </div>
                <p className="text-2xl font-bold font-mono">{stats.avgUpload.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">Avg Upload</p>
                <p className="text-xs text-muted-foreground">Mbps</p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center">
                  <Clock className="w-6 h-6 text-warning" />
                </div>
                <p className="text-2xl font-bold font-mono">{stats.avgPing.toFixed(0)}</p>
                <p className="text-sm text-muted-foreground">Avg Ping</p>
                <p className="text-xs text-muted-foreground">ms</p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <p className="text-2xl font-bold font-mono">{stats.maxDownload.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">Peak Speed</p>
                <p className="text-xs text-muted-foreground">Mbps</p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center">
                  <Activity className="w-6 h-6 text-success" />
                </div>
                <p className="text-2xl font-bold font-mono">{stats.minPing.toFixed(0)}</p>
                <p className="text-sm text-muted-foreground">Best Ping</p>
                <p className="text-xs text-muted-foreground">ms</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PerformanceCharts;