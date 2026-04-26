import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request, cookies }) => {
  const formData = await request.formData();
  const email = formData.get('email')?.toString();
  const password = formData.get('password')?.toString();

  if (!email || !password) {
    return new Response(
      JSON.stringify({ error: 'Email y contraseña son requeridos' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Verificar credenciales contra la tabla admins
  const { data, error } = await supabase
    .from('admins')
    .select('id, email, local_id')
    .eq('email', email)
    .eq('password', password)
    .single();

  if (error || !data) {
    return new Response(
      JSON.stringify({ error: 'Credenciales incorrectas' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Crear cookie de sesión con datos del admin (base64 encoded JSON)
  const sessionValue = btoa(
    JSON.stringify({
      id: data.id,
      email: data.email,
      local_id: data.local_id,
    })
  );

  cookies.set('admin_session', sessionValue, {
    path: '/',
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 días
  });

  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
