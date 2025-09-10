import { createClient } from '@supabase/supabase-js'

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
  private supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL || '',
    import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  );

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
      console.log('🔄 Enviando arquivo para Hybrid Analysis...', file.name);
      const base64Data = await this.fileToBase64(file);
      
      const { data, error } = await this.supabase.functions.invoke('hybrid-analysis', {
        body: {
          action: 'submit',
          file: {
            name: file.name,
            type: file.type,
            data: base64Data
          }
        }
      });

      if (error) {
        console.error('❌ Erro Hybrid Analysis:', error);
        throw new Error(error.message || 'Hybrid Analysis submission failed');
      }

      console.log('✅ Arquivo enviado para Hybrid Analysis com sucesso:', data);
      return data;
    } catch (error) {
      console.error('❌ Hybrid Analysis error:', error);
      throw new Error('Falha ao enviar arquivo para Hybrid Analysis');
    }
  }

  async getHybridAnalysisReport(jobId: string): Promise<any> {
    try {
      const { data, error } = await this.supabase.functions.invoke('hybrid-analysis', {
        body: {
          action: 'report',
          jobId: jobId
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to get Hybrid Analysis report');
      }

      return data;
    } catch (error) {
      console.error('Hybrid Analysis report error:', error);
      throw new Error('Falha ao obter relatório do Hybrid Analysis');
    }
  }

  async submitToVirusTotal(file: File): Promise<any> {
    try {
      console.log('🔄 Enviando arquivo para VirusTotal...', file.name);
      const base64Data = await this.fileToBase64(file);
      
      const { data, error } = await this.supabase.functions.invoke('virustotal', {
        body: {
          action: 'submit',
          file: {
            name: file.name,
            type: file.type,
            data: base64Data
          }
        }
      });

      if (error) {
        console.error('❌ Erro VirusTotal:', error);
        throw new Error(error.message || 'VirusTotal submission failed');
      }

      console.log('✅ Arquivo enviado para VirusTotal com sucesso:', data);
      return data;
    } catch (error) {
      console.error('❌ VirusTotal error:', error);
      throw new Error('Falha ao enviar arquivo para VirusTotal');
    }
  }

  async getVirusTotalReport(resourceId: string): Promise<VirusTotalResult> {
    try {
      const { data, error } = await this.supabase.functions.invoke('virustotal', {
        body: {
          action: 'report',
          resourceId: resourceId
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to get VirusTotal report');
      }

      return data;
    } catch (error) {
      console.error('VirusTotal report error:', error);
      throw new Error('Falha ao obter relatório do VirusTotal');
    }
  }

  async getFileReportByHash(hash: string): Promise<VirusTotalResult> {
    try {
      const { data, error } = await this.supabase.functions.invoke('virustotal', {
        body: {
          action: 'hash-report',
          hash: hash
        }
      });

      if (error) {
        throw new Error(error.message || 'Hash not found in VirusTotal');
      }

      return data;
    } catch (error) {
      console.error('VirusTotal hash report error:', error);
      throw new Error('Hash não encontrado no VirusTotal');
    }
  }
}

export const analysisService = new AnalysisService();