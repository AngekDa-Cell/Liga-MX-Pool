"use client";

import type { ChangeEvent } from "react";
import React, { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z, type ZodEnum, type ZodObject } from "zod";
import Image from "next/image";

import type { Match, MatchPredictions, QuinielaFormValues } from "@/types";
import { submitPredictionsAction } from "@/lib/actions";

// Define PredictionValue type if not imported
type PredictionValue = "local" | "tie" | "visitor";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Minus } from "lucide-react";

interface MatchFormProps {
  matches: Match[];
}

export function MatchForm({ matches }: MatchFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // Estado para múltiples quinielas
  const [quinielas, setQuinielas] = useState([
    matches.reduce((acc, match) => {
      acc[match.id] = undefined;
      return acc;
    }, {} as MatchPredictions),
  ]);

  // Formulario para nombre y teléfono
  const form = useForm<{ name: string; phone: string }>({
    defaultValues: { name: "", phone: "" },
  });

  // Maneja cambios en una quiniela individual
  const handlePredictionChange = (quinielaIdx: number, matchId: string, value: string) => {
    setQuinielas((prev) =>
      prev.map((q, idx) =>
        idx === quinielaIdx ? { ...q, [matchId]: value as PredictionValue } : q
      )
    );
  };
  
  // Agregar una nueva quiniela
  const addQuiniela = () => {
    setQuinielas((prev) => [
      ...prev,
      matches.reduce((acc, match) => {
        acc[match.id] = undefined;
        return acc;
      }, {} as MatchPredictions),
    ]);
  };

  // Quitar la última quiniela (si hay más de una)
  const removeQuiniela = () => {
    if (quinielas.length > 1) setQuinielas((prev) => prev.slice(0, -1));
  };

  // Enviar todas las quinielas
  const onSubmit = (values: { name: string; phone: string }) => {
    const resultMap: Record<string, string> = { local: "L", tie: "E", visitor: "V" };
    const quinielasText = quinielas
      .map((quiniela, idx) => {
        const predictionsArray = matches.map((match) => {
          const pred = quiniela[match.id];
          return resultMap[pred as keyof typeof resultMap] || "?";
        });
        return `Predicción ${idx + 1}: ${predictionsArray.join(",")}`;
      })
      .join("\n");

    const message =
      `Nombre: ${values.name}\n` +
      `Teléfono: ${values.phone}\n` +
      `${quinielasText}`;

    const encodedMessage = encodeURIComponent(message);
    const phone = "523122916489";
    const waUrl = `https://wa.me/${phone}?text=${encodedMessage}`;
    window.open(waUrl, "_blank");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Nombre y teléfono */}
        <Card className="shadow-md mt-8">
          <CardHeader>
            <CardTitle className="text-center text-xl font-semibold">Información del Participante</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
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
                <FormItem>
                  <FormLabel>Número de Teléfono</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="Ej: 5512345678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Quinielas dinámicas */}
        {quinielas.map((quiniela, quinielaIdx) => (
          <Card key={quinielaIdx} className="shadow-md mt-8">
            <CardHeader>
              <CardTitle className="text-center text-lg font-semibold">
                Predicción {quinielaIdx + 1}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {matches.map((match) => (
                <div key={match.id} className="mb-4">
                  <div className="flex items-center justify-between">
                    <span>{match.localTeam} vs {match.visitorTeam}</span>
                    <RadioGroup
                      value={quiniela[match.id]}
                      onValueChange={(value) =>
                        handlePredictionChange(quinielaIdx, match.id, value)
                      }
                      className="flex flex-row space-x-2"
                    >
                      <RadioGroupItem value="local" id={`q${quinielaIdx}-${match.id}-local`} />
                      <FormLabel htmlFor={`q${quinielaIdx}-${match.id}-local`}>L</FormLabel>
                      <RadioGroupItem value="tie" id={`q${quinielaIdx}-${match.id}-tie`} />
                      <FormLabel htmlFor={`q${quinielaIdx}-${match.id}-tie`}>E</FormLabel>
                      <RadioGroupItem value="visitor" id={`q${quinielaIdx}-${match.id}-visitor`} />
                      <FormLabel htmlFor={`q${quinielaIdx}-${match.id}-visitor`}>V</FormLabel>
                    </RadioGroup>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

        {/* Botones para agregar/quitar quinielas */}
        <div className="flex justify-center space-x-4">
          <Button type="button" onClick={addQuiniela} variant="outline">
            <Plus className="mr-2 h-4 w-4" /> Agregar Predicción
          </Button>
          <Button type="button" onClick={removeQuiniela} variant="outline" disabled={quinielas.length === 1}>
            <Minus className="mr-2 h-4 w-4" /> Quitar Predicción
          </Button>
        </div>

        <Button type="submit" className="w-full text-lg py-6 mt-8" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Enviando...
            </>
          ) : (
            "Enviar Quiniela"
          )}
        </Button>
      </form>
    </Form>
  );
}

