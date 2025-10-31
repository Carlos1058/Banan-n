import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, WorkoutPlan } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

// Defines the JSON schema for the workout plan to ensure structured output from the Gemini API.
const workoutPlanSchema = {
  type: Type.OBJECT,
  properties: {
    workoutSchedule: {
      type: Type.ARRAY,
      description: "A 7-day workout schedule.",
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.STRING, description: "Day of the week (e.g., Monday)." },
          focus: { type: Type.STRING, description: "Main focus of the workout (e.g., Upper Body, Cardio, Rest)." },
          warmup: { type: Type.STRING, description: "A brief description of the warm-up routine." },
          exercises: {
            type: Type.ARRAY,
            description: "List of exercises for the day.",
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "Name of the exercise." },
                sets: { type: Type.INTEGER, description: "Number of sets." },
                reps: { type: Type.STRING, description: "Number of repetitions or duration (e.g., '12' or '30s')." },
                rest: { type: Type.STRING, description: "Rest time between sets (e.g., '60s')." },
                description: { type: Type.STRING, description: "A brief description on how to perform the exercise." },
              },
              required: ["name", "sets", "reps", "rest", "description"],
            },
          },
          cooldown: { type: Type.STRING, description: "A brief description of the cool-down routine." },
        },
        required: ["day", "focus", "warmup", "exercises", "cooldown"],
      },
    },
    dietPlan: {
      type: Type.ARRAY,
      description: "A 7-day diet plan.",
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.STRING, description: "Day of the week (e.g., Monday)." },
          meals: {
            type: Type.ARRAY,
            description: "List of meals for the day (e.g., Breakfast, Lunch, Dinner, Snack).",
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "Name of the meal (e.g., Breakfast)." },
                description: { type: Type.STRING, description: "Description of the meal and ingredients." },
                calories: { type: Type.INTEGER, description: "Estimated number of calories." },
              },
              required: ["name", "description", "calories"],
            },
          },
          totalCalories: { type: Type.INTEGER, description: "Total estimated calories for the day." },
        },
        required: ["day", "meals", "totalCalories"],
      },
    },
  },
  required: ["workoutSchedule", "dietPlan"],
};

// Generates a detailed prompt for the AI based on the user's profile.
const generatePrompt = (profile: UserProfile): string => {
  return `
    Based on the following user profile, create a comprehensive and personalized 7-day workout and diet plan.
    The user is a beginner and needs clear, simple instructions. The tone should be encouraging and fun, in the style of a friendly banana character named Bananín.

    User Profile:
    - Name: ${profile.name}
    - Age: ${profile.age}
    - Gender: ${profile.gender}
    - Weight: ${profile.weight} kg
    - Height: ${profile.height} cm
    - Goal: ${profile.goal}
    - Fitness Level: ${profile.fitnessLevel}
    - Available Equipment: ${profile.availableEquipment}
    - Physical Limitations: ${profile.physicalLimitations}
    - Current Exercise Habits: ${profile.exerciseHabits}
    - Food Preferences: ${profile.foodPreferences}
    - Allergies: ${profile.allergies}
    - Budget for food: ${profile.budget} (provide budget-friendly meal suggestions)

    Instructions:
    1.  **Workout Plan**: Create a 7-day schedule. Include at least 2 rest days. For each workout day, provide a warm-up, a list of 3-5 exercises (with sets, reps, rest time, and simple instructions), and a cool-down. The exercises should be suitable for the user's fitness level and available equipment.
    2.  **Diet Plan**: Create a 7-day meal plan (Breakfast, Lunch, Dinner, and one optional Snack). The meals should align with the user's goal, preferences, and budget. Provide an estimated calorie count for each meal and a daily total.
    3.  **Format**: Return the response in the specified JSON format. Ensure all fields are filled.
    `;
};


export const generateWorkoutPlan = async (userProfile: UserProfile): Promise<WorkoutPlan> => {
    try {
        const model = 'gemini-2.5-pro';
        const prompt = generatePrompt(userProfile);

        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: workoutPlanSchema,
            },
        });

        const jsonText = response.text.trim();
        const plan = JSON.parse(jsonText) as WorkoutPlan;

        if (!plan.workoutSchedule || !plan.dietPlan) {
            throw new Error("Invalid plan structure received from API.");
        }
        
        return plan;
    } catch (error) {
        console.error("Error generating workout plan:", error);
        throw new Error("Failed to generate workout plan. Please try again.");
    }
};