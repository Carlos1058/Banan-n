import { GoogleGenAI, Type, Modality } from "@google/genai";
import { UserProfile, WorkoutPlan } from '../types';

if (!process.env.API_KEY) {
  // In a real app, this would be a more robust check.
  // For this environment, we assume it's set.
  console.warn("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const planSchema = {
  type: Type.OBJECT,
  properties: {
    weeklyPlan: {
      type: Type.ARRAY,
      description: "A 7-day workout and nutrition plan.",
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.STRING, description: "Day of the week (e.g., Monday)." },
          workout: {
            type: Type.OBJECT,
            properties: {
              day: { type: Type.STRING, description: "Day of the week." },
              focus: { type: Type.STRING, description: "Main muscle group or focus for the day (e.g., Chest & Triceps)." },
              exercises: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    sets: { type: Type.STRING },
                    reps: { type: Type.STRING },
                    instructions: { type: Type.STRING, description: "Brief instructions for the exercise." },
                  },
                  required: ["name", "sets", "reps", "instructions"],
                },
              },
            },
             required: ["day", "focus", "exercises"],
          },
          nutrition: {
            type: Type.OBJECT,
            properties: {
              breakfast: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING, description: "Ingredients and simple recipe." },
                  calories: { type: Type.NUMBER },
                },
                 required: ["name", "description", "calories"],
              },
              lunch: {
                type: Type.OBJECT,
                 properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING, description: "Ingredients and simple recipe." },
                  calories: { type: Type.NUMBER },
                },
                 required: ["name", "description", "calories"],
              },
              dinner: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING, description: "Ingredients and simple recipe." },
                  calories: { type: Type.NUMBER },
                },
                required: ["name", "description", "calories"],
              },
              snacks: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING, description: "Optional snack idea." },
                  calories: { type: Type.NUMBER },
                },
                 required: ["name", "description", "calories"],
              },
            },
            required: ["breakfast", "lunch", "dinner"],
          },
        },
        required: ["day", "workout", "nutrition"],
      },
    },
  },
  required: ["weeklyPlan"],
};

export const generatePlan = async (profile: UserProfile): Promise<WorkoutPlan> => {
  const prompt = `
    Act as an expert personal trainer and nutritionist. Create a comprehensive, 7-day fitness and nutrition plan for the following user. The plan should be effective, safe, easy to follow, and tailored to their specific details.

    User Profile:
    - Name: ${profile.name}
    - Gender: ${profile.gender}
    - Age: ${profile.age}
    - Weight: ${profile.weight} kg
    - Height: ${profile.height} cm
    - Main Goal: ${profile.goal}
    - Fitness Level: ${profile.fitnessLevel}
    - Available Equipment: ${profile.availableEquipment}
    - Physical Limitations: ${profile.physicalLimitations}
    - Exercise Habits: ${profile.exerciseHabits}
    - Weekly Budget (for groceries, in Mexican Pesos): $${profile.budget} MXN. Use generic and economical ingredients.
    - Food Preferences: ${profile.foodPreferences}
    - Allergies or Dietary Restrictions: ${profile.allergies}

    Your task is to generate a JSON object that strictly follows the provided schema. The plan must be for 7 distinct days (Monday to Sunday).
    - Ensure the workouts are appropriate for the user's stated fitness level, available equipment, and EXPLICITLY avoid exercises that could aggravate their physical limitations.
    - Ensure the recipes are simple and align with the budget.
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: planSchema,
        },
    });
    
    const jsonText = response.text.trim();
    const plan = JSON.parse(jsonText) as WorkoutPlan;
    return plan;
  } catch (error) {
    console.error("Error generating plan with Gemini:", error);
    throw new Error("Failed to generate your personalized plan. Please try again.");
  }
};

export const generateSpeech = async (text: string, voice: 'male' | 'female'): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: `Act as a friendly and encouraging fitness coach. ${text}` }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        // Kore for male, Puck for female. These are pleasant voices.
                        prebuiltVoiceConfig: { voiceName: voice === 'male' ? 'Kore' : 'Puck' },
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("No audio data received from API.");
        }
        return base64Audio;
    } catch (error) {
        console.error("Error generating speech with Gemini:", error);
        throw new Error("Failed to generate speech.");
    }
};