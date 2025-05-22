
"use server";

import type { QuinielaFormValues, Match } from "@/types";
import matchesData from "@/data/matches.json";

interface SubmissionResult {
  success: boolean;
  message: string;
  data?: QuinielaFormValues;
}

export async function submitPredictionsAction(
  formData: QuinielaFormValues
): Promise<SubmissionResult> {
  try {
    // Validate predictions against available matches (optional, but good practice)
    const currentMatches: Match[] = matchesData;
    const matchIds = currentMatches.map(m => m.id);
    
    for (const matchId in formData.predictions) {
      if (!matchIds.includes(matchId)) {
        console.warn(`Received prediction for unknown match ID: ${matchId}`);
        // Optionally, filter out or handle unknown match IDs
      }
    }

    console.log("Received submission:");
    console.log("Name:", formData.name);
    console.log("Phone:", formData.phone);
    console.log("Predictions:", formData.predictions);

    // Here you would typically send the data to your API:
    // const response = await fetch('YOUR_API_ENDPOINT', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(formData), // Send the whole formData
    // });
    // if (!response.ok) {
    //   throw new Error('Failed to submit predictions to API');
    // }

    // For WhatsApp, you would typically use a service like Twilio API for WhatsApp
    // This would involve making an API call to that service.
    // Example (conceptual):
    // const messageBody = `Nombre: ${formData.name}\nTeléfono: ${formData.phone}\nPredicciones:\n` + 
    //   Object.entries(formData.predictions)
    //   .map(([matchId, result]) => `${matchId}: ${result}`) // You might want to map matchId to actual team names
    //   .join('\n');
    // await sendWhatsAppMessage('YOUR_WHATSAPP_NUMBER_OR_API', messageBody);

    return {
      success: true,
      message: "¡Quiniela enviada con éxito! Tus predicciones han sido registradas.",
      data: formData,
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
