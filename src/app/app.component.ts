import { Component, OnInit } from '@angular/core';
import { StockDataService } from '../service/stock-data.service';
import { ChartType } from 'angular-google-charts';
import { FormGroup, FormControl } from '@angular/forms'; // Import for reactive forms

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  symbol: string = 'MSFT';fetchedSymbol: string = '';
  stockData: any;
  stockOverview: { [key: string]: any } | null = null; // Stock overview data
  parsedData: { date: string, open: number, high: number, low: number, close: number, volume: number, change: number, openchange: number }[] = [];
  cachedData: any = {};
  displayData: { [key: string]: any } = {}; // Data to display in the list
  loading: boolean = false;
  error: string | null = null;
  numEntries = 100
  overallGain: number = 0; // Overall gain/loss percentage
  overallOpenGain: number = 0; // Overall gain/loss percentage based on opening prices
  daysTraded: number = 0; // Number of days traded
  isFixed = false; // Flag to toggle fixed header

  displayDataOrder: any;

    // Google Charts properties
  chartType: ChartType = ChartType.Histogram;
  chartData: any[] = []; // Data for the histogram
  chartOptions = {
    title: 'Daily Percentage Change Distribution',
    legend: { position: 'none' },
    colors: ['white'], // Tailwind blue-500
    backgroundColor: '#0d0d0d', // Dark background for better contrast
    histogram: { bucketSize: 1 }, // Set ticker increments to 1 (+1, -1)
    vAxis: { title: 'Number of Days Traded' },
    hAxis: { title: 'Percentage Change (%)' },
    height: 400,
    width: 300,
    chartArea: {
      left: 30,
      top: 40,
      right: 20,
      bottom: 60,
      width: '95%', // Adjust chart area width
      height: '70%' // Adjust chart area height
    },
    animation: {
      duration: 1000,
      easing: 'out',
      startup: true
    }
  };

  
  // Google Charts properties
  openChartData: any[] = []; // Data for the histogram
  openChartOptions = {
    title: 'Daily Percentage Change Distribution',
    legend: { position: 'none' },
    colors: ['white'], // Tailwind blue-500
    backgroundColor: '#0d0d0d', // Dark background for better contrast
    histogram: { bucketSize: 1 }, // Set ticker increments to 1 (+1, -1)
    vAxis: { title: 'Frequency' },
    hAxis: { title: 'Percentage Change (%)' },
    height: 400,
    chartArea: {
      left: 60,
      top: 40,
      right: 20,
      bottom: 60,
      width: '85%', // Adjust chart area width
      height: '70%' // Adjust chart area height
    },
    animation: {
      duration: 1000,
      easing: 'out',
      startup: true
    }
  };
  
  // Date Range Form Group
  public dateRangeForm = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  constructor(private stockDataService: StockDataService) { }

  ngOnInit(): void {
    // Optionally fetch initial data on component load
    // Set initial date range (e.g., last 3 months)
    const today = new Date();
    const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
    this.dateRangeForm.patchValue({
      start: threeMonthsAgo,
      end: today
    });
 
    this.updateGainers();
    this.updateAllData(); // Update all data for the new symbol
    // Do not call updateChart here; call it in ngAfterViewInit
    this.displayDataOrder = (a: any, b: any) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    };
  }

  updateGainers() {
    const chartContainer = document.getElementById('tradingview_gainers_container');
      if (!chartContainer) {
        return;
      }
      chartContainer.innerHTML = '';
      // Create the script element for the TradingView widget
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-hotlists.js';
      script.async = true;

      // Define the widget configuration as a global variable
      // Note: The container_id must match the ID of the div where the widget will be rendered.
      // For simplicity, we're assuming common exchanges like NASDAQ or NYSE.
      // You might need more sophisticated logic for other exchanges or international symbols.
      const widgetConfig = {
        "exchange": "US",
        "colorTheme": "dark",
        "dateRange": "12M",
        "showChart": false,
        "locale": "en",
        "largeChartUrl": "",
        "isTransparent": true,
        "showSymbolLogo": false,
        "showFloatingTooltip": false,
        "plotLineColorGrowing": "rgba(41, 98, 255, 1)",
        "plotLineColorFalling": "rgba(41, 98, 255, 1)",
        "gridLineColor": "rgba(240, 243, 250, 0)",
        "scaleFontColor": "#DBDBDB",
        "belowLineFillColorGrowing": "rgba(41, 98, 255, 0.12)",
        "belowLineFillColorFalling": "rgba(41, 98, 255, 0.12)",
        "belowLineFillColorGrowingBottom": "rgba(41, 98, 255, 0)",
        "belowLineFillColorFallingBottom": "rgba(41, 98, 255, 0)",
        "symbolActiveColor": "rgba(41, 98, 255, 0.12)",
        "width": 220,
        "height": 390
      };

      // Set the innerHTML of the script tag to the JSON configuration
      script.innerHTML = JSON.stringify(widgetConfig);
      console.log('TradingView widget script created with config:', widgetConfig);
      // Append the TradingView widget script
      chartContainer.appendChild(script);
  }
  
  // Function to load/update the TradingView widget
  updateOverview(ticker: string) {
      const chartContainer = document.getElementById('tradingview_overview_container');

      if (!chartContainer) {
        return;
      }

      chartContainer.innerHTML = '';
      // Create the script element for the TradingView widget
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-profile.js';
      script.async = true;

      // Define the widget configuration as a global variable
      // Note: The container_id must match the ID of the div where the widget will be rendered.
      // For simplicity, we're assuming common exchanges like NASDAQ or NYSE.
      // You might need more sophisticated logic for other exchanges or international symbols.
      const widgetConfig = {
          "symbol": `${ticker.toUpperCase()}`, // Dynamically set the symbol
          "colorTheme": "dark",
          "isTransparent": false,
          "locale": "en",
          "width": 350,
          "height": 526
      };

      // Set the innerHTML of the script tag to the JSON configuration
      script.innerHTML = JSON.stringify(widgetConfig);
      console.log('TradingView widget script created with config:', widgetConfig);
      // Append the TradingView widget script
      chartContainer.appendChild(script);
  }

  // Function to load/update the TradingView widget
  updateFundamentals(ticker: string) {
      // Clear any existing widget content

      const chartContainer = document.getElementById('tradingview_fundamentals_container');

      if (!chartContainer) {
        return;
      }

      chartContainer.innerHTML = '';
      // Create the script element for the TradingView widget
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-financials.js';
      script.async = true;

      // Define the widget configuration as a global variable
      // Note: The container_id must match the ID of the div where the widget will be rendered.
      // For simplicity, we're assuming common exchanges like NASDAQ or NYSE.
      // You might need more sophisticated logic for other exchanges or international symbols.
      const widgetConfig = {
          "symbol": `${ticker.toUpperCase()}`, // Dynamically set the symbol
          "colorTheme": "dark",
          "displayMode": "regular",
          "isTransparent": false,
          "locale": "en",
          "width": 350,
          "height": 526
      };

      // Set the innerHTML of the script tag to the JSON configuration
      script.innerHTML = JSON.stringify(widgetConfig);
      console.log('TradingView widget script created with config:', widgetConfig);
      // Append the TradingView widget script
      chartContainer.appendChild(script);
  }

  // Function to load/update the TradingView widget
  updateChart(ticker: string) {
      // Clear any existing widget content

      const chartContainer = document.getElementById('tradingview_chart_container');
      
      console.log('Updating chart for ticker:', chartContainer);
      if (!chartContainer) {
        return;
      }

      chartContainer.innerHTML = '';
      // Create the script element for the TradingView widget
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
      script.async = true;

      // Define the widget configuration as a global variable
      // Note: The container_id must match the ID of the div where the widget will be rendered.
      // For simplicity, we're assuming common exchanges like NASDAQ or NYSE.
      // You might need more sophisticated logic for other exchanges or international symbols.
      const widgetConfig = {
          "symbol": `${ticker.toUpperCase()}`, // Dynamically set the symbol
          "interval": "D",
          "timezone": "Etc/UTC",
          "theme": "dark",
          "style": "1",
          "locale": "en",
          "enable_publishing": false,
          "allow_symbol_change": false,
          "container_id": "tradingview_chart_container" // Must match the div ID
      };

      // Set the innerHTML of the script tag to the JSON configuration
      script.innerHTML = JSON.stringify(widgetConfig);
      console.log('TradingView widget script created with config:', widgetConfig);
      // Append the TradingView widget script
      chartContainer.appendChild(script);
  }

  fetchStockOverview(): void {
    if (!this.symbol.trim()) {
      this.error = 'Please enter a stock symbol.';
      return;
    }
    this.loading = true;
    this.error = null;
    this.fetchedSymbol = this.symbol.toUpperCase();
    this.stockDataService.getStockOverviewFromFile(this.fetchedSymbol)
      .subscribe({
        next: (data) => {
          this.stockOverview = data;
          this.loading = false;
          console.log('Fetched stock overview:', data);
        },
        error: (err) => {
          this.error = `Failed to fetch stock overview: ${err.message || 'An unknown error occurred'}. Please check your symbol and API key.`;
          this.loading = false;
          console.error('API Error:', err);
        }
      });
  }

  fetchStockData(): void {
    if (!this.symbol.trim()) {
      this.error = 'Please enter a stock symbol.';
      return;
    }

    this.loading = true;
    this.error = null;
    this.fetchedSymbol = this.symbol.toUpperCase();
    // if (this.cachedData[this.fetchedSymbol]) {
    //   // Use cached data if available
    //   this.stockData = this.cachedData[this.fetchedSymbol];
    //   this.parsedData = this.parseData(this.stockData);
    //   this.displayData = this.getLimitedData(this.parsedData);
    //   this.loading = false;
    //   console.log('Using cached data:', this.stockData);
    //   return;
    // }

    this.stockDataService.getDailyStockData(this.fetchedSymbol)
      .subscribe({
        next: (data) => {
          this.stockData = data;
          this.loading = false;
          this.parsedData = this.parseData(data);
          this.displayData = this.getLimitedData(this.parsedData);
          this.cachedData[this.fetchedSymbol] = data; // Cache the fetched data
          console.log('Fetched data:', data);
        },
        error: (err) => {
          this.error = `Failed to fetch data: ${err.message || 'An unknown error occurred'}. Please check your symbol and API key.`;
          this.loading = false;
          console.error('API Error:', err);
        }
      });
  }
  
  searchSymbol(ticker: string): void {
      if (!ticker.trim()) {
          this.error = 'Please enter a stock symbol.';
          return;
      }
      this.symbol = ticker.toUpperCase();
      this.fetchedSymbol = this.symbol;

      this.updateAllData(); // Update all data for the new symbol
  }
  
  updateAllData(): void {
    this.fetchStockData(); // Fetch stock data for the current symbol
    this.fetchStockOverview(); // Fetch stock overview for the current symbol
    this.updateChart(this.symbol); // Update the chart with the current symbol
    this.updateFundamentals(this.symbol); // Update the fundamentals with the current symbol
    this.updateOverview(this.symbol); // Update the overview with the current symbol
    this.isFixed = false; // Reset fixed header state when updating data
  }

  // Helper to limit the number of displayed entries for brevity
  getLimitedData(data: any): { [key: string]: any } {
    const startDate = this.dateRangeForm.value.start;
    const endDate = this.dateRangeForm.value.end;

    //calculate number of days in the date range
    let numDays = 0;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      // Calculate difference in milliseconds and convert to days (inclusive)
      this.daysTraded = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    }

    console.log('Date Range:', startDate, endDate);
    // Filter dates within the selected range
    const filteredData = data.filter((d: any) => {
      const date = new Date(d.date);
      return (!startDate || date >= startDate) && (!endDate || date <= endDate);
    })
    

    data = filteredData;
    console.log('Filtered data for date range:', data);

    if (!data) return {};
    // Sort data by date descending for display
    data = data.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    this.displayData = data;
    console.log('Sorted data:', this.displayData);

    this.chartData = []; // Reset chart data
    this.openChartData = []; // Reset open chart data
    
    this.overallGain = Number(((data[0].close - data[data.length - 1].open) / data[data.length - 1].open * 100).toFixed(2));
    this.overallOpenGain = 0;
    for (let i = 0; i < data.length; i++) {
      // Prepare data for the histogram
      this.chartData.push([
        data[i]['change'] // Use the change value for the histogram
      ]);
      this.openChartData.push([
        data[i]['openchange'] // Use the openchange value for the histogram
      ]);
      this.overallOpenGain += data[i].close - data[i].open; // Calculate overall open gain
    }
    this.overallOpenGain = this.overallOpenGain * 100 / data[data.length - 1].open; // Calculate overall open gain as a percentage
    return data;
  }

  parseData(data: any): { date: string, open: number, high: number, low: number, close: number, volume: number, change: number, openchange: number }[] {
    if (!data) return [];
    let keys = Object.keys(data).sort((a, b) => new Date(a).getTime() - new Date(b).getTime()); // Sort by date ascending
    let mappedKeys = keys.map(key => ({
      date: key,
      open: parseFloat(data[key]['1. open']),
      high: parseFloat(data[key]['2. high']),
      low: parseFloat(data[key]['3. low']),
      close: parseFloat(data[key]['4. close']),
      volume: parseFloat(data[key]['5. volume']),
      change: Number(((data[key]['4. close'] - data[key]['1. open']) / data[key]['1. open'] * 100).toFixed(2)), // Calculate percentage change
      openchange: 0
    }));

    for (let i = 1; i < mappedKeys.length; i++) {
      // Calculate change in opening price for consecutive days
      if (i > 0) {
        mappedKeys[i].openchange = Number(((mappedKeys[i].open - mappedKeys[i - 1].open) / mappedKeys[i - 1].open * 100).toFixed(2));
        this.overallOpenGain += Number(mappedKeys[i].open - mappedKeys[i - 1].open);
      }
    }
    return mappedKeys;
  }
}
