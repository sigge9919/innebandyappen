const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    if (!url || !url.includes('innebandy.se')) {
      return new Response(JSON.stringify({ videoSrc: null, thumbnailSrc: null }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    const html = await res.text();

    // Extract Vimeo MP4 source
    const videoMatch = html.match(/<source\s+src="(https:\/\/player\.vimeo\.com\/[^"]+\.mp4[^"]*)"/);
    const videoSrc = videoMatch?.[1] ?? null;

    // Extract thumbnail image (skip placeholders)
    let thumbnailSrc: string | null = null;
    const imgMatches = html.matchAll(/<img[^>]+src="(https:\/\/www\.innebandy\.se\/globalassets\/[^"]+\.(jpg|jpeg|png|gif|webp))"/gi);
    for (const m of imgMatches) {
      if (!m[1].includes('placeholder')) {
        thumbnailSrc = m[1];
        break;
      }
    }

    // Also try media path
    if (!thumbnailSrc) {
      const mediaMatch = html.match(/<img[^>]+src="(https:\/\/www\.innebandy\.se\/media\/[^"]+\.(jpg|jpeg|png|gif|webp))"/i);
      if (mediaMatch && !mediaMatch[1].includes('placeholder')) {
        thumbnailSrc = mediaMatch[1];
      }
    }

    // Try picture > source srcset
    if (!thumbnailSrc) {
      const srcsetMatch = html.match(/<source\s+srcset="(https:\/\/www\.innebandy\.se\/[^"]+\.(jpg|jpeg|png|gif|webp)[^"]*)"/i);
      if (srcsetMatch && !srcsetMatch[1].includes('placeholder')) {
        thumbnailSrc = srcsetMatch[1].split(',')[0].trim().split(' ')[0];
      }
    }

    return new Response(JSON.stringify({ videoSrc, thumbnailSrc }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ videoSrc: null, thumbnailSrc: null, error: String(error) }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
