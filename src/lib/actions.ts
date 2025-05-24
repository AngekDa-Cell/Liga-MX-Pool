"use server";

import type { QuinielaFormValues, Match } from "@/types";
import matchesData from "@/data/matches.json";
// import * as XLSX from 'xlsx'; // No longer needed for direct DB saving
// import * as fs from 'fs'; // No longer needed for direct DB saving
// import path from 'path'; // No longer needed for direct DB saving

// Import Prisma Client
// import { PrismaClient } from '@prisma/client';
import { prisma } from "./prisma"; // Import the prisma instance
// const prisma = new PrismaClient();

interface SubmissionResult {
  success: boolean;
  message: string;
  data?: QuinielaFormValues;
}

export async function submitPredictionsAction(
  formData: QuinielaFormValues
): Promise<SubmissionResult> {
  try {
    const currentMatches: Match[] = matchesData;
    const matchIds = currentMatches.map(m => m.id);
    
    for (const matchId in formData.predictions) {
      if (!matchIds.includes(matchId)) {
        console.warn(`Received prediction for unknown match ID: ${matchId}`);
      }
    }

    console.log("Received submission:");
    console.log("Name:", formData.name);
    // console.log("Phone:", formData.phone); // Phone is still available in formData if needed for WhatsApp

    // --- INICIO: Lógica para guardar en Base de Datos (usando Prisma) ---
    
    // Transform predictions for database storage if necessary.
    // For simplicity, we'll store the predictions object as JSON.
    // Ensure your Prisma schema for the 'predictions' field is of type Json.
    const submissionData = {
      name: formData.name,
      predictions: formData.predictions, // Storing the raw predictions object
      // You might want to add other fields like a jornadaId, timestamp, etc.
    };

    await prisma.quinielaSubmission.create({
      data: submissionData,
    });
    
    console.log("Datos guardados en la base de datos.");
    // --- FIN: Lógica para guardar en Base de Datos ---

    // --- Código de Excel comentado por si lo necesitas como referencia o para una funcionalidad de descarga ---
    /*
    const excelFilePath = path.resolve(process.cwd(), 'quinielas.xlsx');
    const newRow: any = {
      Nombre: formData.name,
    };
    currentMatches.forEach(match => {
      const prediction = formData.predictions[match.id];
      let predictionText = '';
      if (prediction) {
        if (Array.isArray(prediction)) { 
          predictionText = prediction.join(', ');
        } else {
          predictionText = prediction as string;
        }
      }
      newRow[`${match.localTeam} vs ${match.visitorTeam}`] = predictionText;
    });
    let workbook;
    let worksheet;
    const sheetName = 'Quinielas';
    if (fs.existsSync(excelFilePath)) {
      workbook = XLSX.readFile(excelFilePath);
      if (workbook.SheetNames.includes(sheetName)) {
        worksheet = workbook.Sheets[sheetName];
        XLSX.utils.sheet_add_json(worksheet, [newRow], { skipHeader: true, origin: -1 });
      } else { 
        worksheet = XLSX.utils.json_to_sheet([newRow]);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      }
    } else {
      workbook = XLSX.utils.book_new();
      worksheet = XLSX.utils.json_to_sheet([newRow]); 
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    }
    XLSX.writeFile(workbook, excelFilePath);
    console.log(`Datos guardados en ${excelFilePath}`);
    */
    // --- FIN: Lógica de Excel comentada ---

    // WhatsApp logic would remain here, using formData.phone and formData.name
    // Example (conceptual):
    // const messageBody = `Nombre: ${formData.name}\nTeléfono: ${formData.phone}\nPredicciones:\n` + 
    //   Object.entries(formData.predictions)
    //   .map(([matchId, result]) => {
    //      const matchDetails = currentMatches.find(m => m.id === matchId);
    //      const matchName = matchDetails ? `${matchDetails.localTeam} vs ${matchDetails.visitorTeam}` : matchId;
    //      return `${matchName}: ${Array.isArray(result) ? result.join(', ') : result}`;
    //   })
    //   .join('\n');
    // await sendWhatsAppMessage('YOUR_WHATSAPP_NUMBER_OR_API', messageBody);

    return {
      success: true,
      message: "¡Quiniela enviada con éxito! Tus predicciones han sido registradas en la base de datos.",
      data: formData,
    };
  } catch (error) {
    console.error("Error submitting predictions:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    // It's good practice to also disconnect Prisma client on error or when the app shuts down,
    // but for serverless functions, Prisma handles connections efficiently.
    // await prisma.$disconnect(); 
    return {
      success: false,
      message: `Error al enviar la quiniela: ${errorMessage}`,
    };
  }
}
