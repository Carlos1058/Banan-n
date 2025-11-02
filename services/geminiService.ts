import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, WorkoutPlan, Exercise, DailyWorkout } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

// IMPORTANT: You need to get an API key from RapidAPI for ExerciseDB
// and set it as an environment variable.
const exerciseDbApiKey = '546e26b7dfmshd5b965dccc8c197p1bd8b3jsne46bd057423a'; 
const exerciseDbApiUrl = 'https://exercisedb.p.rapidapi.com/exercises';

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
            description: "List of exercises for the day. Should be an empty array if the focus is 'Rest' or 'Descanso'. The names should be in English to facilitate searching in the exercise database.",
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "Name of the exercise in English (e.g., 'Push-up')." },
                sets: { type: Type.INTEGER, description: "Number of sets." },
                reps: { type: Type.STRING, description: "Number of repetitions or duration (e.g., '12' or '30s')." },
                rest: { type: Type.STRING, description: "Rest time between sets (e.g., '60s')." },
                description: { type: Type.STRING, description: "A brief description on how to perform the exercise, in Spanish." },
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

// Helper function to add a delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));


// --- New Function to fetch GIFs for a single day ---
export const fetchGifsForDay = async (dayWorkout: DailyWorkout): Promise<DailyWorkout> => {
    if (!exerciseDbApiKey) {
        console.warn("ExerciseDB API key not found. Skipping GIF enrichment.");
        return dayWorkout; // Return the day as-is
    }

    const enrichedExercises: Exercise[] = [];
    for (const exercise of dayWorkout.exercises) {
        // Add a 300ms delay before each API call to avoid rate limiting (429 errors)
        await delay(300);
        try {
            // Using a CORS proxy to prevent "Failed to fetch" errors in browser environments.
            const targetUrl = `${exerciseDbApiUrl}/name/${encodeURIComponent(exercise.name)}`;
            const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;

            const response = await fetch(proxyUrl, {
                headers: {
                    'X-RapidAPI-Key': exerciseDbApiKey,
                    'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
                }
            });
            if (!response.ok) {
                throw new Error(`ExerciseDB API request failed with status ${response.status}`);
            }
            const data = await response.json();
            if (data && data.length > 0) {
                const exerciseData = data[0];
                enrichedExercises.push({ ...exercise, id: exerciseData.id, gifUrl: exerciseData.gifUrl });
            } else {
                enrichedExercises.push({ ...exercise }); // Push exercise without gif if not found
            }
        } catch (error) {
            console.warn(`Could not fetch GIF for "${exercise.name}":`, error);
            enrichedExercises.push({ ...exercise }); // Push exercise on error
        }
    }
    
    return { ...dayWorkout, exercises: enrichedExercises };
};


// Generates a detailed prompt for the AI based on the user's profile.
const generatePrompt = (profile: UserProfile): string => {
  let prompt = `
    Based on the following user profile, create a comprehensive and personalized 7-day workout and diet plan.
    The tone should be encouraging and fun, in the style of a friendly banana character named Bananín. The entire response must be in Spanish, except for the exercise names which must be in English.

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

  if (profile.sleepHours) prompt += `- Average Sleep: ${profile.sleepHours} per night.\n`;
  if (profile.trainingTime) prompt += `- Time per Workout: ${profile.trainingTime}.\n`;
  if (profile.neckCircumference || profile.waistCircumference || profile.hipCircumference) prompt += `Expert Details (use for a more precise plan):\n- Body Measurements: Neck: ${profile.neckCircumference || 'N/A'} cm, Waist: ${profile.waistCircumference || 'N/A'} cm, Hips: ${profile.hipCircumference || 'N/A'} cm.\n`;
  if (profile.favoriteProteins && profile.favoriteProteins.length > 0) prompt += `- Favorite Proteins: ${profile.favoriteProteins.join(', ')}. Please incorporate these into the diet plan.\n`;
  if (profile.favoriteCarbs && profile.favoriteCarbs.length > 0) prompt += `- Favorite Carbs: ${profile.favoriteCarbs.join(', ')}. Please incorporate these into the diet plan.\n`;

  prompt += `
    Instructions:
    1.  **Workout Plan**: Create a 7-day schedule. Include at least 2 rest days (in Spanish: "Descanso"). For each workout day, provide a warm-up, a list of 3-5 exercises (with sets, reps, rest time), and a cool-down. The exercises should be suitable for the user's fitness level and available equipment. For "Descanso" days, the 'exercises' array MUST be empty.
    2.  **IMPORTANT**: The 'name' of each exercise MUST be in English to allow for searching in an external exercise database (e.g., 'Push-up', 'Jumping Jacks'). However, the 'description' for how to perform the exercise must be in Spanish.
    3.  **Diet Plan**: Create a 7-day meal plan (Breakfast, Lunch, Dinner, and one optional Snack). The meals should align with the user's goal, preferences, and budget. Provide estimated calorie counts.
    4.  **Language**: The entire plan must be in Spanish, EXCEPT for the exercise names.
    5.  **Format**: Return the response in the specified JSON format.
    `;
    
  return prompt;
};

const generateModificationPrompt = (profile: UserProfile, currentPlan: WorkoutPlan, request: string): string => {
  return `
    Based on the following user profile, their CURRENT 7-day workout and diet plan, and their specific modification request, create a NEW, updated 7-day plan.
    The tone should remain encouraging and fun, in the style of a friendly banana character named Bananín. The entire response must be in Spanish, except for the exercise names which must be in English.

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
    1.  **Analyze Request**: Carefully read the user's request and generate a completely new 7-day plan that incorporates the feedback.
    2.  **Workout Plan**: For "Descanso" days, the 'exercises' array MUST be empty.
    3.  **IMPORTANT**: The 'name' of each exercise MUST be in English to allow for searching in an external exercise database (e.g., 'Push-up', 'Jumping Jacks'). However, the 'description' for how to perform the exercise must be in Spanish.
    4.  **Language**: The entire plan must be in Spanish, EXCEPT for the exercise names.
    5.  **Format**: Return the response in the specified JSON format.
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
        const initialPlan = JSON.parse(jsonText) as WorkoutPlan;

        if (!initialPlan.workoutSchedule || !initialPlan.dietPlan) {
            throw new Error("Invalid plan structure received from API.");
        }
        
        // Return the plan without GIFs. They will be fetched on demand.
        return initialPlan;

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
        const newPlan = JSON.parse(jsonText) as WorkoutPlan;

        if (!newPlan.workoutSchedule || !newPlan.dietPlan) {
            throw new Error("Invalid plan structure received from API during modification.");
        }
        
        // Return the new plan without GIFs. They will be fetched on demand.
        return newPlan;
        
    } catch (error) {
        console.error("Error modifying workout plan:", error);
        throw new Error("Failed to modify workout plan. Please try again.");
    }
};