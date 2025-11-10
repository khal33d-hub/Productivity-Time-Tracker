
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { TaskLogEntry, AiReport, SheetTaskData } from '../types';

export async function generateProductivityReport(tasks: TaskLogEntry[]): Promise<AiReport> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

  const tasksForPrompt = tasks.map(task => ({
    taskName: task.taskName,
    category: task.category,
    durationInSeconds: task.duration,
  }));

  const prompt = `
    You are a productivity analysis assistant.
    Analyze the following list of tasks and their durations provided in a JSON array.

    Data:
    ${JSON.stringify(tasksForPrompt)}

    Based on this data, provide a summary. Your response MUST be a valid JSON object that adheres to the provided schema.
    Calculate the total time tracked in hours and minutes.
    Identify the category where the most time was spent.
    Provide a brief, one-sentence, encouraging summary statement about the user's productivity.
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      totalHours: {
        type: Type.NUMBER,
        description: 'Total hours tracked, rounded down to the nearest whole number.',
      },
      totalMinutes: {
        type: Type.NUMBER,
        description: 'The remaining minutes after calculating total hours.',
      },
      topCategory: {
        type: Type.STRING,
        description: 'The name of the category with the highest cumulative duration.',
      },
      summary: {
        type: Type.STRING,
        description: 'A brief, encouraging summary statement.',
      },
    },
    required: ['totalHours', 'totalMinutes', 'topCategory', 'summary'],
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: responseSchema,
    },
  });

  try {
    const jsonString = response.text.trim();
    const reportData = JSON.parse(jsonString);
    return reportData as AiReport;
  } catch (error) {
    console.error("Failed to parse Gemini response:", response.text);
    throw new Error("Received an invalid JSON response from the AI.");
  }
}

export async function generateSheetData(tasks: TaskLogEntry[]): Promise<SheetTaskData[]> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

    const tasksForPrompt = tasks.map(task => ({
        taskName: task.taskName,
        category: task.category,
        durationInSeconds: task.duration,
        timestamp: task.timestamp.toISOString(),
    }));

    const createSpreadsheetFunctionDeclaration: FunctionDeclaration = {
        name: 'create_spreadsheet',
        description: 'Creates a spreadsheet from a list of formatted task data.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                tasks: {
                    type: Type.ARRAY,
                    description: 'A list of tasks to be included in the spreadsheet.',
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            taskName: { type: Type.STRING },
                            category: { type: Type.STRING },
                            durationInMinutes: { type: Type.NUMBER },
                            date: { type: Type.STRING, description: 'Format: YYYY-MM-DD' },
                            time: { type: Type.STRING, description: 'Format: HH:MM:SS' },
                        },
                        required: ['taskName', 'category', 'durationInMinutes', 'date', 'time'],
                    },
                },
            },
            required: ['tasks'],
        },
    };

    const prompt = `
        You are a data processing assistant. Your task is to process the following list of tasks and their metadata.
        For each task, convert the duration from seconds to minutes (rounded to two decimal places).
        Format the timestamp into separate date (YYYY-MM-DD) and time (HH:MM:SS) strings from the ISO 8601 timestamp.
        Then, call the 'create_spreadsheet' function with the processed data.

        Task Data:
        ${JSON.stringify(tasksForPrompt)}
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            tools: [{ functionDeclarations: [createSpreadsheetFunctionDeclaration] }],
        },
    });
    
    const functionCalls = response.functionCalls;
    if (functionCalls && functionCalls.length > 0 && functionCalls[0].name === 'create_spreadsheet') {
        const args = functionCalls[0].args;
        if (args && Array.isArray(args.tasks)) {
             return args.tasks as SheetTaskData[];
        }
    }
    
    throw new Error('AI failed to generate spreadsheet data correctly.');
}
