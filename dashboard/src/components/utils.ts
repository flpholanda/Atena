import { Category } from "../lib/schemas/category.interface";
import { Types } from "mongoose";

export const PaymentMethodLabels = {
  CASH: "Dinheiro",
  CREDIT_CARD: "Cartão de Crédito",
  DEBIT_CARD: "Cartão de Débito",
  BANK_TRANSFER: "Transferência Bancária",
  PIX: "PIX",
  OTHER: "Outro",
} as const;

export function getPaymentMethodLabel(key: string): string {
  if (key in PaymentMethodLabels) {
    return PaymentMethodLabels[key as keyof typeof PaymentMethodLabels];
  }
  return "Outro";
}

export const findCategory = (
  categories: Category[],
  categoryId: Types.ObjectId | string
) => {
  const category = categories.find(
    (cat) => cat._id?.toString() === categoryId?.toString()
  );
  return category;
};
