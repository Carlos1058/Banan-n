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
  let prompt = `
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
  `;

  if (profile.sleepHours) {
    prompt += `- Average Sleep: ${profile.sleepHours} per night.\n`;
  }
  if (profile.trainingTime) {
    prompt += `- Time per Workout: ${profile.trainingTime}.\n`;
  }

  if (profile.neckCircumference || profile.waistCircumference || profile.hipCircumference) {
      prompt += `
    Expert Details (use this for a more precise plan):
    - Body Measurements: Neck: ${profile.neckCircumference || 'N/A'} cm, Waist: ${profile.waistCircumference || 'N/A'} cm, Hips: ${profile.hipCircumference || 'N/A'} cm.
      `;
  }

  if (profile.favoriteProteins && profile.favoriteProteins.length > 0) {
      prompt += `- Favorite Proteins: ${profile.favoriteProteins.join(', ')}. Please incorporate these into the diet plan.\n`;
  }

  if (profile.favoriteCarbs && profile.favoriteCarbs.length > 0) {
      prompt += `- Favorite Carbs: ${profile.favoriteCarbs.join(', ')}. Please incorporate these into the diet plan.\n`;
  }

  prompt += `
    Instructions:
    1.  **Workout Plan**: Create a 7-day schedule. Include at least 2 rest days. For each workout day, provide a warm-up, a list of 3-5 exercises (with sets, reps, rest time, and simple instructions), and a cool-down. The exercises should be suitable for the user's fitness level and available equipment.
    2.  **Diet Plan**: Create a 7-day meal plan (Breakfast, Lunch, Dinner, and one optional Snack). The meals should align with the user's goal, preferences, and budget. If favorite foods are listed above, prioritize them. Provide an estimated calorie count for each meal and a daily total.
    3.  **Format**: Return the response in the specified JSON format. Ensure all fields are filled.
    `;
    
  return prompt;
};

const generateModificationPrompt = (profile: UserProfile, currentPlan: WorkoutPlan, request: string): string => {
  return `
    Based on the following user profile, their CURRENT 7-day workout and diet plan, and their specific modification request, create a NEW, updated 7-day plan.
    The tone should remain encouraging and fun, in the style of a friendly banana character named Bananín.

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
    - Food Preferences: ${profile.foodPreferences}
    - Allergies: ${profile.allergies}

    User's Current Plan:
    ${JSON.stringify(currentPlan)}

    User's Modification Request:
    "${request}"

    Instructions:
    1.  **Analyze the Request**: Carefully read the user's request and identify the key changes needed (e.g., cheaper food, different exercises, easier meals, etc.).
    2.  **Generate a New Plan**: Create a completely new 7-day workout and diet plan that incorporates the user's feedback. Do not just slightly alter the old plan; generate a fresh one based on the new constraints.
    3.  **Maintain Profile Consistency**: The new plan must still be appropriate for the user's overall profile (goals, fitness level, etc.).
    4.  **Format**: Return the response in the specified JSON format. Ensure all fields are filled.
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

export const modifyWorkoutPlan = async (userProfile: UserProfile, currentPlan: WorkoutPlan, request: string): Promise<WorkoutPlan> => {
    try {
        const model = 'gemini-2.5-pro';
        const prompt = generateModificationPrompt(userProfile, currentPlan, request);

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
            throw new Error("Invalid plan structure received from API during modification.");
        }
        
        return plan;
    } catch (error) {
        console.error("Error modifying workout plan:", error);
        throw new Error("Failed to modify workout plan. Please try again.");
    }
};