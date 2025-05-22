
import matchesData from '@/data/matches.json';
import type { Match } from '@/types';
import { MatchForm } from '@/components/match-form';
import { Card, CardContent } from '@/components/ui/card';

export default function HomePage() {
  const matches: Match[] = matchesData;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-background">
      <div className="max-w-3xl w-full">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-primary tracking-tight">
            Quiniela Liga MX
          </h1>
          <p className="text-lg sm:text-xl text-foreground mt-3">
            Llena tus predicciones para la jornada semanal
          </p>
        </header>
        
        <Card className="shadow-xl">
          <CardContent className="p-6 sm:p-8">
            <MatchForm matches={matches} />
          </CardContent>
        </Card>

        <footer className="text-center mt-12 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Liga MX Pool. Todos los derechos reservados.</p>
          <p className="mt-1">Modifica los partidos localmente en `src/data/matches.json`.</p>
        </footer>
      </div>
    </main>
  );
}
