import { corsHeaders } from '@supabase/supabase-js/cors'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, teamName, role, inviterName } = await req.json()

    if (!email || !teamName || !role || !inviterName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, teamName, role, inviterName' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Log the invite (actual email sending can be wired up later with an email provider)
    console.log(`Invite requested: ${email} to team "${teamName}" as ${role} by ${inviterName}`)

    return new Response(
      JSON.stringify({ success: true, message: `Invite logged for ${email}` }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('send-invite error:', message)
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
