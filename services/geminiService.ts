import { GoogleGenAI, Type } from "@google/genai";
import type { AlertContent } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// FIX: The 'required' property is not supported in the responseSchema for the Google GenAI API.
// Properties declared in 'properties' are implicitly required.
const alertSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "A very short, urgent title for the alert. Example: 'URGENT: SOS from [Name]'."
    },
    body: {
      type: Type.STRING,
      description: "A concise alert body ready for the user to send via SMS/WhatsApp. It must clearly state the sender's name and their message. It must list the intended recipients. If GPS coordinates are in the message, format them clearly and add a Google Maps link."
    }
  }
};

interface AlertGenerationOptions {
    temperature: number;
    systemInstruction?: string;
}

const DEFAULT_SYSTEM_INSTRUCTION = `
You are an AI assistant for the "Friend SOS" app. Your role is to take a user's name, their emergency message, and a list of their contacts, and then generate a clear, concise, and urgent alert. The output must be in JSON format.
The generated 'body' of the alert must be ready for the user to copy and paste directly into a messaging app like SMS or WhatsApp.
It must include the sender's name.
It must include the sender's message.
It must list the contacts the message is being sent to.
If the user's message includes GPS coordinates in the format [latitude, longitude], you MUST include them in the body and also provide a functional Google Maps link like this: https://www.google.com/maps?q=latitude,longitude.
The tone should be serious and urgent but calm and clear.
`;

export const generateAlert = async (
    name: string, 
    message: string, 
    contacts: string,
    options: AlertGenerationOptions
): Promise<AlertContent> => {
  const prompt = `
    My name is "${name}" and I am sending an urgent SOS alert.
    The contacts I am sending this to are: ${contacts}.
    My emergency message is: "${message || 'No message provided.'}".
    Please create the alert.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: alertSchema,
        temperature: options.temperature,
        systemInstruction: options.systemInstruction || DEFAULT_SYSTEM_INSTRUCTION,
      },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
        throw new Error("API returned an empty response.");
    }

    const parsedResponse: AlertContent = JSON.parse(jsonText);
    return parsedResponse;
    
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate alert from AI service.");
  }
};
