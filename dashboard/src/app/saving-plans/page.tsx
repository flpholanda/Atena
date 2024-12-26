"use client";

import React, { useState, useEffect } from "react";
import { Target, Clock, Plus, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { SavingPlansRepository } from "../../lib/repositories/savingPlansRepository";
import {
  SavingPlan,
  SavingPlanStatus,
} from "../../lib/schemas/saving-plan.interface";

interface SavingPlansValues {
  name: string;
  goal: number;
  status: SavingPlanStatus;
  deadline: string;
}

export default function SavingPlans() {
  const [plans, setPlans] = useState<SavingPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SavingPlan | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      goal: 0,
      status: "ACTIVE" as SavingPlanStatus,
      deadline: new Date().toISOString().split("T")[0],
    },
  });

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const data = await SavingPlansRepository.findAll();
      setPlans(data);
    } catch (error) {
      console.error("Failed to load plans:", error);
    }
  };

  const handleSubmit = async (values: SavingPlansValues) => {
    try {
      console.log(values);
      if (selectedPlan) {
        await SavingPlansRepository.update(selectedPlan._id.toString(), {
          ...values,
          deadline: new Date(values.deadline),
        });
      } else {
        await SavingPlansRepository.create({
          ...values,
          deadline: new Date(values.deadline),
        });
      }
      setIsDialogOpen(false);
      setSelectedPlan(null);
      form.reset();
      loadPlans();
    } catch (error) {
      console.error("Failed to save plan:", error);
    }
  };

  const handleEdit = (plan: SavingPlan) => {
    setSelectedPlan(plan);
    form.reset({
      name: plan.name,
      goal: plan.goal,
      status: plan.status,
      deadline: new Date(plan.deadline).toISOString().split("T")[0],
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await SavingPlansRepository.remove(id);
      loadPlans();
    } catch (error) {
      console.error("Failed to delete plan:", error);
    }
  };

  const calculateProgress = (plan: SavingPlan) => {
    const totalInvested =
      plan.investments?.reduce((sum, inv) => sum + inv.value, 0) || 0;
    return {
      saved: totalInvested,
      percentage: (totalInvested / plan.goal) * 100,
    };
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Planos de Economia</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedPlan(null);
                  form.reset();
                }}
              >
                <Plus className="h-4 w-4" />
                Novo Plano
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {selectedPlan ? "Editar Plano" : "Novo Plano"}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="goal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta (R$)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ACTIVE">Ativo</SelectItem>
                            <SelectItem value="PAUSED">Pausado</SelectItem>
                            <SelectItem value="COMPLETED">
                              Completado
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="deadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prazo</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">
                    {selectedPlan ? "Salvar Alterações" : "Criar Plano"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const progress = calculateProgress(plan);
            return (
              <Card key={plan._id.toString()} className="relative">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(plan)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(plan._id.toString())}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Badge variant="outline" className="w-fit">
                    {plan.status}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Target className="h-4 w-4" />
                        <span>Meta</span>
                      </div>
                      <span>R$ {plan.goal.toLocaleString("pt-BR")}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Prazo</span>
                      </div>
                      <span>
                        {new Date(plan.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Progress value={progress.percentage} className="h-2" />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>R$ {progress.saved.toLocaleString("pt-BR")}</span>
                      <span>{progress.percentage.toFixed(0)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
