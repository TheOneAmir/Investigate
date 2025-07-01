// src/backend/routes/aiRoutes.ts

import { Router, Request, Response } from 'express';
import { getStockInsightFromAI } from '../services/openaiService';

const router = Router();

// Define the structure for the request body
interface StockInsightRequest {
    ticker: string;
    news: string;
    ratios: string; // You might want a more structured type here later
    riskMetrics: string; // You might want a more structured type here later
    conversationHistory?: Array<{ role: 'user' | 'assistant', content: string }>;
}

router.post('/stock-insight', async (req: Request<{}, {}, StockInsightRequest>, res: Response) => {
    const { ticker, news, ratios, riskMetrics, conversationHistory = [] } = req.body;

    if (!ticker || !news || !ratios || !riskMetrics) {
        return res.status(400).json({ error: 'Missing required stock data (ticker, news, ratios, riskMetrics).' });
    }

    // Construct the user's current query for the AI
    const userQuery = `
        Provide a concise stock insight for ${ticker} based on the following information:
        News: ${news}
        Financial Ratios: ${ratios}
        Risk Metrics: ${riskMetrics}
    `;

    // Add the current user query to the conversation history
    const fullConversation: Array<{ role: 'user' | 'assistant', content: string }> = [
        ...conversationHistory,
        { role: 'user', content: userQuery }
    ];

    // Define a system context to guide the AI's persona and output format
    const systemContext = `
        You are a highly experienced financial analyst. Your task is to provide clear, concise, and actionable stock insights.
        Analyze the provided news, financial ratios, and risk metrics.
        Your response should be a brief summary, highlighting key positives, negatives, and a forward-looking perspective.
        Do not include disclaimers about not being financial advice; keep it focused on the analysis.
        If the data is insufficient, state that.
    `;

    try {
        const insight = await getStockInsightFromAI(fullConversation, systemContext);
        res.json({ insight: insight });
    } catch (error: any) {
        console.error('Error generating stock insight:', error);
        res.status(500).json({ error: error.message || 'Failed to generate stock insight.' });
    }
});

export default router;