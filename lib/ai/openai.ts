import OpenAI from "openai";

export function getOpenAIClient() {
  if (process.env.OPENAI_ENABLED !== "true") {
    return null;
  }
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY est absent.");
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export const aiGuardrails = [
  "Ne jamais produire de diagnostic automatique.",
  "Produire uniquement observations, indices, preuves, hypotheses et questions.",
  "Distinguer faits, hypotheses et interpretations.",
  "Ne jamais transformer une hypothese en conclusion.",
  "Limiter les donnees envoyees au strict necessaire."
];
