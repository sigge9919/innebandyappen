/**
 * supabase-js returns a generic "Edge Function returned a non-2xx status code"
 * message; the real error body lives on error.context (a Response).
 */
export async function getEdgeFunctionErrorMessage(error: any): Promise<string> {
  try {
    if (error?.context?.json) {
      const body = await error.context.json();
      if (body?.error) return body.error;
    }
  } catch {
    // ignore body parse failures
  }
  return error?.message ?? 'Okänt fel';
}