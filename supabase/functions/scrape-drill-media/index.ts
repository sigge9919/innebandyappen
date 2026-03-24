import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function decodeHtmlEntities(str: string): string {
  return str.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

function isAllowedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.hostname === 'www.innebandy.se' || parsed.hostname === 'innebandy.se';
  } catch {
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the caller
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data, error: authError } = await supabase.auth.getClaims(token);
    if (authError || !data?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { url } = await req.json();

    // Strict hostname validation to prevent SSRF
    if (!url || !isAllowedUrl(url)) {
      return new Response(JSON.stringify({ videoSrc: null, thumbnailSrc: null }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    const html = await res.text();

    // Extract Vimeo MP4 source (decode HTML entities)
    const videoMatch = html.match(/<source\s+src="([^"]*vimeo[^"]*\.mp4[^"]*)"/);
    const videoSrc = videoMatch ? decodeHtmlEntities(videoMatch[1]) : null;

    // Extract thumbnail image from <picture> > <source srcset> or <img>
    let thumbnailSrc: string | null = null;
    
    // Try srcset in picture element
    const srcsetMatch = html.match(/<source\s+srcset="([^"]*innebandy\.se[^"]*\.(jpg|jpeg|png|gif|webp)[^"]*)"/i);
    if (srcsetMatch && !srcsetMatch[1].includes('placeholder')) {
      thumbnailSrc = decodeHtmlEntities(srcsetMatch[1].split(',')[0].trim().split(' ')[0]);
    }

    // Try img src
    if (!thumbnailSrc) {
      const imgMatch = html.match(/<img[^>]+src="([^"]*innebandy\.se[^"]*\.(jpg|jpeg|png|gif|webp)[^"]*)"/i);
      if (imgMatch && !imgMatch[1].includes('placeholder')) {
        thumbnailSrc = decodeHtmlEntities(imgMatch[1]);
      }
    }

    return new Response(JSON.stringify({ videoSrc, thumbnailSrc }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ videoSrc: null, thumbnailSrc: null, error: 'Internal error' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
