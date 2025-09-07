// Data management utilities for cleaning and downloading data

export interface AppData {
  apiKeys: {
    hybridAnalysis: string;
    virusTotal: string;
  };
  analysisResults: any[];
  userNotes: string;
  timestamp: string;
}

export class DataManager {
  
  // Get all app data
  static getAllData(): AppData {
    return {
      apiKeys: {
        hybridAnalysis: localStorage.getItem('hybridAnalysisKey') || '',
        virusTotal: localStorage.getItem('virusTotalKey') || ''
      },
      analysisResults: JSON.parse(localStorage.getItem('analysisResults') || '[]'),
      userNotes: localStorage.getItem('userNotes') || '',
      timestamp: new Date().toISOString()
    };
  }

  // Download data as JSON file
  static downloadData() {
    const data = this.getAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `painel-cybersec-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Clear all app data
  static clearAllData() {
    // Clear localStorage
    localStorage.removeItem('hybridAnalysisKey');
    localStorage.removeItem('virusTotalKey');
    localStorage.removeItem('analysisResults');
    localStorage.removeItem('userNotes');
    
    // Clear any other stored data
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('cyber-panel-') || key.includes('analysis') || key.includes('virus')) {
        localStorage.removeItem(key);
      }
    });
  }

  // Save analysis result
  static saveAnalysisResult(result: any) {
    const results = JSON.parse(localStorage.getItem('analysisResults') || '[]');
    results.push({
      ...result,
      timestamp: new Date().toISOString(),
      id: Date.now()
    });
    localStorage.setItem('analysisResults', JSON.stringify(results));
  }

  // Get saved analysis results
  static getSavedResults() {
    return JSON.parse(localStorage.getItem('analysisResults') || '[]');
  }

  // Save user notes
  static saveNotes(notes: string) {
    localStorage.setItem('userNotes', notes);
  }

  // Get user notes
  static getNotes(): string {
    return localStorage.getItem('userNotes') || '';
  }
}