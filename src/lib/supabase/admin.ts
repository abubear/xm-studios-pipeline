import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Untyped Supabase client for API routes where the typed Database
 * generics cause issues with insert/update operations.
 */
export function createAdminClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // server component context
          }
        },
      },
    }
  );
}
