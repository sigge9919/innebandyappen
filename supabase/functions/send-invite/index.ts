import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Authenticate the caller — only signed-in team members should be able to trigger invites.
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const token = authHeader.replace('Bearer ', '')
    const { data, error: authError } = await supabase.auth.getClaims(token)
    if (authError || !data?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { email, teamName, role, inviterName } = await req.json()

    if (!email || !teamName || !role || !inviterName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, teamName, role, inviterName' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      console.error('send-invite: RESEND_API_KEY is not configured')
      return new Response(
        JSON.stringify({ error: 'Email sending is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const roleLabels: Record<string, string> = {
      head_coach: 'Huvudtränare',
      assistant_coach: 'Assisterande tränare',
      stats_coach: 'Statistikansvarig',
      viewer: 'Åskådare',
      player: 'Spelare',
    }
    const roleLabel = roleLabels[role] ?? role

    const escapeHtml = (value: string) =>
      value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

    const appUrl = Deno.env.get('APP_URL') ?? 'https://floorballtactix.se'

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Floorball Tactix <noreply@floorballtactix.com>',
        to: [email],
        subject: `${escapeHtml(inviterName)} har bjudit in dig till "${escapeHtml(teamName)}" på Floorball Tactix`,
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h2>Du har blivit inbjuden!</h2>
            <p><strong>${escapeHtml(inviterName)}</strong> har bjudit in dig att gå med i laget <strong>${escapeHtml(teamName)}</strong> på Floorball Tactix, som <strong>${escapeHtml(roleLabel)}</strong>.</p>
            <p>Skapa ett konto med den här e-postadressen (${escapeHtml(email)}) för att automatiskt kopplas till laget.</p>
            <p><a href="${appUrl}" style="display: inline-block; padding: 10px 20px; background: #0d7d6f; color: #fff; text-decoration: none; border-radius: 6px;">Gå till Floorball Tactix</a></p>
          </div>
        `,
      }),
    })

    if (!resendRes.ok) {
      const errText = await resendRes.text()
      console.error('send-invite: Resend API error:', resendRes.status, errText)
      return new Response(
        JSON.stringify({ error: 'Failed to send invite email' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, message: `Invite sent to ${email}` }),
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
