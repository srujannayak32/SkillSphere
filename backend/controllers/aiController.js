// backend/controllers/aiController.js
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const askAI = async (req, res) => {
  try {
    const { message, context } = req.body;
    
    const response = await openai.chat.completions.create({
      model: process.env.AI_MODEL,
      messages: [
        {
          role: "system",
          content: `You are SkillSphere AI, a helpful assistant for a mentorship platform. 
          You help users with learning resources, mentorship advice, and technical questions.
          Current context: ${context || 'general question'}`
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    res.json({
      answer: response.choices[0].message.content
    });
  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ error: 'Failed to get AI response' });
  }
};