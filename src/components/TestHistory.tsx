// Test History Component - Historical test data with export capabilities
// Features: Test history table, data export, filtering, search

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NetworkData } from './NetworkAnalyzer';
import { 
  History, 
  Download, 
  Search, 
  Filter, 
  FileText, 
  Trash2,
  ArrowUpDown,
  Calendar,
  Clock,
  TrendingUp,
  Upload as UploadIcon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TestHistoryProps {
  testHistory: NetworkData[];
}

type SortField = 'timestamp' | 'download' | 'upload' | 'ping' | 'quality';
type SortOrder = 'asc' | 'desc';

const TestHistory = ({ testHistory }: TestHistoryProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [qualityFilter, setQualityFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const { toast } = useToast();

  // Filter and sort data
  const filteredData = testHistory
    .filter(test => {
      const matchesSearch = searchTerm === '' || 
        test.quality.toLowerCase().includes(searchTerm.toLowerCase()) ||
        new Date(test.timestamp).toLocaleDateString().includes(searchTerm);
      
      const matchesQuality = qualityFilter === 'all' || test.quality === qualityFilter;
      
      return matchesSearch && matchesQuality;
    })
    .sort((a, b) => {
      let aValue: number | string = a[sortField];
      let bValue: number | string = b[sortField];
      
      if (sortField === 'timestamp') {
        aValue = a.timestamp;
        bValue = b.timestamp;
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return sortOrder === 'asc' 
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Time', 'Download (Mbps)', 'Upload (Mbps)', 'Ping (ms)', 'Jitter (ms)', 'Packet Loss (%)', 'Quality'];
    const csvData = filteredData.map(test => [
      new Date(test.timestamp).toLocaleDateString(),
      new Date(test.timestamp).toLocaleTimeString(),
      test.download.toFixed(1),
      test.upload.toFixed(1),
      test.ping.toString(),
      test.jitter.toString(),
      test.packetLoss.toFixed(2),
      test.quality
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `network-test-history-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Export Complete',
      description: `Exported ${filteredData.length} test records to CSV`,
    });
  };

  const exportToJSON = () => {
    const jsonData = JSON.stringify(filteredData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `network-test-history-${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Export Complete',
      description: `Exported ${filteredData.length} test records to JSON`,
    });
  };

  const clearHistory = () => {
    // In a real app, this would call a prop function to clear the history
    toast({
      title: 'Clear History',
      description: 'This would clear all test history in a real implementation',
      variant: 'destructive'
    });
  };

  const getQualityBadgeVariant = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'default';
      case 'good': return 'secondary';
      case 'fair': return 'outline';
      case 'poor': return 'destructive';
      default: return 'outline';
    }
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-auto p-1 font-medium"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className="w-3 h-3" />
      </div>
    </Button>
  );

  if (testHistory.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <History className="w-12 h-12 mx-auto text-muted-foreground" />
          <div>
            <h3 className="text-lg font-medium">No Test History</h3>
            <p className="text-muted-foreground">Your speed test results will appear here</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Test History ({filteredData.length} of {testHistory.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by quality or date..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Quality Filter */}
            <Select value={qualityFilter} onValueChange={setQualityFilter}>
              <SelectTrigger className="w-full md:w-40">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <SelectValue placeholder="Filter by quality" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Quality</SelectItem>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
                <SelectItem value="poor">Poor</SelectItem>
              </SelectContent>
            </Select>

            {/* Export Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportToJSON}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                JSON
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearHistory}
                className="flex items-center gap-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History Table */}
      <Card className="glass-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr className="text-left">
                  <th className="p-4">
                    <SortButton field="timestamp">
                      <Calendar className="w-4 h-4" />
                      Date & Time
                    </SortButton>
                  </th>
                  <th className="p-4">
                    <SortButton field="download">
                      <TrendingUp className="w-4 h-4" />
                      Download
                    </SortButton>
                  </th>
                  <th className="p-4">
                    <SortButton field="upload">
                      <UploadIcon className="w-4 h-4" />
                      Upload
                    </SortButton>
                  </th>
                  <th className="p-4">
                    <SortButton field="ping">
                      <Clock className="w-4 h-4" />
                      Ping/Jitter
                    </SortButton>
                  </th>
                  <th className="p-4">Packet Loss</th>
                  <th className="p-4">
                    <SortButton field="quality">Quality</SortButton>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((test, index) => (
                  <tr 
                    key={test.timestamp} 
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-4">
                      <div className="space-y-1">
                        <p className="font-medium text-sm">
                          {new Date(test.timestamp).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(test.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-accent" />
                        <span className="font-mono font-medium">
                          {test.download.toFixed(1)} Mbps
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <UploadIcon className="w-4 h-4 text-success" />
                        <span className="font-mono font-medium">
                          {test.upload.toFixed(1)} Mbps
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <p className="font-mono text-sm">{test.ping}ms</p>
                        <p className="font-mono text-xs text-muted-foreground">
                          ±{test.jitter}ms
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-sm">
                        {test.packetLoss.toFixed(2)}%
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge variant={getQualityBadgeVariant(test.quality)} className="capitalize">
                        {test.quality}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestHistory;