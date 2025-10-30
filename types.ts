export interface UserProfile {
  name: string;
  age: number;
  weight: number;
  height: number;
  goal: string;
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced' | '';
  availableEquipment: string;
  physicalLimitations: string;
  exerciseHabits: string;
  allergies: string;
  budget: number;
  foodPreferences: string;
  gender: string;
}

export interface Meal {
  name: string;
  description: string;
  calories: number;
}

export interface DailyNutrition {
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  snacks?: Meal;
}

export interface Exercise {
  name: string;
  sets: string;
  reps: string;
  instructions: string;
}

export interface DailyWorkout {
  day: string;
  focus: string;
  exercises: Exercise[];
}

export interface WorkoutPlan {
  weeklyPlan: {
    day: string;
    workout: DailyWorkout;
    nutrition: DailyNutrition;
  }[];
}