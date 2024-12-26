import React, { useState } from "react";
import {
  TrendingUp,
  Calendar,
  CheckCircle,
  PauseCircle,
  Target,
  CreditCard,
  Pencil,
} from "lucide-react";
import { SavingPlan } from "../../../lib/schemas/saving-plan.interface";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { SavingPlansRepository } from "../../../lib/repositories/savingPlansRepository";

interface SavingPlansDashboardProps {
  savingPlans: SavingPlan[];
}

const SavingPlansDashboard = ({ savingPlans }: SavingPlansDashboardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SavingPlan | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    goal: "",
    deadline: "",
  });

  const calculateProgress = (plan: SavingPlan) => {
    const totalInvested =
      plan.investments?.reduce(
        (sum, investment) => sum + investment.value,
        0
      ) ?? 0;
    return Math.min((totalInvested / plan.goal) * 100, 100);
  };

  const statusConfig = {
    ACTIVE: {
      icon: <TrendingUp className="w-4 h-4" />,
      text: "Em Andamento",
      color: "text-green-500",
    },
    PAUSED: {
      icon: <PauseCircle className="w-4 h-4" />,
      text: "Pausado",
      color: "text-yellow-500",
    },
    COMPLETED: {
      icon: <CheckCircle className="w-4 h-4" />,
      text: "Concluído",
      color: "text-blue-500",
    },
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: formData.name,
      goal: Number(formData.goal),
      deadline: new Date(formData.deadline),
    };

    if (selectedPlan) {
      await SavingPlansRepository.update(selectedPlan._id.toString(), data);
    } else {
      await SavingPlansRepository.create({
        ...data,
        status: "ACTIVE",
      });
    }

    setIsModalOpen(false);
    setSelectedPlan(null);
    setFormData({ name: "", goal: "", deadline: "" });
  };

  const openEditModal = (plan: SavingPlan) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      goal: plan.goal.toString(),
      deadline: new Date(plan.deadline).toISOString().split("T")[0],
    });
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {savingPlans.map((plan) => {
          const status = statusConfig[plan.status];
          const progress = calculateProgress(plan);

          return (
            <Card key={plan._id.toString()} className="overflow-hidden">
              {plan.image && (
                <div className="relative h-40">
                  <img
                    src={plan.image}
                    alt={plan.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-semibold">
                  {plan.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className={status.color}>{status.icon}</div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{status.text}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditModal(plan)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Target className="w-4 h-4" />
                    <span>R$ {plan.goal.toLocaleString("pt-BR")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(plan.deadline)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CreditCard className="w-4 h-4" />
                    <span>{plan.investments?.length ?? 0} investimentos</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className={status.color}>{status.text}</span>
                    <span>{progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedPlan ? "Editar Plano" : "Novo Plano"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal">Meta (R$)</Label>
              <Input
                id="goal"
                type="number"
                value={formData.goal}
                onChange={(e) =>
                  setFormData({ ...formData, goal: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Data Limite</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) =>
                  setFormData({ ...formData, deadline: e.target.value })
                }
                required
              />
            </div>

            <Button type="submit" className="w-full">
              {selectedPlan ? "Salvar Alterações" : "Criar Plano"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SavingPlansDashboard;
