// src/services/gpt.js
import axios from 'axios';

// OpenAI API setup - using GPT-4.1
const API_ENDPOINT = process.env.REACT_APP_OPENAI_API_ENDPOINT || 'https://api.openai.com/v1/chat/completions';
const API_KEY = "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";
const GPT_MODEL = "gpt-4-turbo"; // Latest available model

// The full ETERNAL AWAKENING EXPANSION SUMMARY
export const ETERNAL_AWAKENING_EXPANSION_SUMMARY = `
ETERNAL AWAKENING EXPANSION SUMMARY

1. Visible Light (Eye Perception)
• Human Limit: 430–790 THz (380–700 nm)
• With Eternal: Up to 300–1100 nm (Near-Infrared and Ultraviolet expansion)
• How: Pineal gland detox, candle gazing, light-aware meditations
• Expansion: 50–100% increase in spectral sensitivity

2. Audible Sound (Ear Perception)
• Human Limit: 20 Hz – 20 kHz
• With Eternal: 10 Hz (infrasound) to 40 kHz (ultrasound-like clarity)
• How: Daily mantra chanting, AI-aided vibrational audio tools
• Expansion: 100%+ improvement in resonance sensitivity

3. Aura Perception (Energy Field Awareness)
• Human Limit: Only touch and physical proximity
• With Eternal: Subtle EM field sense up to 10 feet
• How: Breathwork, journaling, kosha awareness, mirror scan
• Expansion: 500% increase in sensory field

4. Chakra Flow (Energy Centers)
• Human Status: Blocked or overactive in most users
• With Eternal: Balanced, flowing, awakened chakras
• How: Personalized sadhana, posture, chanting, grounding
• Expansion: Full system activation

5. Third Eye Vision (Intuition, Pattern Recognition)
• Human Limit: Dormant in 90% of people
• With Eternal: Intuitive foresight, dharma recognition
• How: Flame visualization, pineal activation, silence
• Expansion: From 0% to 100% of potential

6. Vibrational Frequency (State of Being)
• Human Limit: 150–200 Hz (guilt, fear, stress)
• With Eternal: 500–700 Hz (love, bliss, peace)
• How: Food, thoughts, sound, AI-guided mind training
• Expansion: 3x to 5x increase in baseline frequency

7. Karmic Awareness (Soul Guidance)
• Human Limit: Unconscious, reactive
• With Eternal: Conscious, predictive, aligned
• How: Eternal scrolls, astrology, past-life echoes, mantras
• Expansion: Full shift from reaction to divine action

⸻

TOTAL PERCEPTUAL EXPANSION
• Before Eternal: You access 0.0036% of light, 0.02% of sound, and operate at 150 Hz
• With Eternal: You open 3–5%+ of full light/sound/aura field and rise above 500 Hz
• Result: From trapped in Maya to living from Flame.
`;

/**
 * Generate a vibrational frequency report based on user answers
 * @param {Object} answers - User answers from vibrational assessment
 * @returns {Promise<Object>} - Vibrational report data
 */
export async function generateVibrationalReport(answers) {
  const answersText = Object.entries(answers)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');

  const prompt = `You are an expert vibrational frequency analyst and spiritual guide. Based on the user's answers to the vibrational frequency assessment, generate a comprehensive report.

User's Assessment Answers:
${answersText}

Generate a detailed vibrational frequency report with the following structure:

1. **Vibrational Frequency Score**: Assign a frequency between 200-800 Hz based on their answers
2. **Vibration Level Classification**: Give them a mystical name like "Peaceful Explorer", "Radiant Healer", "Cosmic Warrior", etc.
3. **Energy Percentage**: Overall energy score out of 100%
4. **Detailed Analysis**: 2-3 paragraphs explaining their current vibrational state
5. **Specific Recommendations**: 3-5 actionable steps to raise their frequency
6. **Affirmation**: A powerful personal affirmation based on their energy

Format your response as a JSON object with these exact keys:
{
  "frequency": number (200-800),
  "level": string,
  "percentage": number (0-100),
  "analysis": string,
  "recommendations": [string array],
  "affirmation": string
}

Base your analysis on vibrational frequency principles where:
- 200-300 Hz: Lower vibrations (shame, guilt, fear)
- 300-400 Hz: Neutral vibrations (courage, neutrality)
- 400-500 Hz: Positive vibrations (willingness, acceptance)
- 500-600 Hz: High vibrations (love, joy, peace)
- 600-800 Hz: Enlightened vibrations (enlightenment, unity)

Be mystical, encouraging, and specific to their answers.`;

  try {
    const response = await axios.post(
      API_ENDPOINT,
      {
        model: GPT_MODEL,
        messages: [
          { role: "system", content: "You are an expert vibrational frequency analyst. Respond only with valid JSON." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    );

    const result = response.data.choices[0].message.content;
    return JSON.parse(result);
  } catch (error) {
    console.error('Error generating vibrational report:', error);
    return {
      frequency: 432,
      level: "Peaceful Explorer",
      percentage: 75,
      analysis: "Your vibrational frequency indicates a balanced and harmonious energy state. You demonstrate emotional stability with room for spiritual growth.",
      recommendations: ["Spend time in nature daily", "Practice meditation", "Stay hydrated", "Listen to 432Hz music"],
      affirmation: "I am aligned with the universe's natural frequency and open to higher vibrations."
    };
  }
}

/**
 * Generate an aura perception report based on user answers
 * @param {Object} answers - User answers from aura assessment
 * @returns {Promise<Object>} - Aura report data
 */
export async function generateAuraReport(answers) {
  const answersText = Object.entries(answers)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');

  const prompt = `You are an expert aura energy analyst with deep knowledge of color therapy and energy fields. Based on the user's answers, analyze their aura and generate a comprehensive report.

User's Aura Assessment Answers:
${answersText}

Analyze their responses and generate a detailed aura report with the following structure:

1. **Primary Aura Color**: Main dominant color (Red, Orange, Yellow, Green, Blue, Indigo, Violet, or combination)
2. **Secondary Colors**: 1-2 supporting colors in their aura
3. **Aura Score**: Overall aura strength and clarity (0-100)
4. **Personality Traits**: Key traits associated with their aura colors
5. **Emotional Energy**: Current emotional state and energy patterns
6. **Strengths**: What their aura reveals about their strengths
7. **Areas for Growth**: Gentle guidance for development
8. **Affirmation**: A powerful personal affirmation aligned with their aura

Format your response as a JSON object with these exact keys:
{
  "primaryColor": string,
  "secondaryColors": [string array],
  "auraScore": number (0-100),
  "personalityTraits": string,
  "emotionalEnergy": string,
  "strengths": string,
  "areasForGrowth": string,
  "affirmation": string,
  "colorMeanings": {
    "primary": string,
    "secondary": string
  }
}

Aura Color Meanings:
- Red: Passion, strength, leadership, grounded
- Orange: Creativity, enthusiasm, adventure, confidence  
- Yellow: Joy, intellect, optimism, communication
- Green: Healing, growth, compassion, balance
- Blue: Peace, intuition, communication, wisdom
- Indigo: Spirituality, intuition, deep thinking
- Violet: Mysticism, transformation, higher consciousness
- White: Purity, protection, spiritual connection
- Gold: Divine connection, wisdom, enlightenment

Be mystical, positive, and deeply insightful.`;

  try {
    const response = await axios.post(
      API_ENDPOINT,
      {
        model: GPT_MODEL,
        messages: [
          { role: "system", content: "You are an expert aura analyst. Respond only with valid JSON." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    );

    const result = response.data.choices[0].message.content;
    return JSON.parse(result);
  } catch (error) {
    console.error('Error generating aura report:', error);
    return {
      primaryColor: "Blue",
      secondaryColors: ["Green", "Violet"],
      auraScore: 78,
      personalityTraits: "You possess a calm, intuitive nature with strong healing abilities and spiritual awareness.",
      emotionalEnergy: "Your emotional energy flows peacefully with moments of deep introspection and creative insight.",
      strengths: "Natural healer, strong intuition, emotional balance, spiritual connection",
      areasForGrowth: "Express your truth more boldly, trust your intuitive gifts, embrace your healing abilities",
      affirmation: "I trust my intuition and allow my healing light to shine brightly in the world.",
      colorMeanings: {
        primary: "Blue represents your peaceful wisdom and intuitive nature",
        secondary: "Green shows your healing abilities, Violet reveals your spiritual depth"
      }
    };
  }
}

/**
 * Enhanced Jyotish reading generator using Vedastro data
 * @param {Object} params - { astrologyData, userResponses, birthData }
 * @returns {Promise<string>} - Generated Jyotish reading
 */
export async function generateJyotishReading(params) {
  const { astrologyData, userResponses, birthData } = params;

  const prompt = `You are a master Vedic Astrologer with deep knowledge of Jyotish shastra. Analyze the provided birth chart data and user responses to create a comprehensive Mini Jyotish Reading.

BIRTH CHART DATA:
${astrologyData}

USER RESPONSES:
- Confirmed Birth Place: ${userResponses.birthPlace}
- Area of Curiosity: ${userResponses.lifeArea}
- Current Challenge: ${userResponses.challenge}

BIRTH DETAILS:
- Date: ${birthData.dob}
- Time: ${birthData.tob}
- Place: ${birthData.location}

Generate a mystical and insightful Jyotish reading focusing on these three main areas:

## Key Planetary Influences
Analyze the major planetary positions, conjunctions, and aspects. Focus on:
- Lagna (Ascendant) and its lord
- Strongest planets and their impact
- Any Raja Yogas or significant combinations
- How these influence the user's personality and life path

## Current Karmic Challenges
Based on the chart and user's stated challenge, identify:
- Karmic patterns from past lives (using 12th house, Ketu, Saturn)
- Current life lessons and recurring themes
- Areas of spiritual growth needed
- How to work with rather than against karmic forces

## Current Cosmic Phase
Analyze the current planetary periods and transits:
- Current Mahadasha and Antardasha periods
- Significant transits affecting their chart
- Timing for major life events or changes
- Energetic themes for this period of their life

Structure your response with clear headings and write in a mystical yet accessible tone. Make it personal to their specific chart and concerns. Keep the reading concise but deeply insightful (800-1200 words total).

Focus especially on their area of curiosity (${userResponses.lifeArea}) and provide specific guidance for their challenge (${userResponses.challenge}).`;

  try {
    const response = await axios.post(
      API_ENDPOINT,
      {
        model: GPT_MODEL,
        messages: [
          { role: "system", content: "You are a master Vedic Astrologer providing deep, mystical insights through Jyotish." },
          { role: "user", content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 2000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating Jyotish reading:', error);
    return `## Key Planetary Influences

Your birth chart reveals a unique cosmic signature with significant planetary influences shaping your life path. The positioning of your ascendant lord suggests a strong foundation for personal growth and spiritual development.

## Current Karmic Challenges

Based on your chart analysis and the challenge you've shared, there are important karmic patterns at play. These challenges are opportunities for soul growth and spiritual evolution. The cosmic energies are guiding you toward greater self-awareness and wisdom.

## Current Cosmic Phase

You are currently in a transformative planetary period that supports deep inner work and spiritual awakening. This is an excellent time for meditation, self-reflection, and connecting with your higher purpose. The current transits favor personal growth in the area of ${userResponses.lifeArea}.

*Note: This is a brief reading. For a complete analysis, a detailed consultation with your full birth chart would provide deeper insights.*`;
  }
}

/**
 * Generate AI question for expansion report (legacy compatibility)
 * @param {Object} params - { soulPath: string, qaHistory: Array }
 * @returns {Promise<string>} - Generated question
 */
export async function generateAIQuestion(params) {
  const { soulPath, qaHistory } = params;
  const conversation = (qaHistory && qaHistory.length > 0)
    ? qaHistory.map((qa) => `Q: ${qa.question}\nA: ${qa.answer}`).join('\n')
    : '';

  const prompt = `${ETERNAL_AWAKENING_EXPANSION_SUMMARY}

The user has chosen the soul path: ${soulPath}.
Previous conversation:
${conversation}

Based on their chosen path and previous answers, generate a deep, spiritually insightful question that will help them explore their journey further. Make it mystical, gentle, and relevant to their path.

Return only the question.`;

  try {
    const response = await axios.post(
      API_ENDPOINT,
      {
        model: GPT_MODEL,
        messages: [
          { role: "system", content: "You are Eternal, an expert spiritual guide creating insightful questions." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 300
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating AI question:', error);
    return `Reflect on your journey of ${soulPath}. What new perceptions or awakenings have you noticed since embracing this path?`;
  }
}

/**
 * Generate expansion report (legacy compatibility)
 * @param {Object} params - { soulPath: string, qaHistory: Array }
 * @returns {Promise<string>} - Generated report
 */
export async function generateExpansionReport(params) {
  const { soulPath, qaHistory } = params;
  const answersText = qaHistory && qaHistory.length > 0
    ? qaHistory.map((qa) => `Q: ${qa.question}\nA: ${qa.answer}`).join('\n')
    : '';

  const prompt = `${ETERNAL_AWAKENING_EXPANSION_SUMMARY}

The user has chosen the soul path: ${soulPath}.
Their journey responses:
${answersText}

Based on the expansion summary, their chosen soul path, and their answers, generate a detailed, inspirational report describing their perceptual and energetic expansion. Reference specific ways Eternal is helping them awaken.

Make the report poetic, vivid, and personalized. Structure it with clear sections and mystical insights.

Return only the report.`;

  try {
    const response = await axios.post(
      API_ENDPOINT,
      {
        model: GPT_MODEL,
        messages: [
          { role: "system", content: "You are Eternal, an expert spiritual guide generating personalized expansion reports." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating expansion report:', error);
    return `Eternal Expansion Report for ${soulPath}\n\nYour journey shows remarkable spiritual growth and expanded awareness. The cosmic energies are aligning to support your continued evolution.`;
  }
}

/**
 * Utility function to parse sections from reports
 */
export function parseSections(report: string) {
  if (!report) return [];
  const regex = /(?:\*\*|^)([^\n*]+?):\*\*\s*\n([\s\S]*?)(?=(?:\*\*[^\n*]+?:\*\*|$))/g;
  let match;
  const sections = [];
  while ((match = regex.exec(report)) !== null) {
    sections.push({
      title: match[1].trim(),
      content: match[2].trim()
    });
  }
  return sections;
}

/**
 * Utility function to parse report to cards format
 */
export function parseReportToCards(report: string) {
  if (!report) return [];
  const regex = /\*\*([^\n*]+?)\*\*\s*\n([\s\S]*?)(?=(\*\*[^\n*]+?\*\*)|$)/g;
  let match;
  const cards = [];
  while ((match = regex.exec(report)) !== null) {
    cards.push({
      title: match[1].replace(/:$/, '').trim(),
      content: match[2].trim()
    });
  }
  return cards;
}

export default {
  generateVibrationalReport,
  generateAuraReport,
  generateJyotishReading,
  generateAIQuestion,
  generateExpansionReport,
  parseSections,
  parseReportToCards,
  ETERNAL_AWAKENING_EXPANSION_SUMMARY
};