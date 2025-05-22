
"use client";

import type { ChangeEvent } from "react";
import React, { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z, type ZodEnum, type ZodObject } from "zod";
import Image from "next/image";

import type { Match, MatchPredictions, QuinielaFormValues } from "@/types";
import { submitPredictionsAction } from "@/lib/actions";
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
import { Loader2 } from "lucide-react";

interface MatchFormProps {
  matches: Match[];
}

const createQuinielaFormSchema = (matches: Match[]) => {
  const matchPredictionFields = matches.reduce((acc, match) => {
    acc[match.id] = z.enum(["local", "tie", "visitor"], {
      required_error: `Por favor, selecciona un resultado para ${match.localTeam} vs ${match.visitorTeam}.`,
    });
    return acc;
  }, {} as Record<string, ZodEnum<["local", "tie", "visitor"]>>);
  
  return z.object({
    name: z.string().min(1, { message: "El nombre es requerido." }),
    phone: z.string().min(1, { message: "El número de teléfono es requerido." }),
    predictions: z.object(matchPredictionFields) as ZodObject<Record<string, ZodEnum<['local', 'tie', 'visitor']>>, "strip", z.ZodTypeAny, MatchPredictions, MatchPredictions>,
  });
};

export function MatchForm({ matches }: MatchFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const formSchema = useMemo(() => createQuinielaFormSchema(matches), [matches]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      predictions: matches.reduce((acc, match) => {
        acc[match.id] = undefined; 
        return acc;
      }, {} as MatchPredictions),
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      const result = await submitPredictionsAction(values);
      if (result.success) {
        toast({
          title: "Éxito",
          description: result.message,
        });
        form.reset(); 
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        <Card className="shadow-md">
          <CardHeader className="px-4 pt-4 pb-2 sm:px-6 sm:pt-6 sm:pb-4">
            <CardTitle className="text-center text-xl font-semibold">Información del Participante</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-4 pb-4 pt-2 sm:px-6 sm:pb-6 sm:pt-2">
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

        <div className="text-center pt-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-primary">Predicciones de Partidos</h2>
        </div>

        {matches.map((match) => (
          <Card key={match.id} className="shadow-md hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="px-4 pt-4 pb-2 sm:px-6 sm:pt-6 sm:pb-4">
              <CardTitle className="text-center text-xl font-semibold">
                <div className="flex items-center justify-around">
                  <div className="flex flex-col items-center space-y-1 w-2/5 text-center">
                    <Avatar className="h-12 w-12 sm:h-16 sm:w-16 mb-1">
                      <AvatarImage 
                        src={match.localLogoUrl} 
                        alt={`${match.localTeam} logo`} 
                        data-ai-hint="logo football"
                      />
                      <AvatarFallback>{match.localTeam.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm sm:text-base">{match.localTeam}</span>
                  </div>
                  <span className="mx-2 text-lg sm:text-2xl font-bold text-muted-foreground">VS</span>
                  <div className="flex flex-col items-center space-y-1 w-2/5 text-center">
                    <Avatar className="h-12 w-12 sm:h-16 sm:w-16 mb-1">
                      <AvatarImage 
                        src={match.visitorLogoUrl} 
                        alt={`${match.visitorTeam} logo`} 
                        data-ai-hint="logo football"
                      />
                      <AvatarFallback>{match.visitorTeam.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm sm:text-base">{match.visitorTeam}</span>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0 sm:px-6 sm:pb-6">
              <FormField
                control={form.control}
                name={`predictions.${match.id}` as any} // Adjusted name for nested structure
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-col sm:flex-row justify-around items-center pt-2"
                        aria-label={`Resultado para ${match.localTeam} vs ${match.visitorTeam}`}
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0 py-2 px-1 sm:p-2">
                          <FormControl>
                            <RadioGroupItem value="local" id={`${match.id}-local`} />
                          </FormControl>
                          <FormLabel htmlFor={`${match.id}-local`} className="font-normal cursor-pointer hover:text-primary">
                            Local
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0 py-2 px-1 sm:p-2">
                          <FormControl>
                            <RadioGroupItem value="tie" id={`${match.id}-tie`} />
                          </FormControl>
                          <FormLabel htmlFor={`${match.id}-tie`} className="font-normal cursor-pointer hover:text-primary">
                            Empate
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0 py-2 px-1 sm:p-2">
                          <FormControl>
                            <RadioGroupItem value="visitor" id={`${match.id}-visitor`} />
                          </FormControl>
                          <FormLabel htmlFor={`${match.id}-visitor`} className="font-normal cursor-pointer hover:text-primary">
                            Visita
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage className="text-center" />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        ))}
        <Button type="submit" className="w-full text-lg py-6" disabled={isPending}>
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
