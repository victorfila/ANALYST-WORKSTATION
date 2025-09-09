// Data management utilities for cleaning and downloading data
import { AppDataSchema, safeParseJSON, sanitizeString, sanitizeFileName } from './validation';

export interface AppData {
  apiKeys: {
    hybridAnalysis: string;
    virusTotal: string;
  };
  analysisResults: any[];
  userNotes: string;
  timestamp: string;
}

export interface ExportOptions {
  includeApiKeys?: boolean;
  includeAnalysisResults?: boolean;
  includeNotes?: boolean;
}

export class DataManager {
  
  // Get all app data with validation
  static getAllData(): AppData {
    const fallback: AppData = {
      apiKeys: { hybridAnalysis: '', virusTotal: '' },
      analysisResults: [],
      userNotes: '',
      timestamp: new Date().toISOString()
    };

    try {
      const data = {
        apiKeys: {
          hybridAnalysis: localStorage.getItem('hybridAnalysisKey') || '',
          virusTotal: localStorage.getItem('virusTotalKey') || ''
        },
        analysisResults: safeParseJSON(
          localStorage.getItem('analysisResults') || '[]',
          AppDataSchema.shape.analysisResults,
          []
        ),
        userNotes: sanitizeString(localStorage.getItem('userNotes') || ''),
        timestamp: new Date().toISOString()
      };
      return data;
    } catch (error) {
      console.error('Error loading app data:', error);
      return fallback;
    }
  }

  // Download data as JSON file with security options
  static downloadData(options: ExportOptions = {}) {
    const data = this.getAllData();
    
    // Create secure export data
    const exportData: Partial<AppData> = {
      timestamp: data.timestamp
    };

    // Only include API keys if explicitly requested (security measure)
    if (options.includeApiKeys) {
      exportData.apiKeys = data.apiKeys;
    }

    // Include analysis results by default unless explicitly excluded
    if (options.includeAnalysisResults !== false) {
      exportData.analysisResults = data.analysisResults;
    }

    // Include notes by default unless explicitly excluded
    if (options.includeNotes !== false) {
      exportData.userNotes = data.userNotes;
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const fileName = sanitizeFileName(`painel-cybersec-backup-${new Date().toISOString().split('T')[0]}.json`);
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Update clearAllData to also clear mural state
  static clearAllData() {
    console.log('DataManager: Clearing all data...');
    console.log('DataManager: Before clear - localStorage keys:', Object.keys(localStorage));
    
    // Clear all localStorage data
    localStorage.clear();
    
    // Also clear sessionStorage for complete reset
    sessionStorage.clear();
    
    console.log('DataManager: After clear - localStorage keys:', Object.keys(localStorage));
    console.log('DataManager: All data cleared from localStorage and sessionStorage');
  }

  // Save analysis result with validation
  static saveAnalysisResult(result: any) {
    try {
      const results = safeParseJSON(
        localStorage.getItem('analysisResults') || '[]',
        AppDataSchema.shape.analysisResults,
        []
      );
      
      const sanitizedResult = {
        ...result,
        fileName: sanitizeFileName(result.fileName || ''),
        timestamp: new Date().toISOString(),
        id: Date.now()
      };
      
      results.push(sanitizedResult);
      localStorage.setItem('analysisResults', JSON.stringify(results));
    } catch (error) {
      console.error('Error saving analysis result:', error);
    }
  }

  // Get saved analysis results with validation
  static getSavedResults() {
    return safeParseJSON(
      localStorage.getItem('analysisResults') || '[]',
      AppDataSchema.shape.analysisResults,
      []
    );
  }

  // Save user notes with sanitization
  static saveNotes(notes: string) {
    const sanitizedNotes = sanitizeString(notes);
    localStorage.setItem('userNotes', sanitizedNotes);
  }

  // Get user notes
  static getNotes(): string {
    return localStorage.getItem('userNotes') || '';
  }
}