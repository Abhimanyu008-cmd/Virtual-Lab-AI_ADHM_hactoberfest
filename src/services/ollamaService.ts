/**
 * VirtuLab AI - Ollama & Local Gemma AI Client
 * Communicates with locally running Ollama (e.g., http://localhost:11434)
 * Provides context-aware Lab Mentor chat and Viva evaluation.
 * Never calls paid cloud APIs.
 */

import { OllamaConfig, OllamaStatus, VivaQuestionEvaluation } from '../types/app';
import { SimulationReadings } from '../types/circuit';

const STORAGE_KEY_CONFIG = 'virtulab_ollama_config';

export const DEFAULT_OLLAMA_CONFIG: OllamaConfig = {
  endpoint: 'http://localhost:11434',
  model: 'gemma3:4b',
  timeoutMs: 15000
};

export function getOllamaConfig(): OllamaConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (saved) {
      return { ...DEFAULT_OLLAMA_CONFIG, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to parse ollama config from storage', e);
  }
  return DEFAULT_OLLAMA_CONFIG;
}

export function saveOllamaConfig(config: OllamaConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save ollama config', e);
  }
}

/**
 * Checks connection to local Ollama instance and fetches installed models
 */
export async function checkOllamaConnection(config: OllamaConfig = getOllamaConfig()): Promise<OllamaStatus> {
  const cleanEndpoint = config.endpoint.replace(/\/+$/, '');
  const url = `${cleanEndpoint}/api/tags`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeoutMs || 8000);

    const res = await fetch(url, {
      method: 'GET',
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return {
        isConnected: false,
        availableModels: [],
        currentModel: config.model,
        lastChecked: Date.now(),
        errorMessage: `Ollama returned HTTP error ${res.status}: ${res.statusText}`
      };
    }

    const data = await res.json();
    const models: string[] = Array.isArray(data?.models)
      ? data.models.map((m: { name?: string }) => m.name || '')
      : [];

    return {
      isConnected: true,
      availableModels: models,
      currentModel: config.model,
      lastChecked: Date.now()
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      isConnected: false,
      availableModels: [],
      currentModel: config.model,
      lastChecked: Date.now(),
      errorMessage: errorMsg.includes('abort') 
        ? 'Connection timed out. Ollama may be unresponsive.' 
        : `Cannot connect to ${cleanEndpoint}. Ensure Ollama is running locally.`
    };
  }
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface MentorContext {
  experimentTitle: string;
  experimentAim: string;
  currentStep?: string;
  readings?: SimulationReadings;
}

/**
 * Sends prompt to local Ollama chat API (/api/chat)
 * If Ollama is offline, gracefully provides expert rule-grounded educational guidance.
 */
export async function queryLabMentor(
  messages: ChatMessage[],
  context: MentorContext,
  config: OllamaConfig = getOllamaConfig()
): Promise<{ text: string; isLocalGemma: boolean; error?: string }> {
  const cleanEndpoint = config.endpoint.replace(/\/+$/, '');
  const chatUrl = `${cleanEndpoint}/api/chat`;

  // Construct rigorous context-infused system prompt
  const systemPrompt = `You are "Lab Mentor", an expert electrical engineering laboratory tutor in the VirtuLab AI platform.
You communicate directly from a locally running Gemma model (${config.model}) on the student's computer.

CURRENT LABORATORY CONTEXT:
- Experiment: ${context.experimentTitle}
- Aim: ${context.experimentAim}
${context.currentStep ? `- Active Procedure Step: ${context.currentStep}` : ''}
${context.readings ? `
- Circuit Simulation State: ${context.readings.status} (${context.readings.statusMessage})
- Applied DC Voltage: ${context.readings.sourceVoltage} V
- Measured Total Current: ${context.readings.totalCurrent.toFixed(4)} A (${(context.readings.totalCurrent * 1000).toFixed(1)} mA)
- Measured Equivalent Resistance: ${context.readings.totalResistance.toFixed(2)} Ω
- Active Mistakes / Diagnostics: ${context.readings.diagnostics.length > 0 ? context.readings.diagnostics.map(d => `[${d.category}] ${d.what}`).join('; ') : 'None (Circuit is fully compliant)'}
` : ''}

INSTRUCTIONS:
1. Always base electrical explanations strictly on the verified simulation data provided above. Do NOT invent readings.
2. If the circuit has an active mistake, guide the student to understand the physical cause without giving away a bare copy-paste answer.
3. Be supportive, concise, technically rigorous, and encouraging.
4. Use standard engineering units (V, mA, Ω, W) and state relevant formulas (V = I·R, Req, τ = RC).`;

  const payload = {
    model: config.model,
    stream: false,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({ role: m.role, content: m.content }))
    ]
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeoutMs || 15000);

    const res = await fetch(chatUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const content = data?.message?.content || data?.response || '';
      if (content) {
        return { text: content.trim(), isLocalGemma: true };
      }
    }
  } catch (e) {
    console.warn('Ollama API call failed, generating offline guidance fallback:', e);
  }

  // Graceful offline fallback grounded in simulation context
  const offlineResponse = generateOfflineMentorResponse(messages[messages.length - 1]?.content || '', context, config);
  return {
    text: offlineResponse,
    isLocalGemma: false,
    error: `Ollama (${config.model} at ${cleanEndpoint}) is offline. Using built-in laboratory knowledge.`
  };
}

/**
 * Evaluates student viva answer using local Gemma (or expert fallback rubric)
 */
export async function evaluateVivaAnswer(
  question: string,
  studentAnswer: string,
  experimentTitle: string,
  difficulty: string,
  config: OllamaConfig = getOllamaConfig()
): Promise<VivaQuestionEvaluation> {
  const cleanEndpoint = config.endpoint.replace(/\/+$/, '');
  const chatUrl = `${cleanEndpoint}/api/chat`;

  const prompt = `You are an engineering viva examiner for the experiment "${experimentTitle}" at "${difficulty}" level.
Question: "${question}"
Student's Answer: "${studentAnswer}"

Evaluate the student's answer and respond ONLY with a valid JSON object matching this exact schema:
{
  "score": <number between 0 and 10>,
  "correctConcepts": ["list of correct points made by student"],
  "missingConcepts": ["list of important principles the student missed"],
  "incorrectStatements": ["list of factual errors, if any"],
  "modelAnswer": "clear, rigorous model answer suitable for an engineering exam",
  "explanation": "educational critique of their answer in 2-3 sentences",
  "followUpQuestion": "a relevant follow-up question to test deeper understanding"
}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(chatUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.model,
        stream: false,
        format: 'json',
        messages: [{ role: 'user', content: prompt }]
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const raw = data?.message?.content || '';
      const parsed = JSON.parse(raw);
      if (typeof parsed.score === 'number' && parsed.modelAnswer) {
        return {
          score: Math.min(10, Math.max(0, parsed.score)),
          correctConcepts: Array.isArray(parsed.correctConcepts) ? parsed.correctConcepts : [],
          missingConcepts: Array.isArray(parsed.missingConcepts) ? parsed.missingConcepts : [],
          incorrectStatements: Array.isArray(parsed.incorrectStatements) ? parsed.incorrectStatements : [],
          modelAnswer: parsed.modelAnswer,
          explanation: parsed.explanation || '',
          followUpQuestion: parsed.followUpQuestion
        };
      }
    }
  } catch (err) {
    console.warn('Ollama viva evaluation failed, applying expert rubric:', err);
  }

  // High quality deterministic viva evaluation fallback
  return evaluateVivaOffline(question, studentAnswer, experimentTitle);
}

/**
 * Intelligent deterministic fallback mentor for offline mode
 */
function generateOfflineMentorResponse(userQuery: string, context: MentorContext, config: OllamaConfig): string {
  const q = userQuery.toLowerCase();
  const readings = context.readings;

  if (q.includes('current zero') || q.includes('zero current') || q.includes('why is current 0') || q.includes('no current')) {
    if (readings?.status === 'POWER_OFF') {
      return `Your current is 0 A because the DC Power Supply is currently switched OFF. In any electrical circuit, free electrons require an applied external electric field (electromotive force) to produce net directional drift. Flip the Power Supply toggle to ON in the workspace to energize the circuit.`;
    }
    if (readings?.status === 'INCOMPLETE') {
      return `Current is zero because the circuit has an open connection or break in the conductive loop. In accordance with charge conservation, electrons cannot leap across open air gaps without breakdown voltages. Verify that all component terminals are connected with wires and that any switches in series are closed.`;
    }
    if (readings?.sourceVoltage === 0) {
      return `Current is zero because the DC Source voltage is currently set to 0.0 V. According to Ohm's Law (I = V / R), if V = 0, current I is mathematically 0 A regardless of resistance. Slide the voltage control upward to apply potential difference.`;
    }
  }

  if (q.includes('ohm') || q.includes('ohm\'s law') || q.includes('v = ir')) {
    return `Ohm's Law states that at a constant physical temperature, the electric current (I) flowing through an ohmic conductor is directly proportional to the potential difference (V) applied across its ends:

V = I · R

In your current setup, with V = ${readings?.sourceVoltage ?? 10} V and R = ${readings?.totalResistance ?? 100} Ω, the theoretical current is I = V / R = ${((readings?.sourceVoltage ?? 10) / (readings?.totalResistance ?? 100)).toFixed(3)} A.`;
  }

  if (q.includes('series') || q.includes('series circuit')) {
    return `In a series circuit:
1. The exact same current flows sequentially through every component: I_total = I_1 = I_2.
2. The equivalent total resistance is the direct algebraic sum: Req = R1 + R2 + ... + Rn.
3. The total voltage drops divide across each resistor proportional to its value: V_total = V1 + V2.`;
  }

  if (q.includes('parallel') || q.includes('parallel circuit')) {
    return `In a parallel circuit:
1. Every branch experiences the exact same voltage drop: V_branch = V_supply.
2. The total current splits across the branches: I_total = I_1 + I_2.
3. The equivalent resistance is calculated by reciprocal conductance: 1/Req = 1/R1 + 1/R2, meaning Req = (R1 · R2) / (R1 + R2). Req is always smaller than the smallest individual resistor!`;
  }

  if (q.includes('hint') || q.includes('next step')) {
    if (context.currentStep) {
      return `Here is a hint for your current step ("${context.currentStep}"): Look closely at the connection points highlighted on the board. Make sure terminal polarities match and there are no floating pins. Remember that circuit loops must start at DC (+) and return cleanly to DC (-).`;
    }
    return `To make progress, check your terminal connections: Ensure DC (+) connects to your resistor input, and the resistor output returns back to DC (-).`;
  }

  if (q.includes('mistake') || q.includes('error') || q.includes('problem')) {
    if (readings?.diagnostics && readings.diagnostics.length > 0) {
      const topDiag = readings.diagnostics[0];
      return `I detected an issue: "${topDiag.what}".
Location: ${topDiag.where}.
Why it matters: ${topDiag.why}
Recommended Action: ${topDiag.action}`;
    }
    return `Great job! Your circuit is currently fully compliant with no electrical or connection errors detected.`;
  }

  return `Regarding your question on "${context.experimentTitle}":
Under electrical engineering principles, verify your source voltage (currently ${readings?.sourceVoltage ?? 10} V) and equivalent resistance (${readings?.totalResistance ?? 100} Ω).
Notice that current I = V / R = ${((readings?.sourceVoltage ?? 10) / Math.max(0.1, readings?.totalResistance ?? 100)).toFixed(3)} A.

(Note: Connect your local Gemma model by running "ollama run ${config.model}" in Windows PowerShell to unlock open-ended neural dialogues.)`;
}

/**
 * Deterministic viva assessment rubric when Ollama is offline
 */
function evaluateVivaOffline(question: string, answer: string, experimentTitle: string): VivaQuestionEvaluation {
  const ans = answer.toLowerCase().trim();
  const wordCount = ans.split(/\s+/).length;

  let score = 5;
  const correctConcepts: string[] = [];
  const missingConcepts: string[] = [];
  const incorrectStatements: string[] = [];

  if (ans.length < 10) {
    return {
      score: 2,
      correctConcepts: ['Attempted to submit an answer'],
      missingConcepts: ['Elaboration and technical terminology', 'Mathematical formula', 'Physical conditions'],
      incorrectStatements: ['Answer is too brief to demonstrate conceptual mastery'],
      modelAnswer: getModelAnswerForQuestion(question),
      explanation: 'Your answer is too short for an engineering laboratory viva. Viva examiners expect complete statements referencing relevant physical laws and units.',
      followUpQuestion: 'Can you state the relevant formula and define each variable?'
    };
  }

  if (ans.includes('proportional') || ans.includes('directly proportional')) {
    score += 2;
    correctConcepts.push('Identified direct proportionality');
  }
  if (ans.includes('temperature') || ans.includes('constant temperature')) {
    score += 2;
    correctConcepts.push('Recognized constant temperature assumption');
  } else {
    missingConcepts.push('Mentioning constant physical temperature condition');
  }
  if (ans.includes('v = ir') || ans.includes('v=ir') || ans.includes('i = v/r') || ans.includes('req')) {
    score += 2;
    correctConcepts.push('Stated governing algebraic relationship');
  }
  if (ans.includes('series') && (ans.includes('same current') || ans.includes('current is same'))) {
    score += 2;
    correctConcepts.push('Recognized invariant current in series topology');
  }
  if (ans.includes('parallel') && (ans.includes('same voltage') || ans.includes('voltage is same'))) {
    score += 2;
    correctConcepts.push('Recognized invariant voltage across parallel branches');
  }

  score = Math.min(10, Math.max(3, score));

  return {
    score,
    correctConcepts: correctConcepts.length > 0 ? correctConcepts : ['Clear effort and familiarity with laboratory topic'],
    missingConcepts: missingConcepts.length > 0 ? missingConcepts : ['Secondary boundary conditions or units'],
    incorrectStatements,
    modelAnswer: getModelAnswerForQuestion(question),
    explanation: `Your answer demonstrates ${score >= 7 ? 'good' : 'fair'} conceptual awareness. In engineering examinations, always state governing equations and boundary conditions.`,
    followUpQuestion: 'What would happen if the operating temperature increased significantly?'
  };
}

function getModelAnswerForQuestion(question: string): string {
  const q = question.toLowerCase();
  if (q.includes("ohm's law") || q.includes('state ohm')) {
    return "Ohm's Law states that at constant temperature and physical conditions, the current (I) flowing through an ohmic conductor is directly proportional to the potential difference (V) applied across it: V = I · R, where R is the electrical resistance.";
  }
  if (q.includes('ammeter') && q.includes('series')) {
    return "An ammeter measures current, which is the flow rate of charge through a circuit path. It must be connected in series so that all electrons in that path pass through it. It has near-zero internal impedance (Ra ≈ 0) to avoid altering total circuit resistance.";
  }
  if (q.includes('voltmeter') && q.includes('parallel')) {
    return "A voltmeter measures potential difference between two separate nodes. It must be connected in parallel across those nodes. An ideal voltmeter has infinite internal resistance (Rv ≈ ∞) so that it draws negligible current from the circuit under test.";
  }
  if (q.includes('time constant') || q.includes('tau')) {
    return "The time constant τ = R · C represents the time taken for the capacitor voltage to reach 63.2% of its maximum steady-state value during charging, or to discharge down to 36.8% of its initial value.";
  }
  return "In electrical networks, currents and voltages are governed by Kirchhoff's laws and component constitutive relations. Ensure equations, boundary assumptions, and SI units (V, A, Ω, F) are explicitly stated.";
}
