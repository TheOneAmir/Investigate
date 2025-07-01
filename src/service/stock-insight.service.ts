// src/app/services/stock-insight.service.ts (Example Angular Service)

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface StockInsightRequest {
  ticker: string;
  news: string;
  ratios: string;
  riskMetrics: string;
  conversationHistory?: ChatMessage[];
}

interface StockInsightResponse {
  insight: string;
}

@Injectable({
  providedIn: 'root'
})
export class StockInsightService {
  private backendUrl = 'http://localhost:3001/api/stock-insight'; // Match your backend URL

  // Maintain conversation history in your service or component state
  private currentConversationHistory: ChatMessage[] = [];

  constructor(private http: HttpClient) { }

  getInsight(
    ticker: string,
    news: string,
    ratios: string,
    riskMetrics: string
  ): Observable<StockInsightResponse> {
    const requestBody: StockInsightRequest = {
      ticker,
      news,
      ratios,
      riskMetrics,
      conversationHistory: this.currentConversationHistory // Pass existing history
    };

    return this.http.post<StockInsightResponse>(this.backendUrl, requestBody);
  }

  // Method to update conversation history after getting a response
  updateConversation(userMessage: string, aiResponse: string) {
    this.currentConversationHistory.push({ role: 'user', content: userMessage });
    this.currentConversationHistory.push({ role: 'assistant', content: aiResponse });
  }

  // Method to clear conversation history
  clearConversation() {
    this.currentConversationHistory = [];
  }
}