import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const GET: APIRoute = async () => {
  try {
    const [localesRes, profesionalesRes, serviciosRes] = await Promise.all([
      supabase.from('locales').select('*'),
      supabase.from('profesionales').select('*'),
      supabase.from('servicios').select('*'),
    ]);

    if (localesRes.error) throw localesRes.error;
    if (profesionalesRes.error) throw profesionalesRes.error;
    if (serviciosRes.error) throw serviciosRes.error;

    return new Response(
      JSON.stringify({
        locales: localesRes.data,
        profesionales: profesionalesRes.data,
        servicios: serviciosRes.data,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};
