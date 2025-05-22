
import matchesData from '@/data/matches.json';
import type { Match } from '@/types';
import { MatchForm } from '@/components/match-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Goal } from 'lucide-react'; // Changed SoccerBall to Goal

export default function HomePage() {
  const matches: Match[] = matchesData;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-background">
      <div className="max-w-3xl w-full">
        <header className="text-center mb-10">
          <div className="flex items-center justify-center space-x-3 mb-2">
            <Goal className="h-10 w-10 sm:h-12 sm:w-12 text-primary" /> {/* Changed SoccerBall to Goal */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary tracking-tight">
              Quiniela Liga MX
            </h1>
          </div>
          <p className="text-lg sm:text-xl text-foreground mt-3">
            ¡Demuestra tu pasión y conocimiento! Llena tus predicciones para la jornada.
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
        </footer>
      </div>
    </main>
  );
}
