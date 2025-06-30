import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StockDataService {
  private API_KEY = 'demo'; // Replace with your actual Alpha Vantage API key
  private BASE_URL = 'https://www.alphavantage.co/query';

  constructor(private http: HttpClient) { }

  /**
   * Fetches daily time series data for a given stock symbol.
   * @param symbol The stock symbol (e.g., 'MSFT').
   * @returns An Observable of the parsed stock data.
   */
  getDailyStockData(symbol: string): Observable<any> {
    const url = `${this.BASE_URL}?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=full&apikey=${this.API_KEY}`;
    return this.http.get(url).pipe(
      map((response: any) => {
        // Basic parsing: extracting the 'Time Series (Daily)' part of the response
        if (response && response['Time Series (Daily)']) {
          return response['Time Series (Daily)'];
        }
        throw new Error('Invalid API response format');
      })
    );
  }

  getStockOverviewFromFile(symbol: string): Observable<any> {
    // This method is for testing purposes, simulating a file read operation
    return new Observable(observer => {
      // Simulating a file read with static data
      const mockData = {
        Symbol: symbol,
        Name: 'Microsoft Corporation',
        Description: 'Microsoft Corporation develops, licenses, and supports software products, services, and devices worldwide.',
        Sector: 'Technology',
        Industry: 'Software - Application',
        MarketCapitalization: 2000000000000,
        PERatio: 35.67,
        ForwardPE: 30.12,
        '52WeekHigh': 350.00,
        '52WeekLow': 250.00,
        EPS: 8.50,
        DividendYield: 0.85,
        PercentInstitutions: 75.5,
        DividendDate: '2023-09-15',
        ExDividendDate: '2023-08-15'
      };
      observer.next(mockData);
      observer.complete();
    });
  }

  /**
   * Fetches daily time series data for a given stock symbol.
   * @param symbol The stock symbol (e.g., 'MSFT').
   * @returns An Observable of the parsed stock data.
   */
  getStockOverview(symbol: string): Observable<any> {
    const url = `${this.BASE_URL}?function=OVERVIEW&symbol=${symbol}&apikey=${this.API_KEY}`;
    return this.http.get(url).pipe(
      map((response: any) => {
        // Basic parsing: extracting the relevant fields from the response
        if (response) {
          console.log('API Response:', response);
          return {
            Symbol: response['Symbol'],
            Name: response['Name'],
            Description: response['Description'],
            Sector: response['Sector'],
            Industry: response['Industry'],
            'Market Capitalization': response['MarketCapitalization'],
            'P/E Ratio': response['PERatio'],
            'Forward P/E Ratio': response['ForwardPE'],
            '52 Week High': response['52WeekHigh'],
            '52 Week Low': response['52WeekLow'],
            'EPS': response['EPS'],
            'Dividend Yield': response['DividendYield'],
            'Percent Institutions': response['PercentInstitutions'],
            'Dividend Date': response['DividendDate'],
            'Ex-Dividend Date': response['ExDividendDate']
          };
        }
        throw new Error('Invalid API response format');
      })
    );
  }
}
