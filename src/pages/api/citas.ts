import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

/* ── GET: list citas by date ── */
export const GET: APIRoute = async ({ url }) => {
  try {
    const fecha = url.searchParams.get('fecha');
    if (!fecha) {
      return new Response(JSON.stringify({ error: 'Parámetro "fecha" requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const startOfDay = `${fecha}T00:00:00Z`;
    const endOfDay = `${fecha}T23:59:59Z`;

    const { data: citas, error } = await supabase
      .from('citas')
      .select('*, servicios(nombre), profesionales(nombre)')
      .gte('fecha_hora', startOfDay)
      .lte('fecha_hora', endOfDay)
      .order('fecha_hora', { ascending: true });

    if (error) throw error;

    // Flatten joined names for easier consumption
    const mapped = (citas || []).map((c: any) => ({
      ...c,
      servicio_nombre: c.servicios?.nombre ?? null,
      profesional_nombre: c.profesionales?.nombre ?? null,
      servicios: undefined,
      profesionales: undefined,
    }));

    return new Response(JSON.stringify({ citas: mapped }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

/* ── PATCH: update a cita ── */
export const PATCH: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    console.log('PATCH /api/citas body:', body);

    if (!id) {
      return new Response(JSON.stringify({ error: 'Se requiere "id"' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { data, error } = await supabase
      .from('citas')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      throw error;
    }

    return new Response(JSON.stringify({ cita: data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('API PATCH error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

/* ── DELETE: remove a cita ── */
export const DELETE: APIRoute = async ({ url }) => {
  try {
    const id = url.searchParams.get('id');
    if (!id) {
      return new Response(JSON.stringify({ error: 'Se requiere "id"' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { error } = await supabase
      .from('citas')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return new Response(JSON.stringify({ message: 'Cita eliminada' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

/* ── POST: create a cita ── */
export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { paciente_nombre, paciente_email, paciente_telefono, local_id, servicio_id, profesional_id, fecha, hora } = data;

    if (!paciente_nombre || !paciente_email || !local_id || !servicio_id || !profesional_id || !fecha || !hora) {
      return new Response(JSON.stringify({ error: 'Faltan datos requeridos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const fecha_hora = new Date(`${fecha}T${hora}:00Z`).toISOString();

    const { data: nuevaCita, error } = await supabase
      .from('citas')
      .insert([
        {
          paciente_nombre,
          paciente_email,
          paciente_telefono,
          local_id,
          servicio_id,
          profesional_id,
          fecha_hora
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ message: 'Cita agendada con éxito', cita: nuevaCita }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
