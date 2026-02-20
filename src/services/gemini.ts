import { GoogleGenAI, Type } from "@google/genai";
import { ExtractionData } from "../types";
import { MRSL_CLASS_CODES } from "../constants";

const API_KEY = process.env.GEMINI_API_KEY;

export async function extractDataFromPDF(base64Data: string): Promise<ExtractionData> {
  if (!API_KEY) {
    throw new Error("Gemini API key is missing");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const classCodesList = MRSL_CLASS_CODES.map(c => `${c.code}: ${c.description}`).join("\n");

  const systemInstruction = `
You are an expert insurance document analyst. Your task is to extract specific data fields from the provided PDF insurance document.

Valid MRSL Class Codes:
${classCodesList}

Extraction Rules:
1. MRSL Class Code (mrsl_class_code):
   - Analyze the nature of insurance coverage.
   - Match to the most appropriate code from the list.
   - If ambiguous between two codes, return both separated by a slash (e.g., "HM/WR").
   - If genuinely unknown, return null.

2. Insured (insured):
   - Identify the entity seeking coverage (not the broker or insurer).
   - Capture complete legal name including suffixes (Ltd, GmbH, etc.).
   - If multiple entities, extract the primary/parent entity.
   - If uncertain, append " [verify]" to the name.

3. Form Received Date (form_received_date):
   - Format: DD/MM/YYYY.
   - Document creation, submission, or prepared date. Not policy dates.

4. Inception Date (inception_date):
   - Format: DD/MM/YYYY.
   - Policy start date. Resolve relative terms like "today" or "tomorrow" based on the document date or current date (2026-02-20).

5. Renewal Date (renewal_date):
   - Format: DD/MM/YYYY.
   - Policy expiry or renewal date. Often 12 months after inception.

6. Total Due (total_due):
   - Decimal string (e.g., "125000.00").
   - Total payable amount. Include currency code if stated (e.g., "USD 125000.00").

7. Policy Fee (policy_fee):
   - Decimal string (e.g., "500.00").
   - Separate fee/admin charge. Return "0.00" if not found.

General:
- Scan all pages.
- Return null for fields you are not confident about.
- Dates must be DD/MM/YYYY.
- Currency fields should be decimal strings.
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: "application/pdf",
              data: base64Data,
            },
          },
          {
            text: "Extract the data from this insurance document according to the system instructions and return it as a JSON object.",
          },
        ],
      },
    ],
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          mrsl_class_code: { type: Type.STRING, nullable: true },
          insured: { type: Type.STRING, nullable: true },
          form_received_date: { type: Type.STRING, nullable: true },
          inception_date: { type: Type.STRING, nullable: true },
          renewal_date: { type: Type.STRING, nullable: true },
          total_due: { type: Type.STRING, nullable: true },
          policy_fee: { type: Type.STRING, nullable: true },
        },
        required: [
          "mrsl_class_code",
          "insured",
          "form_received_date",
          "inception_date",
          "renewal_date",
          "total_due",
          "policy_fee",
        ],
      },
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("No response from Gemini");
  }

  try {
    return JSON.parse(text) as ExtractionData;
  } catch (e) {
    console.error("Failed to parse Gemini response:", text);
    throw new Error("Invalid response format from AI");
  }
}
