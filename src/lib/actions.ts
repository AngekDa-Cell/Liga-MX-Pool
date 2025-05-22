
"use server";

import type { Predictions, Match } from "@/types";
import matchesData from "@/data/matches.json";

interface SubmissionResult {
  success: boolean;
  message: string;
  data?: Predictions;
}

export async function submitPredictionsAction(
  predictions: Predictions
): Promise<SubmissionResult> {
  try {
    // Validate predictions against available matches (optional, but good practice)
    const currentMatches: Match[] = matchesData;
    const matchIds = currentMatches.map(m => m.id);
    
    for (const matchId in predictions) {
      if (!matchIds.includes(matchId)) {
        console.warn(`Received prediction for unknown match ID: ${matchId}`);
        // Optionally, filter out or handle unknown match IDs
      }
    }

    console.log("Received predictions:", predictions);

    // Here you would typically send the data to your API:
    // const response = await fetch('YOUR_API_ENDPOINT', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(predictions),
    // });
    // if (!response.ok) {
    //   throw new Error('Failed to submit predictions to API');
    // }

    // For WhatsApp, you would typically use a service like Twilio API for WhatsApp
    // This would involve making an API call to that service.
    // Example (conceptual):
    // const messageBody = Object.entries(predictions)
    //   .map(([matchId, result]) => `${matchId}: ${result}`)
    //   .join('\n');
    // await sendWhatsAppMessage('YOUR_WHATSAPP_NUMBER_OR_API', messageBody);

    return {
      success: true,
      message: "¡Quiniela enviada con éxito! Tus predicciones han sido registradas.",
      data: predictions,
    };
  } catch (error) {
    console.error("Error submitting predictions:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return {
      success: false,
      message: `Error al enviar la quiniela: ${errorMessage}`,
    };
  }
}
