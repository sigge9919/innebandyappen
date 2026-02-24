import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TestResult } from '@/types';
import { TrendingUp } from 'lucide-react';

interface PlayerTestTrendsProps {
  tests: TestResult[];
}

export function PlayerTestTrends({ tests }: PlayerTestTrendsProps) {
  const chartsByTest = useMemo(() => {
    if (tests.length === 0) return [];

    // Group by testName
    const grouped: Record<string, TestResult[]> = {};
    for (const t of tests) {
      (grouped[t.testName] ||= []).push(t);
    }

    // Only show tests with 2+ data points
    return Object.entries(grouped)
      .filter(([, items]) => items.length >= 2)
      .map(([testName, items]) => {
        const sorted = [...items].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        const data = sorted.map(t => ({
          date: new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          value: parseFloat(t.result) || 0,
        }));
        const testType = items[0].testType;
        return { testName, testType, data };
      });
  }, [tests]);

  if (chartsByTest.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-primary" />
        Test Trends
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        {chartsByTest.map(({ testName, testType, data }) => (
          <Card key={testName}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {testName}
                <span className="text-xs text-muted-foreground ml-2 font-normal">{testType}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{ value: { label: testName, color: 'hsl(var(--chart-1))' } }}
                className="h-[180px] w-full"
              >
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals domain={['auto', 'auto']} tick={{ fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="var(--color-value)"
                    strokeWidth={2}
                    dot={{ r: 4, fill: 'var(--color-value)', strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
