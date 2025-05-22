
export interface Match {
  id: string;
  localTeam: string;
  visitorTeam: string;
  localLogoUrl: string;
  visitorLogoUrl: string;
}

export type PredictionValue = "local" | "tie" | "visitor";

// Este tipo es para las predicciones individuales de los partidos
export type MatchPredictions = Record<string, PredictionValue | undefined>;

// Este tipo representa todos los datos del formulario, incluida la información del usuario
export interface QuinielaFormValues {
  name: string;
  phone: string;
  predictions: MatchPredictions;
}
