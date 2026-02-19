import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TestResult, Player } from '@/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TestResultFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  test?: TestResult | null;
  players: Player[];
  onSave: (tests: TestResult[]) => void;
  onDelete?: (id: string) => void;
  defaultPlayerId?: string;
}

type Mode = 'single' | 'group';

interface PlayerRow {
  playerId: string;
  checked: boolean;
  result: string;
  previousResult: string;
  trend: TestResult['trend'];
}

export function TestResultFormDialog({
  open,
  onOpenChange,
  test,
  players,
  onSave,
  onDelete,
  defaultPlayerId,
}: TestResultFormDialogProps) {
  const isEditing = !!test;
  const [mode, setMode] = useState<Mode>('single');

  // Shared fields (single + group)
  const [sharedFields, setSharedFields] = useState({
    testType: 'Fitness' as TestResult['testType'],
    testName: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  });

  // Single-player fields
  const [singleFields, setSingleFields] = useState({
    playerId: '',
    result: '',
    previousResult: '',
    trend: 'same' as TestResult['trend'],
  });

  // Group-player rows
  const [playerRows, setPlayerRows] = useState<PlayerRow[]>([]);

  useEffect(() => {
    if (test) {
      setMode('single');
      setSharedFields({ testType: test.testType, testName: test.testName, date: test.date });
      setSingleFields({
        playerId: test.playerId,
        result: test.result,
        previousResult: test.previousResult || '',
        trend: test.trend,
      });
    } else {
      setMode('single');
      setSharedFields({
        testType: 'Fitness',
        testName: '',
        date: format(new Date(), 'yyyy-MM-dd'),
      });
      setSingleFields({
        playerId: defaultPlayerId || players[0]?.id || '',
        result: '',
        previousResult: '',
        trend: 'same',
      });
      setPlayerRows(
        players.map((p) => ({
          playerId: p.id,
          checked: false,
          result: '',
          previousResult: '',
          trend: 'same',
        }))
      );
    }
  }, [test, players, open, defaultPlayerId]);

  const updatePlayerRow = (playerId: string, updates: Partial<PlayerRow>) => {
    setPlayerRows((rows) =>
      rows.map((r) => (r.playerId === playerId ? { ...r, ...updates } : r))
    );
  };

  const checkedRows = playerRows.filter((r) => r.checked);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing || mode === 'single') {
      const result: TestResult = {
        id: test?.id || crypto.randomUUID(),
        playerId: singleFields.playerId,
        testType: sharedFields.testType,
        testName: sharedFields.testName,
        date: sharedFields.date,
        result: singleFields.result,
        previousResult: singleFields.previousResult || undefined,
        trend: singleFields.trend,
      };
      onSave([result]);
    } else {
      const results: TestResult[] = checkedRows.map((row) => ({
        id: crypto.randomUUID(),
        playerId: row.playerId,
        testType: sharedFields.testType,
        testName: sharedFields.testName,
        date: sharedFields.date,
        result: row.result,
        previousResult: row.previousResult || undefined,
        trend: row.trend,
      }));
      onSave(results);
    }

    onOpenChange(false);
  };

  const isGroupValid = mode === 'group' && checkedRows.length > 0 && checkedRows.every((r) => r.result.trim() !== '');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{test ? 'Edit Test Result' : 'Add Test Result'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mode toggle — only shown when creating */}
          {!isEditing && (
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                type="button"
                className={cn(
                  'flex-1 py-2 text-sm font-medium transition-colors',
                  mode === 'single'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background text-muted-foreground hover:text-foreground'
                )}
                onClick={() => setMode('single')}
              >
                Single Player
              </button>
              <button
                type="button"
                className={cn(
                  'flex-1 py-2 text-sm font-medium transition-colors',
                  mode === 'group'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background text-muted-foreground hover:text-foreground'
                )}
                onClick={() => setMode('group')}
              >
                Group Test
              </button>
            </div>
          )}

          {/* Shared fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Test Type</Label>
              <Select
                value={sharedFields.testType}
                onValueChange={(v) => setSharedFields({ ...sharedFields, testType: v as TestResult['testType'] })}
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
                value={sharedFields.date}
                onChange={(e) => setSharedFields({ ...sharedFields, date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="testName">Test Name</Label>
            <Input
              id="testName"
              value={sharedFields.testName}
              onChange={(e) => setSharedFields({ ...sharedFields, testName: e.target.value })}
              placeholder="e.g., Sprint Test, Shooting Accuracy"
              required
            />
          </div>

          {/* Single player mode */}
          {(isEditing || mode === 'single') && (
            <>
              {!isEditing && (
                <div className="grid gap-2">
                  <Label>Player</Label>
                  <Select
                    value={singleFields.playerId}
                    onValueChange={(v) => setSingleFields({ ...singleFields, playerId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select player" />
                    </SelectTrigger>
                    <SelectContent>
                      {players.map((player) => (
                        <SelectItem key={player.id} value={player.id}>
                          #{player.jerseyNumber} {player.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="result">Result</Label>
                  <Input
                    id="result"
                    value={singleFields.result}
                    onChange={(e) => setSingleFields({ ...singleFields, result: e.target.value })}
                    placeholder="e.g., 4.2s, 85%"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="previousResult">Previous Result</Label>
                  <Input
                    id="previousResult"
                    value={singleFields.previousResult}
                    onChange={(e) => setSingleFields({ ...singleFields, previousResult: e.target.value })}
                    placeholder="e.g., 4.5s, 82%"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Trend</Label>
                <Select
                  value={singleFields.trend}
                  onValueChange={(v) => setSingleFields({ ...singleFields, trend: v as TestResult['trend'] })}
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
            </>
          )}

          {/* Group mode */}
          {!isEditing && mode === 'group' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Players & Results</Label>
                {checkedRows.length > 0 && (
                  <span className="text-xs text-muted-foreground">{checkedRows.length} selected</span>
                )}
              </div>

              <ScrollArea className="h-64 rounded-md border border-border">
                <div className="divide-y divide-border">
                  {players.map((player) => {
                    const row = playerRows.find((r) => r.playerId === player.id);
                    if (!row) return null;

                    return (
                      <div key={player.id} className="p-3">
                        <div className="flex items-center gap-3 mb-2">
                          <Checkbox
                            id={`check-${player.id}`}
                            checked={row.checked}
                            onCheckedChange={(checked) =>
                              updatePlayerRow(player.id, { checked: !!checked })
                            }
                          />
                          <label
                            htmlFor={`check-${player.id}`}
                            className="text-sm font-medium cursor-pointer select-none"
                          >
                            <span className="text-muted-foreground mr-1">#{player.jerseyNumber}</span>
                            {player.name}
                          </label>
                        </div>

                        {row.checked && (
                          <div className="ml-7 grid grid-cols-3 gap-2">
                            <div>
                              <Input
                                placeholder="Result *"
                                value={row.result}
                                onChange={(e) => updatePlayerRow(player.id, { result: e.target.value })}
                                className="h-8 text-sm"
                              />
                            </div>
                            <div>
                              <Input
                                placeholder="Prev result"
                                value={row.previousResult}
                                onChange={(e) => updatePlayerRow(player.id, { previousResult: e.target.value })}
                                className="h-8 text-sm"
                              />
                            </div>
                            <div>
                              <Select
                                value={row.trend}
                                onValueChange={(v) => updatePlayerRow(player.id, { trend: v as TestResult['trend'] })}
                              >
                                <SelectTrigger className="h-8 text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="up">↑ Better</SelectItem>
                                  <SelectItem value="same">→ Same</SelectItem>
                                  <SelectItem value="down">↓ Worse</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          )}

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
            <Button
              type="submit"
              disabled={mode === 'group' && !isEditing && !isGroupValid}
            >
              {isEditing
                ? 'Save Changes'
                : mode === 'group'
                ? `Save ${checkedRows.length > 0 ? checkedRows.length : ''} Result${checkedRows.length !== 1 ? 's' : ''}`
                : 'Add Test'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
