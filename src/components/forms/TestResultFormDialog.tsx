import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TestResult, Player } from '@/types';
import { useTestTypes } from '@/hooks/useLocalStorage';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Plus, X } from 'lucide-react';

interface TestResultFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  test?: TestResult | null;
  players: Player[];
  allTests?: TestResult[];
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
  open, onOpenChange, test, players, allTests = [], onSave, onDelete, defaultPlayerId,
}: TestResultFormDialogProps) {
  const isEditing = !!test;
  const { testTypes, addTestType } = useTestTypes();

  const [mode, setMode] = useState<Mode>('single');
  const [newTypeInput, setNewTypeInput] = useState('');
  const [showNewTypeInput, setShowNewTypeInput] = useState(false);

  const [sharedFields, setSharedFields] = useState({
    testType: '', testName: '', date: format(new Date(), 'yyyy-MM-dd'),
  });

  const [singleFields, setSingleFields] = useState({
    playerId: '', result: '', previousResult: '', trend: 'same' as TestResult['trend'],
  });

  const [playerRows, setPlayerRows] = useState<PlayerRow[]>([]);

  const getPrevResult = (playerId: string, testName: string): string => {
    if (!testName.trim()) return '';
    const matches = allTests
      .filter(t => t.playerId === playerId && t.testName.toLowerCase() === testName.toLowerCase())
      .filter(t => !isEditing || t.id !== test?.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return matches[0]?.result ?? '';
  };

  useEffect(() => {
    if (!open) return;
    if (test) {
      setMode('single');
      setSharedFields({ testType: test.testType, testName: test.testName, date: test.date });
      setSingleFields({ playerId: test.playerId, result: test.result, previousResult: test.previousResult || '', trend: test.trend });
    } else {
      setMode('single');
      const defaultType = testTypes[0] ?? 'Fitness';
      setSharedFields({ testType: defaultType, testName: '', date: format(new Date(), 'yyyy-MM-dd') });
      setSingleFields({ playerId: defaultPlayerId || players[0]?.id || '', result: '', previousResult: '', trend: 'same' });
      setPlayerRows(players.map((p) => ({ playerId: p.id, checked: false, result: '', previousResult: '', trend: 'same' })));
    }
    setShowNewTypeInput(false);
    setNewTypeInput('');
  }, [test, players, open, defaultPlayerId, testTypes]);

  const autoPrevSingle = useMemo(() => {
    if (isEditing) return '';
    return getPrevResult(singleFields.playerId, sharedFields.testName);
  }, [singleFields.playerId, sharedFields.testName, allTests, isEditing]);

  useEffect(() => {
    if (!isEditing && mode === 'single') {
      setSingleFields(f => ({ ...f, previousResult: autoPrevSingle }));
    }
  }, [autoPrevSingle, isEditing, mode]);

  useEffect(() => {
    if (isEditing || mode !== 'group') return;
    setPlayerRows(rows => rows.map(row => ({ ...row, previousResult: getPrevResult(row.playerId, sharedFields.testName) })));
  }, [sharedFields.testName, mode, allTests, isEditing]);

  const updatePlayerRow = (playerId: string, updates: Partial<PlayerRow>) => {
    setPlayerRows(rows => rows.map(r => (r.playerId === playerId ? { ...r, ...updates } : r)));
  };

  const checkedRows = playerRows.filter(r => r.checked);

  const handleAddNewType = async () => {
    const trimmed = newTypeInput.trim();
    if (!trimmed || testTypes.includes(trimmed)) return;
    await addTestType(trimmed);
    setSharedFields(f => ({ ...f, testType: trimmed }));
    setNewTypeInput('');
    setShowNewTypeInput(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing || mode === 'single') {
      const result: TestResult = {
        id: test?.id || crypto.randomUUID(),
        playerId: singleFields.playerId,
        testType: sharedFields.testType as TestResult['testType'],
        testName: sharedFields.testName,
        date: sharedFields.date,
        result: singleFields.result,
        previousResult: singleFields.previousResult || undefined,
        trend: singleFields.trend,
      };
      onSave([result]);
    } else {
      const results: TestResult[] = checkedRows.map(row => ({
        id: crypto.randomUUID(), playerId: row.playerId,
        testType: sharedFields.testType as TestResult['testType'],
        testName: sharedFields.testName, date: sharedFields.date,
        result: row.result, previousResult: row.previousResult || undefined, trend: row.trend,
      }));
      onSave(results);
    }
    onOpenChange(false);
  };

  const isGroupValid = mode === 'group' && checkedRows.length > 0 && checkedRows.every(r => r.result.trim() !== '');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{test ? 'Redigera testresultat' : 'Lägg till testresultat'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isEditing && (
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button type="button" className={cn('flex-1 py-2 text-sm font-medium transition-colors', mode === 'single' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:text-foreground')} onClick={() => setMode('single')}>
                Enskild spelare
              </button>
              <button type="button" className={cn('flex-1 py-2 text-sm font-medium transition-colors', mode === 'group' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:text-foreground')} onClick={() => setMode('group')}>
                Grupptest
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Testtyp</Label>
              {showNewTypeInput ? (
                <div className="flex gap-1">
                  <Input autoFocus value={newTypeInput} onChange={e => setNewTypeInput(e.target.value)} placeholder="Nytt typnamn" className="h-9" onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddNewType(); } }} />
                  <Button type="button" size="sm" onClick={handleAddNewType} className="h-9 px-2"><Plus className="h-4 w-4" /></Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setShowNewTypeInput(false)} className="h-9 px-2"><X className="h-4 w-4" /></Button>
                </div>
              ) : (
                <Select value={sharedFields.testType} onValueChange={v => { if (v === '__new__') { setShowNewTypeInput(true); return; } setSharedFields(f => ({ ...f, testType: v })); }}>
                  <SelectTrigger><SelectValue placeholder="Välj typ" /></SelectTrigger>
                  <SelectContent>
                    {testTypes.map(t => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
                    <SelectItem value="__new__"><span className="flex items-center gap-1 text-primary"><Plus className="h-3 w-3" /> Lägg till ny typ…</span></SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Datum</Label>
              <Input id="date" type="date" value={sharedFields.date} onChange={e => setSharedFields(f => ({ ...f, date: e.target.value }))} required />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="testName">Testnamn</Label>
            <Input id="testName" value={sharedFields.testName} onChange={e => setSharedFields(f => ({ ...f, testName: e.target.value }))} placeholder="t.ex. Sprinttest, Skottträffsäkerhet" required />
          </div>

          {(isEditing || mode === 'single') && (
            <>
              {!isEditing && (
                <div className="grid gap-2">
                  <Label>Spelare</Label>
                  <Select value={singleFields.playerId} onValueChange={v => setSingleFields(f => ({ ...f, playerId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Välj spelare" /></SelectTrigger>
                    <SelectContent>
                      {players.map(player => (<SelectItem key={player.id} value={player.id}>#{player.jerseyNumber} {player.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="result">Resultat</Label>
                  <Input id="result" value={singleFields.result} onChange={e => setSingleFields(f => ({ ...f, result: e.target.value }))} placeholder="t.ex. 4.2s, 85%" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="previousResult">
                    Föregående resultat
                    {!isEditing && singleFields.previousResult && (<span className="text-xs text-muted-foreground ml-1">(auto)</span>)}
                  </Label>
                  <Input id="previousResult" value={singleFields.previousResult} onChange={e => setSingleFields(f => ({ ...f, previousResult: e.target.value }))} placeholder="t.ex. 4.5s, 82%" />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Trend</Label>
                <Select value={singleFields.trend} onValueChange={v => setSingleFields(f => ({ ...f, trend: v as TestResult['trend'] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="up">Förbättring</SelectItem>
                    <SelectItem value="same">Oförändrad</SelectItem>
                    <SelectItem value="down">Försämring</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {!isEditing && mode === 'group' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Spelare & resultat</Label>
                {checkedRows.length > 0 && (<span className="text-xs text-muted-foreground">{checkedRows.length} valda</span>)}
              </div>

              <ScrollArea className="h-64 rounded-md border border-border">
                <div className="divide-y divide-border">
                  {players.map(player => {
                    const row = playerRows.find(r => r.playerId === player.id);
                    if (!row) return null;
                    return (
                      <div key={player.id} className="p-3">
                        <div className="flex items-center gap-3 mb-2">
                          <Checkbox id={`check-${player.id}`} checked={row.checked} onCheckedChange={checked => updatePlayerRow(player.id, { checked: !!checked })} />
                          <label htmlFor={`check-${player.id}`} className="text-sm font-medium cursor-pointer select-none">
                            <span className="text-muted-foreground mr-1">#{player.jerseyNumber}</span>
                            {player.name}
                          </label>
                          {row.previousResult && (<span className="text-xs text-muted-foreground ml-auto">föreg: {row.previousResult}</span>)}
                        </div>
                        {row.checked && (
                          <div className="ml-7 grid grid-cols-3 gap-2">
                            <Input placeholder="Resultat *" value={row.result} onChange={e => updatePlayerRow(player.id, { result: e.target.value })} className="h-8 text-sm" />
                            <Input placeholder="Föreg. resultat" value={row.previousResult} onChange={e => updatePlayerRow(player.id, { previousResult: e.target.value })} className="h-8 text-sm" />
                            <Select value={row.trend} onValueChange={v => updatePlayerRow(player.id, { trend: v as TestResult['trend'] })}>
                              <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="up">↑ Bättre</SelectItem>
                                <SelectItem value="same">→ Samma</SelectItem>
                                <SelectItem value="down">↓ Sämre</SelectItem>
                              </SelectContent>
                            </Select>
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
              <Button type="button" variant="destructive" onClick={() => { onDelete(test.id); onOpenChange(false); }}>Ta bort</Button>
            )}
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Avbryt</Button>
            <Button type="submit" disabled={mode === 'group' && !isEditing && !isGroupValid}>
              {isEditing
                ? 'Spara ändringar'
                : mode === 'group'
                ? `Spara ${checkedRows.length > 0 ? checkedRows.length : ''} resultat`
                : 'Lägg till test'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
