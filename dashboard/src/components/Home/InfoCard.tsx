import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface IInfoCard {
  title: string;
  amount: number;
  percentage: number;
  percentageAmount: number;
  type?: "income" | "expense" | "total";
  pendingAmount?: number;
}

const InfoCard: React.FC<IInfoCard> = ({
  title,
  amount,
  percentage,
  percentageAmount,
  type = "total",
  pendingAmount = 0,
}) => {
  const isPositive = percentage >= 0;
  const formatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return (
    <Card className="flex-1">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            {title}
          </span>
          {type === "expense" && pendingAmount > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="secondary" className="text-xs">
                    Pendente: {formatter.format(pendingAmount)}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Valor pendente a ser pago</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-4xl font-bold">{formatter.format(amount)}</p>
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-2 ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label={isPositive ? "up" : "down"}
              className={`transform transition-all duration-300 ${
                isPositive ? "rotate-180" : ""
              }`}
            >
              <path
                d="M10.6979 16.2453L6.31787 9.75247C5.58184 8.66118 6.2058 7 7.35185 7L16.6482 7C17.7942 7 18.4182 8.66243 17.6821 9.75247L13.3021 16.2453C12.623 17.2516 11.377 17.2516 10.6979 16.2453Z"
                fill="currentColor"
              />
            </svg>
            <span className="text-sm font-semibold">
              {Math.abs(percentage).toFixed(1)}%
            </span>
            <span className="text-sm">
              ({formatter.format(percentageAmount)})
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InfoCard;
