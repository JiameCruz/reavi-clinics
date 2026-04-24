import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

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
