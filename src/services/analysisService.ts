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
  private supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix to get pure base64
        resolve(result.split(',')[1]);
      };
      reader.onerror = error => reject(error);
    });
  }

  async submitToHybridAnalysis(file: File): Promise<HybridAnalysisResult> {
    try {
      const base64Data = await this.fileToBase64(file);
      
      const response = await fetch(`${this.supabaseUrl}/functions/v1/hybrid-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'submit',
          file: {
            name: file.name,
            type: file.type,
            data: base64Data
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Hybrid Analysis submission failed');
      }

      return response.json();
    } catch (error) {
      console.error('Hybrid Analysis error:', error);
      throw new Error('Falha ao enviar arquivo para Hybrid Analysis');
    }
  }

  async getHybridAnalysisReport(jobId: string): Promise<any> {
    try {
      const response = await fetch(`${this.supabaseUrl}/functions/v1/hybrid-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'report',
          jobId: jobId
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get Hybrid Analysis report');
      }

      return response.json();
    } catch (error) {
      console.error('Hybrid Analysis report error:', error);
      throw new Error('Falha ao obter relatório do Hybrid Analysis');
    }
  }

  async submitToVirusTotal(file: File): Promise<any> {
    try {
      const base64Data = await this.fileToBase64(file);
      
      const response = await fetch(`${this.supabaseUrl}/functions/v1/virustotal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'submit',
          file: {
            name: file.name,
            type: file.type,
            data: base64Data
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'VirusTotal submission failed');
      }

      return response.json();
    } catch (error) {
      console.error('VirusTotal error:', error);
      throw new Error('Falha ao enviar arquivo para VirusTotal');
    }
  }

  async getVirusTotalReport(resourceId: string): Promise<VirusTotalResult> {
    try {
      const response = await fetch(`${this.supabaseUrl}/functions/v1/virustotal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'report',
          resourceId: resourceId
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get VirusTotal report');
      }

      return response.json();
    } catch (error) {
      console.error('VirusTotal report error:', error);
      throw new Error('Falha ao obter relatório do VirusTotal');
    }
  }

  async getFileReportByHash(hash: string): Promise<VirusTotalResult> {
    try {
      const response = await fetch(`${this.supabaseUrl}/functions/v1/virustotal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'hash-report',
          hash: hash
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Hash not found in VirusTotal');
      }

      return response.json();
    } catch (error) {
      console.error('VirusTotal hash report error:', error);
      throw new Error('Hash não encontrado no VirusTotal');
    }
  }
}

export const analysisService = new AnalysisService();