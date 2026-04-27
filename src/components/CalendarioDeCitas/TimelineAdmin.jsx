import React, { useState, useEffect, useCallback } from 'react';
import './TimelineAdmin.css';

/* ─── Helpers ─── */

const ESTADOS = ['pendiente', 'confirmada', 'en_curso', 'completada', 'cancelada'];

const ESTADO_LABELS = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  en_curso: 'En curso',
  completada: 'Completada',
  cancelada: 'Cancelada',
};

/** Format a Date to "HH:MM" (24h) in UTC. */
function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('es-MX', { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: false,
    timeZone: 'UTC' 
  });
}

/** Format a Date to "HH:00" for the hour‑group label in UTC. */
function formatHourLabel(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('es-MX', { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: false,
    timeZone: 'UTC' 
  }).replace(/:\d{2}$/, ':00');
}

/** Today in YYYY-MM-DD. */
function todayISO() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/* ─── Sub-components ─── */

function CreateModal({ selectedDate, defaultLocalId, metadata, onSave, onClose }) {
  const [form, setForm] = useState({
    paciente_nombre: '',
    paciente_email: '',
    paciente_telefono: '',
    local_id: defaultLocalId || '',
    servicio_id: '',
    profesional_id: '',
    fecha: selectedDate || todayISO(), // New date field in form state
    hora: '',
  });

  const [horasDisponibles, setHorasDisponibles] = useState([]);
  const [loadingHoras, setLoadingHoras] = useState(false);

  const { locales, profesionales, servicios } = metadata;

  const filteredServicios = form.local_id 
    ? servicios.filter(s => profesionales.find(p => p.id === s.profesional_id)?.local_id === form.local_id)
    : [];

  const filteredProfesionales = form.servicio_id 
    ? profesionales.filter(p => p.id === servicios.find(s => s.id === form.servicio_id)?.profesional_id)
    : [];

  // Fetch available hours - Now depends on form.fecha instead of selectedDate prop
  useEffect(() => {
    if (form.profesional_id && form.fecha) {
      setLoadingHoras(true);
      fetch(`/api/disponibilidad?profesional_id=${form.profesional_id}&fecha=${form.fecha}`)
        .then(res => res.json())
        .then(data => {
          setHorasDisponibles(data.disponibles || []);
          setLoadingHoras(false);
        })
        .catch(err => {
          console.error('Error fetching availability:', err);
          setLoadingHoras(false);
        });
    } else {
      setHorasDisponibles([]);
    }
    setForm(prev => ({ ...prev, hora: '' }));
  }, [form.profesional_id, form.fecha]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const next = { ...prev, [name]: value };
      if (name === 'local_id') {
        next.servicio_id = '';
        next.profesional_id = '';
      }
      if (name === 'servicio_id') {
        next.profesional_id = '';
      }
      return next;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.hora) {
      alert('Por favor selecciona una hora disponible.');
      return;
    }
    onSave(form); // Now form includes the date (fecha)
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Nueva Cita</h3>
        <div className="modal-scroll-area">
          <form onSubmit={handleSubmit}>
            <div className="modal-form-group">
              <label>Local (Sede)</label>
              <select name="local_id" value={form.local_id} onChange={handleChange} required>
                <option value="">-- Seleccionar --</option>
                {locales.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
              </select>
            </div>
            <div className="modal-form-group">
              <label>Servicio</label>
              <select name="servicio_id" value={form.servicio_id} onChange={handleChange} required disabled={!form.local_id}>
                <option value="">-- Seleccionar --</option>
                {filteredServicios.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </select>
            </div>
            <div className="modal-form-group">
              <label>Profesional</label>
              <select name="profesional_id" value={form.profesional_id} onChange={handleChange} required disabled={!form.servicio_id}>
                <option value="">-- Seleccionar --</option>
                {filteredProfesionales.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            
            <div className="modal-form-group">
              <label>Fecha de la Cita</label>
              <input 
                name="fecha" 
                type="date" 
                value={form.fecha} 
                onChange={handleChange} 
                required 
                min={todayISO()}
              />
            </div><div className="modal-form-group">
              <label>Horas Disponibles</label>
              {loadingHoras ? (
                <p className="loading-text">Cargando disponibilidad...</p>
              ) : form.profesional_id ? (
                <div className="modal-horas-grid">
                  {horasDisponibles.length === 0 ? (
                    <p className="no-horas">No hay horas disponibles para este día.</p>
                  ) : (
                    horasDisponibles.map(h => (
                      <button 
                        type="button" 
                        key={h} 
                        className={`hora-btn ${form.hora === h ? 'selected' : ''}`}
                        onClick={() => setForm(prev => ({ ...prev, hora: h }))}
                      >
                        {h}
                      </button>
                    ))
                  )}
                </div>
              ) : (
                <p className="info-text">Selecciona servicio y profesional para ver horarios.</p>
              )}
              {/* Hidden required input for validation */}
              <input type="text" style={{ display: 'none' }} required value={form.hora} readOnly />
            </div>

            <div className="modal-form-group">
              <label>Nombre del Paciente</label>
              <input name="paciente_nombre" value={form.paciente_nombre} onChange={handleChange} required placeholder="Nombre completo" />
            </div>
            <div className="modal-form-group">
              <label>Email de Contacto</label>
              <input name="paciente_email" type="email" value={form.paciente_email} onChange={handleChange} required placeholder="email@ejemplo.com" />
            </div>
            <div className="modal-form-group">
              <label>Teléfono</label>
              <input name="paciente_telefono" type="tel" value={form.paciente_telefono} onChange={handleChange} required placeholder="10 dígitos" />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-modal btn-modal--cancel" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn-modal btn-modal--save">Confirmar Cita</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-box" onClick={(e) => e.stopPropagation()}>
        <p>{message}</p>
        <div className="confirm-actions">
          <button className="btn-confirm--no" onClick={onCancel}>Cancelar</button>
          <button className="btn-confirm--yes" onClick={onConfirm}>Eliminar</button>
        </div>
      </div>
    </div>
  );
}

function EditModal({ cita, metadata, onSave, onClose }) {
  const initialDate = new Date(cita.fecha_hora);
  
  // Use UTC components to avoid timezone shifting
  const y = initialDate.getUTCFullYear();
  const m = String(initialDate.getUTCMonth() + 1).padStart(2, '0');
  const d = String(initialDate.getUTCDate()).padStart(2, '0');
  const initialFecha = `${y}-${m}-${d}`;
  
  const hh = String(initialDate.getUTCHours()).padStart(2, '0');
  const mm = String(initialDate.getUTCMinutes()).padStart(2, '0');
  const initialHora = `${hh}:${mm}`;

  const [form, setForm] = useState({
    paciente_nombre: cita.paciente_nombre,
    paciente_email: cita.paciente_email,
    paciente_telefono: cita.paciente_telefono,
    estado: cita.estado,
    local_id: cita.local_id,
    servicio_id: cita.servicio_id,
    profesional_id: cita.profesional_id,
    fecha: initialFecha,
    hora: initialHora,
  });

  const [horasDisponibles, setHorasDisponibles] = useState([]);
  const [loadingHoras, setLoadingHoras] = useState(false);

  const { locales, profesionales, servicios } = metadata;

  const filteredServicios = form.local_id 
    ? servicios.filter(s => profesionales.find(p => p.id === s.profesional_id)?.local_id === form.local_id)
    : [];

  const filteredProfesionales = form.servicio_id 
    ? profesionales.filter(p => p.id === servicios.find(s => s.id === form.servicio_id)?.profesional_id)
    : [];

  // Fetch available hours
  useEffect(() => {
    if (form.profesional_id && form.fecha) {
      setLoadingHoras(true);
      fetch(`/api/disponibilidad?profesional_id=${form.profesional_id}&fecha=${form.fecha}`)
        .then(res => res.json())
        .then(data => {
          // If the selected hour is the current one, we should include it in the available list
          let list = data.disponibles || [];
          if (form.fecha === initialFecha && form.profesional_id === cita.profesional_id) {
             if (!list.includes(initialHora)) list.push(initialHora);
             list.sort();
          }
          setHorasDisponibles(list);
          setLoadingHoras(false);
        })
        .catch(err => {
          console.error(err);
          setLoadingHoras(false);
        });
    }
  }, [form.profesional_id, form.fecha, cita.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const next = { ...prev, [name]: value };
      if (name === 'local_id') {
        next.servicio_id = '';
        next.profesional_id = '';
        next.hora = '';
      }
      if (name === 'servicio_id') {
        next.profesional_id = '';
        next.hora = '';
      }
      if (name === 'fecha') {
        next.hora = '';
      }
      return next;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.hora) {
      alert('Por favor selecciona una hora disponible.');
      return;
    }
    // Combine date and time
    const fecha_hora = new Date(`${form.fecha}T${form.hora}:00Z`).toISOString();
    const { fecha, hora, ...rest } = form;
    onSave(cita.id, { ...rest, fecha_hora });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Editar Cita</h3>
        <div className="modal-scroll-area">
          <form onSubmit={handleSubmit}>
            <div className="modal-form-group">
              <label>Paciente</label>
              <input name="paciente_nombre" value={form.paciente_nombre} onChange={handleChange} required />
            </div>
            <div className="modal-form-group">
              <label>Email</label>
              <input name="paciente_email" type="email" value={form.paciente_email} onChange={handleChange} required />
            </div>
            <div className="modal-form-group">
              <label>Teléfono</label>
              <input name="paciente_telefono" type="tel" value={form.paciente_telefono} onChange={handleChange} required />
            </div>
            
            <div className="modal-form-group">
              <label>Estado</label>
              <select name="estado" value={form.estado} onChange={handleChange}>
                {ESTADOS.map((e) => (
                  <option key={e} value={e}>{ESTADO_LABELS[e]}</option>
                ))}
              </select>
            </div>

            <hr style={{ margin: '1.5rem 0', opacity: 0.1 }} />

            <div className="modal-form-group">
              <label>Local (Sede)</label>
              <select name="local_id" value={form.local_id} onChange={handleChange} required>
                <option value="">-- Seleccionar --</option>
                {locales.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
              </select>
            </div>
            <div className="modal-form-group">
              <label>Servicio</label>
              <select name="servicio_id" value={form.servicio_id} onChange={handleChange} required disabled={!form.local_id}>
                <option value="">-- Seleccionar --</option>
                {filteredServicios.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </select>
            </div>
            <div className="modal-form-group">
              <label>Profesional</label>
              <select name="profesional_id" value={form.profesional_id} onChange={handleChange} required disabled={!form.servicio_id}>
                <option value="">-- Seleccionar --</option>
                {filteredProfesionales.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>

            <div className="modal-form-group">
              <label>Fecha</label>
              <input name="fecha" type="date" value={form.fecha} onChange={handleChange} required min={todayISO()} />
            </div>

            <div className="modal-form-group">
              <label>Horas Disponibles</label>
              {loadingHoras ? (
                <p className="loading-text">Cargando disponibilidad...</p>
              ) : (
                <div className="modal-horas-grid">
                  {horasDisponibles.length === 0 ? (
                    <p className="no-horas">No hay horas disponibles.</p>
                  ) : (
                    horasDisponibles.map(h => (
                      <button 
                        type="button" 
                        key={h} 
                        className={`hora-btn ${form.hora === h ? 'selected' : ''}`}
                        onClick={() => setForm(prev => ({ ...prev, hora: h }))}
                      >
                        {h}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-modal btn-modal--cancel" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn-modal btn-modal--save">Guardar Cambios</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ─── Main component ─── */

export default function TimelineAdmin({ defaultLocalId }) {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(todayISO());
  
  // Metadata for creation
  const [metadata, setMetadata] = useState({ locales: [], profesionales: [], servicios: [] });

  // Modal / confirm state
  const [editingCita, setEditingCita] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  /* ── Fetch metadata ── */
  useEffect(() => {
    fetch('/api/metadata')
      .then(res => res.json())
      .then(data => setMetadata(data))
      .catch(err => console.error('Error fetching metadata:', err));
  }, []);

  /* ── Fetch citas ── */
  const fetchCitas = useCallback(async () => {
    try {
      const res = await fetch(`/api/citas?fecha=${selectedDate}`);
      const data = await res.json();
      if (data.citas) setCitas(data.citas);
    } catch (err) {
      console.error('Error fetching citas:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  /* ── Real-time subscription (Supabase Realtime pattern) ── */
  useEffect(() => {
    setLoading(true);
    fetchCitas();

    const interval = setInterval(fetchCitas, 8000);
    return () => clearInterval(interval);
  }, [fetchCitas]);

  /* ── Handlers ── */

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await fetch(`/api/citas?id=${deletingId}`, { method: 'DELETE' });
      setCitas((prev) => prev.filter((c) => c.id !== deletingId));
    } catch (err) {
      console.error('Error deleting cita:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSaveEdit = async (id, updates) => {
    try {
      const res = await fetch('/api/citas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
      
      if (!res.ok) throw new Error('Error al actualizar cita');

      // If the date changed, we should refresh the whole list for the current selectedDate
      // because the appointment might have moved to a different day or the same day but different position.
      fetchCitas();
    } catch (err) {
      console.error('Error updating cita:', err);
      alert('Error al actualizar la cita: ' + err.message);
    } finally {
      setEditingCita(null);
    }
  };

  const handleCreate = async (newCita) => {
    try {
      const res = await fetch('/api/citas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCita),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear cita');
      
      // Refresh local list if the new appointment is for the current selected date
      if (newCita.fecha === selectedDate) {
        fetchCitas();
      }
    } catch (err) {
      console.error('Error creating cita:', err);
    } finally {
      setIsCreating(false);
    }
  };

  /* ── Group citas by hour ── */
  const sorted = [...citas].sort(
    (a, b) => new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime()
  );

  const grouped = sorted.reduce((acc, cita) => {
    const hourKey = formatHourLabel(cita.fecha_hora);
    if (!acc[hourKey]) acc[hourKey] = [];
    acc[hourKey].push(cita);
    return acc;
  }, {});

  /* ── Render ── */

  if (loading) {
    return (
      <div className="timeline-loading">
        <div className="timeline-spinner" />
        <p>Cargando citas…</p>
      </div>
    );
  }

  return (
    <div className="timeline-admin">
      {/* Toolbar */}
      <div className="timeline-toolbar">
        <div className="timeline-toolbar-left">
          <input
            id="timeline-date-picker"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        
        </div>
        <button 
          className="btn-create" 
          onClick={() => setIsCreating(true)}
        >
          <span>+</span> Nueva Cita
        </button>
      </div>

      {/* Timeline */}

      {Object.keys(grouped).length === 0 ? (
        <div className="timeline-empty">
          No hay citas programadas para este día.
        </div>
      ) : (
        Object.entries(grouped).map(([hour, items]) => (
          <div className="timeline-hour-group" key={hour}>
            <div className="timeline-hour-label">{hour}</div>

            {items.map((cita) => (
              <div className="timeline-card" key={cita.id}>
                <div className="timeline-card-body">
                  <h4>{cita.paciente_nombre}</h4>
                  <p>
                    {cita.servicio_nombre || 'Servicio'}
                    {cita.profesional_nombre ? ` · ${cita.profesional_nombre}` : ''}
                  </p>
                  <div className="timeline-card-meta">
                    <span className="timeline-card-time">{formatTime(cita.fecha_hora)}</span>
                    <span className={`badge badge--${cita.estado}`}>
                      {ESTADO_LABELS[cita.estado] || cita.estado}
                    </span>
                  </div>
                </div>

                <div className="timeline-card-actions">
                  <button
                    className="btn-icon btn-icon--edit"
                    onClick={() => setEditingCita(cita)}
                    title="Editar cita"
                  >
                    Editar
                  </button>
                  <button
                    className="btn-icon btn-icon--delete"
                    onClick={() => setDeletingId(cita.id)}
                    title="Eliminar cita"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))
      )}

      {/* Edit Modal */}
      {editingCita && (
        <EditModal
          cita={editingCita}
          metadata={metadata}
          onSave={handleSaveEdit}
          onClose={() => setEditingCita(null)}
        />
      )}

      {/* Create Modal */}
      {isCreating && (
        <CreateModal
          selectedDate={selectedDate}
          defaultLocalId={defaultLocalId}
          metadata={metadata}
          onSave={handleCreate}
          onClose={() => setIsCreating(false)}
        />
      )}

      {/* Delete confirm */}
      {deletingId && (
        <ConfirmDialog
          message="¿Estás seguro de que deseas eliminar esta cita? Esta acción no se puede deshacer."
          onConfirm={handleDelete}
          onCancel={() => setDeletingId(null)}
        />
      )}
    </div>
  );
}

