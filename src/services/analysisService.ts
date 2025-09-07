// Hybrid Analysis API Service
export interface HybridAnalysisResult {
  job_id: string;
  environment_id: number;
  sha256: string;
  threat_score: number;
  verdict: string;
  analysis_start_time: string;
  submit_name: string;
}

export interface VirusTotalResult {
  data: {
    attributes: {
      last_analysis_stats: {
        harmless: number;
        malicious: number;
        suspicious: number;
        undetected: number;
      };
      last_analysis_results: Record<string, {
        category: string;
        engine_name: string;
        result: string | null;
      }>;
      sha256: string;
      meaningful_name: string;
      threat_names: string[];
    };
  };
}

class AnalysisService {
  private hybridAnalysisKey: string = '';
  private virusTotalKey: string = '';

  setApiKeys(hybridKey: string, vtKey: string) {
    this.hybridAnalysisKey = hybridKey;
    this.virusTotalKey = vtKey;
  }

  async submitToHybridAnalysis(file: File): Promise<HybridAnalysisResult> {
    if (!this.hybridAnalysisKey) {
      throw new Error('Hybrid Analysis API key não configurada');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('environment_id', '120'); // Windows 10 64-bit

    const response = await fetch('https://www.hybrid-analysis.com/api/v2/submit/file', {
      method: 'POST',
      headers: {
        'api-key': this.hybridAnalysisKey,
        'User-Agent': 'Falcon Sandbox'
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Hybrid Analysis error: ${error}`);
    }

    return response.json();
  }

  async getHybridAnalysisReport(jobId: string): Promise<any> {
    if (!this.hybridAnalysisKey) {
      throw new Error('Hybrid Analysis API key não configurada');
    }

    const response = await fetch(`https://www.hybrid-analysis.com/api/v2/report/${jobId}/summary`, {
      headers: {
        'api-key': this.hybridAnalysisKey,
        'User-Agent': 'Falcon Sandbox'
      }
    });

    if (!response.ok) {
      throw new Error('Falha ao obter relatório do Hybrid Analysis');
    }

    return response.json();
  }

  async submitToVirusTotal(file: File): Promise<any> {
    if (!this.virusTotalKey) {
      throw new Error('VirusTotal API key não configurada');
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('https://www.virustotal.com/api/v3/files', {
      method: 'POST',
      headers: {
        'X-Apikey': this.virusTotalKey
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`VirusTotal error: ${error}`);
    }

    return response.json();
  }

  async getVirusTotalReport(resourceId: string): Promise<VirusTotalResult> {
    if (!this.virusTotalKey) {
      throw new Error('VirusTotal API key não configurada');
    }

    const response = await fetch(`https://www.virustotal.com/api/v3/analyses/${resourceId}`, {
      headers: {
        'X-Apikey': this.virusTotalKey
      }
    });

    if (!response.ok) {
      throw new Error('Falha ao obter relatório do VirusTotal');
    }

    return response.json();
  }

  async getFileReportByHash(hash: string): Promise<VirusTotalResult> {
    if (!this.virusTotalKey) {
      throw new Error('VirusTotal API key não configurada');
    }

    const response = await fetch(`https://www.virustotal.com/api/v3/files/${hash}`, {
      headers: {
        'X-Apikey': this.virusTotalKey
      }
    });

    if (!response.ok) {
      throw new Error('Hash não encontrado no VirusTotal');
    }

    return response.json();
  }
}

export const analysisService = new AnalysisService();