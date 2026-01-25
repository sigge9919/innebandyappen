import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TestResult, Player } from '@/types';
import { format } from 'date-fns';

interface TestResultFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  test?: TestResult | null;
  players: Player[];
  onSave: (test: TestResult) => void;
  onDelete?: (id: string) => void;
}

export function TestResultFormDialog({ 
  open, 
  onOpenChange, 
  test, 
  players, 
  onSave, 
  onDelete 
}: TestResultFormDialogProps) {
  const [formData, setFormData] = useState({
    playerId: '',
    testType: 'Fitness' as TestResult['testType'],
    testName: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    result: '',
    previousResult: '',
    trend: 'same' as TestResult['trend'],
  });

  useEffect(() => {
    if (test) {
      setFormData({
        playerId: test.playerId,
        testType: test.testType,
        testName: test.testName,
        date: test.date,
        result: test.result,
        previousResult: test.previousResult || '',
        trend: test.trend,
      });
    } else {
      setFormData({
        playerId: players[0]?.id || '',
        testType: 'Fitness',
        testName: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        result: '',
        previousResult: '',
        trend: 'same',
      });
    }
  }, [test, players, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTest: TestResult = {
      id: test?.id || crypto.randomUUID(),
      playerId: formData.playerId,
      testType: formData.testType,
      testName: formData.testName,
      date: formData.date,
      result: formData.result,
      previousResult: formData.previousResult || undefined,
      trend: formData.trend,
    };
    onSave(newTest);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{test ? 'Edit Test Result' : 'Add Test Result'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="player">Player</Label>
              <Select
                value={formData.playerId}
                onValueChange={(value) => setFormData({ ...formData, playerId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select player" />
                </SelectTrigger>
                <SelectContent>
                  {players.map(player => (
                    <SelectItem key={player.id} value={player.id}>
                      #{player.jerseyNumber} {player.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="testType">Test Type</Label>
                <Select
                  value={formData.testType}
                  onValueChange={(value) => setFormData({ ...formData, testType: value as TestResult['testType'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fitness">Fitness</SelectItem>
                    <SelectItem value="Skill">Skill</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="testName">Test Name</Label>
              <Input
                id="testName"
                value={formData.testName}
                onChange={(e) => setFormData({ ...formData, testName: e.target.value })}
                placeholder="e.g., Sprint Test, Shooting Accuracy"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="result">Result</Label>
                <Input
                  id="result"
                  value={formData.result}
                  onChange={(e) => setFormData({ ...formData, result: e.target.value })}
                  placeholder="e.g., 4.2s, 85%"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="previousResult">Previous Result</Label>
                <Input
                  id="previousResult"
                  value={formData.previousResult}
                  onChange={(e) => setFormData({ ...formData, previousResult: e.target.value })}
                  placeholder="e.g., 4.5s, 82%"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="trend">Trend</Label>
              <Select
                value={formData.trend}
                onValueChange={(value) => setFormData({ ...formData, trend: value as TestResult['trend'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="up">Improving</SelectItem>
                  <SelectItem value="same">No Change</SelectItem>
                  <SelectItem value="down">Declining</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            {test && onDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  onDelete(test.id);
                  onOpenChange(false);
                }}
              >
                Delete
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {test ? 'Save Changes' : 'Add Test'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
