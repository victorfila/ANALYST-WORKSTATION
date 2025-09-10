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
    const { action, file, resourceId, hash } = await req.json()
    const apiKey = Deno.env.get('VIRUSTOTAL_API_KEY')

    if (!apiKey) {
      throw new Error('VirusTotal API key not configured')
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

      const response = await fetch('https://www.virustotal.com/api/v3/files', {
        method: 'POST',
        headers: {
          'X-Apikey': apiKey
        },
        body: formData
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`VirusTotal error: ${error}`)
      }

      const result = await response.json()
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })

    } else if (action === 'report') {
      const response = await fetch(`https://www.virustotal.com/api/v3/analyses/${resourceId}`, {
        headers: {
          'X-Apikey': apiKey
        }
      })

      if (!response.ok) {
        throw new Error('Failed to get VirusTotal report')
      }

      const result = await response.json()
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })

    } else if (action === 'hash-report') {
      const response = await fetch(`https://www.virustotal.com/api/v3/files/${hash}`, {
        headers: {
          'X-Apikey': apiKey
        }
      })

      if (!response.ok) {
        throw new Error('Hash not found in VirusTotal')
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