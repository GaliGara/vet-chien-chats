import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export const runtime = "nodejs";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  let payload: z.infer<typeof loginSchema>;

  try {
    const body = await request.json();
    payload = loginSchema.parse(body);
  } catch {
    return Response.json(
      { ok: false, error: "invalid_payload" },
      { status: 400 }
    );
  }

  const expectedUsername = process.env.ADMIN_LOGIN_USERNAME?.trim().toLowerCase();
  const adminEmail = process.env.ADMIN_LOGIN_EMAIL?.trim();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!expectedUsername || !adminEmail || !supabaseUrl || !supabaseAnonKey) {
    return Response.json(
      { ok: false, error: "login_not_configured" },
      { status: 503 }
    );
  }

  if (payload.username.trim().toLowerCase() !== expectedUsername) {
    return Response.json(
      { ok: false, error: "invalid_credentials" },
      { status: 401 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.auth.signInWithPassword({
    email: adminEmail,
    password: payload.password,
  });

  if (error || !data.session) {
    return Response.json(
      { ok: false, error: "invalid_credentials" },
      { status: 401 }
    );
  }

  return Response.json({
    ok: true,
    session: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    },
  });
}
