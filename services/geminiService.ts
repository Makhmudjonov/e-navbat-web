
import { GoogleGenAI } from "@google/genai";
import { CatchupSchedule } from "../types";

// Always use a named parameter for the API key when initializing GoogleGenAI.
const initGenAI = () => {
  if (!process.env.API_KEY) return null;
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

interface DashboardStats {
  totalStudents: number;
  totalFaculties: number;
  totalBuildings: number;
  totalRegistrations: number;
  totalAttendees: number;
}

export const generateQueueInsights = async (schedules: CatchupSchedule[], stats: DashboardStats) => {
  const ai = initGenAI();
  if (!ai) return "Gemini API kaliti topilmadi. Iltimos, sozlamalarni tekshiring.";

  const scheduleAnalysis = schedules.map(s => 
    `- ${s.name} (${new Date(s.date).toLocaleDateString()}): ${s.registrationCount} ro'yxatdan o'tgan, ${s.attendeesCount} qatnashgan.`
  ).join('\n');

  const prompt = `
    Quyidagi universitet elektron navbat va dars jadvallari ma'lumotlarini tahlil qiling:
    
    Umumiy statistika:
    - Jami talabalar: ${stats.totalStudents}
    - Jami fakultetlar: ${stats.totalFaculties}
    - Jami binolar: ${stats.totalBuildings}
    - Jami ro'yxatdan o'tganlar: ${stats.totalRegistrations}
    - Jami qatnashganlar: ${stats.totalAttendees}

    So'nggi jadvallar samaradorligi:
    ${scheduleAnalysis}

    Administrator uchun o'zbek tilida qisqa va professional xulosa bering (maksimum 3 ta gap). 
    Resurslardan foydalanish (binolar/fakultetlar), davomat ko'rsatkichlari (ro'yxatdan o'tganlar vs qatnashganlar) va talabga e'tibor qarating.
  `;

  try {
    // Use 'gemini-3-flash-preview' for basic text tasks as per guidelines.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // Access the .text property directly.
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Hozirgi vaqtda tahlil yaratib bo'lmadi.";
  }
};
