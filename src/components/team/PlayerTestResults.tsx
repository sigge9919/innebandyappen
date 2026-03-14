import { TestResult } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlayerTestResultsProps {
  tests: TestResult[];
  onTestClick: (test: TestResult) => void;
}

const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'same' }) => {
  if (trend === 'up') return <TrendingUp className="h-4 w-4 text-success" />;
  if (trend === 'down') return <TrendingDown className="h-4 w-4 text-destructive" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
};

export function PlayerTestResults({ tests, onTestClick }: PlayerTestResultsProps) {
  if (tests.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <ClipboardList className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Inga testresultat ännu</p>
        </CardContent>
      </Card>
    );
  }
  
  // Sort tests by date, newest first
  const sortedTests = [...tests].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {sortedTests.map((test) => (
            <div
              key={test.id}
              onClick={() => onTestClick(test)}
              className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground">{test.testName}</p>
                  <Badge variant="outline" className="text-xs">
                    {test.testType}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {new Date(test.date).toLocaleDateString()}
                </p>
              </div>

              <div className="text-right flex items-center gap-3">
                <div>
                  <p className="font-bold text-foreground">{test.result}</p>
                  {test.previousResult && (
                    <p className="text-xs text-muted-foreground">
                      förra: {test.previousResult}
                    </p>
                  )}
                </div>
                <TrendIcon trend={test.trend} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
