import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

const HORAS_DISPONIBLES = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
];

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const profesional_id = url.searchParams.get('profesional_id');
  const fechaStr = url.searchParams.get('fecha'); // Format YYYY-MM-DD

  if (!profesional_id || !fechaStr) {
    return new Response(JSON.stringify({ error: 'Faltan parámetros profesional_id o fecha' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Rango de la fecha (todo el día)
    const fechaInicio = new Date(`${fechaStr}T00:00:00Z`);
    const fechaFin = new Date(`${fechaStr}T23:59:59Z`);

    const { data: citas, error } = await supabase
      .from('citas')
      .select('fecha_hora')
      .eq('profesional_id', profesional_id)
      .neq('estado', 'cancelada') // Excluir citas canceladas
      .gte('fecha_hora', fechaInicio.toISOString())
      .lte('fecha_hora', fechaFin.toISOString());

    if (error) throw error;

    // Extraer horas ocupadas
    const horasOcupadas = citas.map((cita) => {
      // Extract HH:mm directly from the UTC ISO string
      const date = new Date(cita.fecha_hora);
      return date.toISOString().substring(11, 16);
    });

    // Filtramos las horas ocupadas de la lista total
    const disponibles = HORAS_DISPONIBLES.filter(hora => !horasOcupadas.includes(hora));

    return new Response(JSON.stringify({ 
      disponibles,
      ocupadas: horasOcupadas // Adding for debugging
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
