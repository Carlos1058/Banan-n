// Defines the structure for a user's profile information.
export interface UserProfile {
  name: string;
  age: number;
  weight: number;
  height: number;
  goal: string; // e.g., 'lose weight', 'build muscle'
  fitnessLevel: string; // e.g., 'beginner', 'intermediate', 'advanced'
  availableEquipment: string[]; // e.g., ['dumbbells', 'yoga mat'], ['full gym'], ['none']
  physicalLimitations: string;
  exerciseHabits: string; // e.g., '3 times a week', 'daily'
  allergies: string;
  budget: number; // For meal planning
  foodPreferences: string; // e.g., 'vegetarian', 'vegan', 'none'
  gender: string;

  // New fields for advanced/expert onboarding
  sleepHours?: string;
  trainingTime?: string;

  // Expert Onboarding Fields
  neckCircumference?: number;
  waistCircumference?: number;
  hipCircumference?: number;
  favoriteProteins?: string[];
  favoriteCarbs?: string[];

  // Gamification
  streak: number;
  diamonds: number;
  bananinAccessories: string[]; // e.g., ['hat', 'sunglasses']
  completedDays: string[]; // e.g., ['2024-07-29']
  claimedInstagramReward?: boolean;
  claimedFacebookReward?: boolean;
  claimedXReward?: boolean;
  
  // UI Customization
  profilePictureUrl?: string;
  purchasedThemes?: string[]; // e.g., ['default', 'verde']
  activeTheme?: string; // e.g., 'verde'
  purchasedFrames?: string[]; // e.g., ['gold', 'squats']
  activeFrame?: string; // e.g., 'gold'
}

// Defines the structure for a single exercise.
export interface Exercise {
  name: string;
  sets: number;
  reps: string; // Can be a number or a duration like "30s"
  rest: string; // e.g., "60s"
  description: string;
}

// Defines the structure for a day's workout.
export interface DailyWorkout {
  day: string; // e.g., "Monday"
  focus: string; // e.g., "Upper Body Strength" or "Rest"
  exercises: Exercise[];
  warmup: string;
  cooldown: string;
}

// Defines the structure for a single meal.
export interface Meal {
  name: string; // e.g., "Breakfast", "Lunch", "Dinner", "Snack"
  description: string;
  calories: number;
}

// Defines the structure for a day's diet plan.
export interface DailyDiet {
  day: string; // e.g., "Monday"
  meals: Meal[];
  totalCalories: number;
}

// Defines the top-level structure for the entire workout and diet plan.
export interface WorkoutPlan {
  workoutSchedule: DailyWorkout[];
  dietPlan: DailyDiet[];
}

// --- New Types for Shopping List ---

export interface ShoppingListItem {
  item: string;
  quantity: string;
  category: string;
}

export interface StoreSuggestion {
  type: string;
  name_example: string;
  notes: string;
}

export interface ShoppingList {
  list: ShoppingListItem[];
  store_suggestions: StoreSuggestion[];
  summary: string;
}