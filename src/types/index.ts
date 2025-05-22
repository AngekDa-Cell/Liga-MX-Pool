
export interface Match {
  id: string;
  localTeam: string;
  visitorTeam: string;
  localLogoUrl: string;
  visitorLogoUrl: string;
}

export type PredictionValue = "local" | "tie" | "visitor";

export type Predictions = Record<string, PredictionValue>;
