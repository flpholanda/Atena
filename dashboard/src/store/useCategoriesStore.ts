import { create } from "zustand";
import { Category } from "../lib/schemas/category.interface";
import { CategoryRepository } from "../lib/repositories/categoriesRepository";

interface CategoriesState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  addCategory: (category: Category) => void;
  addCategories: (categories: Category[]) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  getCategoryById: (id: string) => Category | undefined;
}

export const useCategoriesStore = create<CategoriesState>((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const categories = await CategoryRepository.findAll();
      set({ categories, isLoading: false });
    } catch {
      set({ error: "Failed to fetch categories", isLoading: false });
    }
  },

  addCategory: (category: Category) => {
    set((state) => ({
      categories: [...state.categories, category],
    }));
  },

  addCategories: (categories: Category[]) => {
    set((state) => ({
      categories: [...state.categories, ...categories],
    }));
  },

  updateCategory: (category: Category) => {
    set((state) => ({
      categories: state.categories.map((c) =>
        c._id === category._id ? category : c
      ),
    }));
  },

  deleteCategory: (id: string) => {
    set((state) => ({
      categories: state.categories.filter((c) => c._id.toString() !== id),
    }));
  },

  getCategoryById: (id: string) => {
    const state = get();
    return state.categories.find((c) => c._id.toString() === id);
  },
}));
