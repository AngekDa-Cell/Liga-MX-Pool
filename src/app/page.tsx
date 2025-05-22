
import matchesData from '@/data/matches.json';
import type { Match } from '@/types';
import { MatchForm } from '@/components/match-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

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
        
        <Card className="shadow-xl mb-8">
          <CardContent className="p-6 sm:p-8">
            <MatchForm matches={matches} />
          </CardContent>
        </Card>

        <Card className="shadow-lg border-accent">
          <CardHeader className="flex flex-row items-center justify-center space-x-3 pb-2 pt-6">
            <Trophy className="h-8 w-8 text-accent" />
            <CardTitle className="text-2xl font-semibold text-accent">¡A Jugar!</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-2 text-center">
            <p className="text-muted-foreground italic">
              "El fútbol es el deporte más hermoso del mundo. No se juega con los pies, se juega con el corazón."
            </p>
            <p className="text-sm text-foreground mt-4">
              ¡Que gane el mejor y que la pasión por el fútbol nos una!
            </p>
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
