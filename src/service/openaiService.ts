// src/backend/services/openaiService.ts

import axios from 'axios';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const OPENAI_API_KEY = process.env['OPENAI_API_KEY'];
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'; // Endpoint for chat completions
const MODEL_NAME = 'gpt-4o-mini'; // Specify the model you want to use

interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

/**
 * Calls the OpenAI Chat Completions API with a given conversation history and context.
 *
 * @param conversationHistory An array of messages representing the ongoing conversation.
 * Each message should have a 'role' (system, user, or assistant) and 'content'.
 * @param systemContext (Optional) A system message to set the behavior or persona of the AI.
 * This is typically placed at the beginning of the conversation history.
 * @returns A Promise that resolves to the AI's response content (string) or throws an error.
 */
export async function getStockInsightFromAI(
    conversationHistory: ChatMessage[],
    systemContext?: string
): Promise<string> {
    if (!OPENAI_API_KEY) {
        throw new Error('OpenAI API key is not configured. Please set OPENAI_API_KEY in your .env file.');
    }

    // Construct the messages array for the OpenAI API
    const messages: ChatMessage[] = [];

    // Add system context if provided. This guides the AI's overall behavior.
    if (systemContext) {
        messages.push({ role: 'system', content: systemContext });
    }

    // Add the ongoing conversation history
    messages.push(...conversationHistory);

    try {
        const response = await axios.post(
            OPENAI_API_URL,
            {
                model: MODEL_NAME,
                messages: messages,
                temperature: 0.7, // Controls randomness: lower for more focused, higher for more creative
                max_tokens: 500,  // Maximum number of tokens in the AI's response
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                },
            }
        );

        // Extract the AI's response
        const aiResponseContent = response.data.choices[0]?.message?.content;

        if (!aiResponseContent) {
            throw new Error('No content received from OpenAI API.');
        }

        return aiResponseContent;

    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error calling OpenAI API:', error.response?.data || error.message);
            throw new Error(`OpenAI API Error: ${error.response?.data?.error?.message || error.message}`);
        } else {
            console.error('Unexpected error:', error);
            throw new Error('An unexpected error occurred while communicating with the AI.');
        }
    }
}

// Example usage (for testing within the service, not typically called directly in production)
/*
(async () => {
    const context = "You are a financial analyst providing concise stock insights based on provided data. Focus on key takeaways and future outlook.";
    const conversation = [
        { role: 'user', content: "News: 'AAPL stock up 5% on strong iPhone sales.' Ratios: 'P/E 25, Debt/Equity 0.8'. Risk: 'High competition in smartphone market.' What's your insight on AAPL?" }
    ];

    try {
        const insight = await getStockInsightFromAI(conversation, context);
        console.log("AI Insight:", insight);
    } catch (error) {
        console.error("Failed to get insight:", error);
    }
})();
*/