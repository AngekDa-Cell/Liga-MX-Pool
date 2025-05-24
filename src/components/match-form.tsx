"use client";

import type { ChangeEvent } from "react";
import React, { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z, type ZodEnum, type ZodObject } from "zod";
import Image from "next/image";

import type { Match, MatchPredictions, QuinielaFormValues } from "@/types";
import { submitPredictionsAction } from "@/lib/actions";

// Define PredictionValue type if not imported
type PredictionValue = "local" | "tie" | "visitor";

// Define a more flexible type for individual quiniela predictions
type QuinielaStateEntry = Record<string, PredictionValue | PredictionValue[] | undefined>;

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Minus } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface MatchFormProps {
  matches: Match[];
}

// Define PredictionValue type if not imported (assuming it's already defined or imported)
// type PredictionValue = "local" | "tie" | "visitor";

// Define a more flexible type for individual quiniela predictions (assuming it's already defined or imported)
// type QuinielaStateEntry = Record<string, PredictionValue | PredictionValue[] | undefined>;

const resultMap: Record<PredictionValue, string> = { local: "L", tie: "E", visitor: "V" };

export function MatchForm({ matches }: MatchFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [multiSelect, setMultiSelect] = useState(false);

  const createNewQuinielaEntry = (isMultiSelectMode: boolean): QuinielaStateEntry => {
    return matches.reduce((acc, match) => {
      acc[match.id] = isMultiSelectMode ? [] : undefined;
      return acc;
    }, {} as QuinielaStateEntry);
  };

  const [activeQuiniela, setActiveQuiniela] = useState<QuinielaStateEntry>(() => createNewQuinielaEntry(multiSelect));
  const [submittedQuinielas, setSubmittedQuinielas] = useState<QuinielaStateEntry[]>([]);

  // Formulario para nombre y teléfono
  const form = useForm<{ name: string; phone: string }>({
    defaultValues: { name: "", phone: "" },
  });

  // Maneja cambios en la quiniela activa (multi-select)
  const handlePredictionChange = (matchId: string, value: PredictionValue) => {
    setActiveQuiniela((prev) => {
      const currentMatchPredictions = prev[matchId];
      let newMatchPredictions: PredictionValue[];
      const currentArray = Array.isArray(currentMatchPredictions) ? currentMatchPredictions : [];

      if (currentArray.includes(value)) {
        newMatchPredictions = currentArray.filter((item) => item !== value);
      } else {
        newMatchPredictions = [...currentArray, value];
      }
      return { ...prev, [matchId]: newMatchPredictions };
    });
  };

  // Maneja cambios en la quiniela activa (single-select using checkbox)
  const handleRadioChange = (matchId: string, value: PredictionValue) => {
    setActiveQuiniela((prev) => ({ ...prev, [matchId]: value }));
  };

  // Agregar la quiniela activa a las enviadas y resetear la activa
  const addPredictionToSummary = () => {
    // Check if activeQuiniela has any selections
    const isActiveQuinielaPopulated = Object.values(activeQuiniela).some(
        (val) => (Array.isArray(val) && val.length > 0) || (typeof val === 'string' && val)
    );

    if (!isActiveQuinielaPopulated && submittedQuinielas.length === 0 && matches.length > 0) {
        toast({
            title: "Predicción Vacía",
            description: "Por favor, selecciona al menos un resultado para la predicción actual antes de agregarla.",
            variant: "default",
        });
        return;
    }
    if (isActiveQuinielaPopulated || matches.length === 0) { // Allow adding empty if no matches
        setSubmittedQuinielas((prev) => [...prev, activeQuiniela]);
        setActiveQuiniela(createNewQuinielaEntry(multiSelect));
    } else if (submittedQuinielas.length > 0) { // If active is empty but there are submitted ones, still allow adding a new blank one
        setSubmittedQuinielas((prev) => [...prev, activeQuiniela]); // Add the empty one
        setActiveQuiniela(createNewQuinielaEntry(multiSelect));
    }


  };

  // Quitar la última quiniela guardada
  const removeLastSubmittedQuiniela = () => {
    if (submittedQuinielas.length > 0) {
      setSubmittedQuinielas((prev) => prev.slice(0, -1));
    }
  };

  // Enviar todas las quinielas (guardadas + activa si tiene datos)
  const onSubmit = (values: { name: string; phone: string }) => {
    let allPredictionsToSubmit = [...submittedQuinielas];
    const isActiveQuinielaPopulated = Object.values(activeQuiniela).some(
      (val) => (Array.isArray(val) && val.length > 0) || (typeof val === 'string' && val)
    );

    if (isActiveQuinielaPopulated) {
      allPredictionsToSubmit.push(activeQuiniela);
    }

    if (allPredictionsToSubmit.length === 0) {
      toast({
        title: "No hay predicciones",
        description: "Por favor, completa y agrega al menos una predicción antes de enviar.",
        variant: "destructive",
      });
      return;
    }

    const quinielasText = allPredictionsToSubmit
      .map((quiniela, idx) => {
        const predictionsArray = matches.map((match) => {
          const predValue = quiniela[match.id];
          if (Array.isArray(predValue)) {
            if (predValue.length === 0) return "?";
            return predValue.map(p => resultMap[p] || "?").join("+");
          } else if (predValue) {
            return resultMap[predValue as PredictionValue] || "?";
          }
          return "?";
        });
        return `Predicción ${idx + 1}: ${predictionsArray.join(",")}`;
      })
      .join("\n");

    const message =
      `Nombre: ${values.name}\n` +
      `Teléfono: ${values.phone}\n` +
      `${quinielasText}`;

    const encodedMessage = encodeURIComponent(message);
    const phone = "524437835437"; // Reemplaza con el número de teléfono real
    const waUrl = `https://wa.me/${phone}?text=${encodedMessage}`;
    window.open(waUrl, "_blank");
  };

  // Sincroniza el estado al cambiar multiSelect
  useEffect(() => {
    const transformEntry = (entry: QuinielaStateEntry): QuinielaStateEntry => {
      return Object.fromEntries(
        matches.map(match => { // Iterate over matches to ensure all match IDs are present
          const currentValue = entry[match.id];
          if (multiSelect) {
            if (typeof currentValue === "string") return [match.id, [currentValue as PredictionValue]];
            if (Array.isArray(currentValue)) return [match.id, currentValue];
            return [match.id, []];
          } else {
            if (Array.isArray(currentValue)) return [match.id, currentValue[0] as PredictionValue | undefined];
            if (typeof currentValue === "string") return [match.id, currentValue as PredictionValue];
            return [match.id, undefined];
          }
        })
      ) as QuinielaStateEntry;
    };

    setActiveQuiniela(prev => transformEntry(prev));
    setSubmittedQuinielas(prevList => prevList.map(transformEntry));
  }, [multiSelect, matches]);


  const canSubmit = submittedQuinielas.length > 0 || Object.values(activeQuiniela).some(
    (val) => (Array.isArray(val) && val.length > 0) || (typeof val === 'string' && val)
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex items-center justify-end gap-2">
          <span className="text-sm">Permitir varias selecciones</span>
          <Switch checked={multiSelect} onCheckedChange={setMultiSelect} />
        </div>

        <Card className="shadow-md mt-8">
          <CardHeader>
            <CardTitle className="text-center text-xl font-semibold">Información del Participante</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Nombre Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Juan Pérez" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Número de Teléfono</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="Ej: 5512345678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabla de Quinielas Guardadas */}
        {submittedQuinielas.length > 0 && (
          <Card className="shadow-md mt-8">
            <CardHeader>
              <CardTitle className="text-center text-lg font-semibold">Predicciones Guardadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-sm text-left">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                      <th scope="col" className="py-3 px-4">#</th>
                      {matches.map(match => (
                        <th key={match.id} scope="col" className="py-3 px-2 text-center truncate max-w-[80px] text-xs" title={`${match.localTeam} vs ${match.visitorTeam}`}>
                          {match.localTeam.substring(0, 3).toUpperCase()} vs {match.visitorTeam.substring(0, 3).toUpperCase()}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {submittedQuinielas.map((sQuiniela, sIdx) => (
                      <tr key={sIdx} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                        <td className="py-3 px-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{sIdx + 1}</td>
                        {matches.map(match => {
                          const predValue = sQuiniela[match.id];
                          let displayValue = "-";
                          if (Array.isArray(predValue)) {
                            if (predValue.length > 0) displayValue = predValue.map(p => resultMap[p] || "?").join('+');
                          } else if (predValue) {
                            displayValue = resultMap[predValue as PredictionValue] || "?";
                          }
                          return <td key={match.id} className="py-3 px-2 text-center text-xs">{displayValue}</td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Formulario de Quiniela Activa */}
        <Card className="shadow-md mt-8">
          <CardHeader>
            <CardTitle className="text-center text-lg font-semibold">
              Predicción {submittedQuinielas.length + 1}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {matches.map((match, matchIdx) => (
              <div
                key={match.id}
                className={`
                  mb-4 rounded-lg border
                  ${matchIdx % 2 === 0 ? "bg-accent/20 border-accent" : "bg-primary/10 border-primary"}
                  flex items-center justify-between w-full p-2
                `}
              >
                {/* Local */}
                <div className="flex flex-col items-center w-1/4">
                  <span className="font-semibold text-xs text-center text-primary">{match.localTeam}</span>
                  {multiSelect ? (
                    <>
                      <Checkbox
                        checked={Array.isArray(activeQuiniela[match.id]) && activeQuiniela[match.id]?.includes("local")}
                        onCheckedChange={() => handlePredictionChange(match.id, "local")}
                        id={`qActive-${match.id}-local`}
                      />
                      <label htmlFor={`qActive-${match.id}-local`} className="text-xs">L</label>
                    </>
                  ) : (
                    <>
                      <Checkbox
                        checked={activeQuiniela[match.id] === "local"}
                        onCheckedChange={() => handleRadioChange(match.id, "local")}
                        id={`qActive-${match.id}-local-radio`}
                      />
                      <label htmlFor={`qActive-${match.id}-local-radio`} className="text-xs">L</label>
                    </>
                  )}
                </div>
                {/* Empate */}
                <div className="flex flex-col items-center w-1/4">
                  <span className="font-semibold text-xs text-center text-muted-foreground">Empate</span>
                  {multiSelect ? (
                    <>
                      <Checkbox
                        checked={Array.isArray(activeQuiniela[match.id]) && activeQuiniela[match.id]?.includes("tie")}
                        onCheckedChange={() => handlePredictionChange(match.id, "tie")}
                        id={`qActive-${match.id}-tie`}
                      />
                      <label htmlFor={`qActive-${match.id}-tie`} className="text-xs">E</label>
                    </>
                  ) : (
                    <>
                      <Checkbox
                        checked={activeQuiniela[match.id] === "tie"}
                        onCheckedChange={() => handleRadioChange(match.id, "tie")}
                        id={`qActive-${match.id}-tie-radio`}
                      />
                      <label htmlFor={`qActive-${match.id}-tie-radio`} className="text-xs">E</label>
                    </>
                  )}
                </div>
                {/* Visitante */}
                <div className="flex flex-col items-center w-1/4">
                  <span className="font-semibold text-xs text-center text-accent">{match.visitorTeam}</span>
                  {multiSelect ? (
                    <>
                      <Checkbox
                        checked={Array.isArray(activeQuiniela[match.id]) && activeQuiniela[match.id]?.includes("visitor")}
                        onCheckedChange={() => handlePredictionChange(match.id, "visitor")}
                        id={`qActive-${match.id}-visitor`}
                      />
                      <label htmlFor={`qActive-${match.id}-visitor`} className="text-xs">V</label>
                    </>
                  ) : (
                    <>
                      <Checkbox
                        checked={activeQuiniela[match.id] === "visitor"}
                        onCheckedChange={() => handleRadioChange(match.id, "visitor")}
                        id={`qActive-${match.id}-visitor-radio`}
                      />
                      <label htmlFor={`qActive-${match.id}-visitor-radio`} className="text-xs">V</label>
                    </>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex flex-col md:flex-row justify-center space-y-2 md:space-y-0 md:space-x-4">
          <Button type="button" onClick={addPredictionToSummary} variant="outline">
            <Plus className="mr-2 h-4 w-4" /> Agregar Predicción
          </Button>
          <Button type="button" onClick={removeLastSubmittedQuiniela} variant="outline" disabled={submittedQuinielas.length === 0}>
            <Minus className="mr-2 h-4 w-4" /> Quitar Última Guardada
          </Button>
        </div>

        <Button type="submit" className="w-full text-lg py-6 mt-8" disabled={isPending || !canSubmit}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Enviando...
            </>
          ) : (
            "Enviar Quinielas"
          )}
        </Button>
      </form>
    </Form>
  );
}

