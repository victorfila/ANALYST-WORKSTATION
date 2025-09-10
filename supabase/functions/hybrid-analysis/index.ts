import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, file, jobId } = await req.json()
    const apiKey = Deno.env.get('HYBRID_ANALYSIS_API_KEY')

    if (!apiKey) {
      throw new Error('Hybrid Analysis API key not configured')
    }

    if (action === 'submit') {
      // Convert base64 file to FormData
      const binaryString = atob(file.data)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      
      const formData = new FormData()
      formData.append('file', new File([bytes], file.name, { type: file.type }))
      formData.append('environment_id', '120') // Windows 10 64-bit

      const response = await fetch('https://www.hybrid-analysis.com/api/v2/submit/file', {
        method: 'POST',
        headers: {
          'api-key': apiKey,
          'User-Agent': 'Falcon Sandbox'
        },
        body: formData
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Hybrid Analysis error: ${error}`)
      }

      const result = await response.json()
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })

    } else if (action === 'report') {
      const response = await fetch(`https://www.hybrid-analysis.com/api/v2/report/${jobId}/summary`, {
        headers: {
          'api-key': apiKey,
          'User-Agent': 'Falcon Sandbox'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to get Hybrid Analysis report')
      }

      const result = await response.json()
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    throw new Error('Invalid action')

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})