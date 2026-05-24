import { useMemo, useState } from 'react';
import { useTestResults } from '@/hooks/useLocalStorage';
import { Player, TestResult } from '@/types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowDown, ArrowUp, ClipboardList, Minus } from 'lucide-react';

interface Props {
  players: Player[];
}

export function TestStats({ players }: Props) {
  const { tests, isLoading } = useTestResults();
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [nameFilter, setNameFilter] = useState<string>('All');

  const types = useMemo(() => Array.from(new Set(tests.map(t => t.testType))).sort(), [tests]);

  const filteredByType = useMemo(
    () => (typeFilter === 'All' ? tests : tests.filter(t => t.testType === typeFilter)),
    [tests, typeFilter]
  );

  const names = useMemo(
    () => Array.from(new Set(filteredByType.map(t => t.testName))).sort(),
    [filteredByType]
  );

  // Reset name filter if no longer valid
  const effectiveName = nameFilter !== 'All' && !names.includes(nameFilter) ? 'All' : nameFilter;

  const filtered = useMemo(
    () => (effectiveName === 'All' ? filteredByType : filteredByType.filter(t => t.testName === effectiveName)),
    [filteredByType, effectiveName]
  );

  const activePlayers = useMemo(
    () => players.filter(p => p.status === 'Active').sort((a, b) => a.name.localeCompare(b.name, 'sv')),
    [players]
  );

  const latestByPlayer = useMemo(() => {
    const map = new Map<string, TestResult>();
    for (const t of filtered) {
      const current = map.get(t.playerId);
      if (!current || t.date > current.date) {
        map.set(t.playerId, t);
      }
    }
    return map;
  }, [filtered]);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Laddar…</p>;
  }

  if (tests.length === 0) {
    return (
      <div className="text-center py-12">
        <ClipboardList className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-muted-foreground">Inga testresultat registrerade ännu</p>
        <p className="text-sm text-muted-foreground mt-1">
          Registrera tester via spelarprofilen
        </p>
      </div>
    );
  }

  const showNameCol = effectiveName === 'All';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={typeFilter === 'All' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTypeFilter('All')}
          >
            Alla typer
          </Button>
          {types.map(t => (
            <Button
              key={t}
              variant={typeFilter === t ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter(t)}
            >
              {t}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Test:</span>
          <Select value={effectiveName} onValueChange={setNameFilter}>
            <SelectTrigger className="w-[260px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">Alla tester</SelectItem>
              {names.map(n => (
                <SelectItem key={n} value={n}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Spelare</TableHead>
              {showNameCol && <TableHead>Test</TableHead>}
              <TableHead>Senaste resultat</TableHead>
              <TableHead>Datum</TableHead>
              <TableHead className="text-right">Trend</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activePlayers.map(p => {
              const r = latestByPlayer.get(p.id);
              return (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">
                    #{p.jerseyNumber} {p.name}
                  </TableCell>
                  {showNameCol && (
                    <TableCell className="text-muted-foreground">
                      {r?.testName ?? '—'}
                    </TableCell>
                  )}
                  <TableCell>{r?.result ?? '—'}</TableCell>
                  <TableCell className="text-muted-foreground">{r?.date ?? '—'}</TableCell>
                  <TableCell className="text-right">
                    {r ? (
                      r.trend === 'up' ? (
                        <ArrowUp className="h-4 w-4 inline text-success" />
                      ) : r.trend === 'down' ? (
                        <ArrowDown className="h-4 w-4 inline text-destructive" />
                      ) : (
                        <Minus className="h-4 w-4 inline text-muted-foreground" />
                      )
                    ) : (
                      '—'
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}