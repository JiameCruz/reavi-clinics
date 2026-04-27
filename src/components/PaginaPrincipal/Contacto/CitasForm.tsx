import React, { useState, useEffect } from 'react';
import './CitasForm.css';

interface Local {
  id: string;
  nombre: string;
  direccion: string;
}

interface Profesional {
  id: string;
  nombre: string;
  local_id: string;
}

interface Servicio {
  id: string;
  nombre: string;
  profesional_id: string;
}

export default function CitasForm() {
  const [locales, setLocales] = useState<Local[]>([]);
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);

  const [selectedLocal, setSelectedLocal] = useState('');
  const [selectedProfesional, setSelectedProfesional] = useState('');
  const [selectedServicio, setSelectedServicio] = useState('');
  const [fecha, setFecha] = useState('');
  
  const [horasDisponibles, setHorasDisponibles] = useState<string[]>([]);
  const [selectedHora, setSelectedHora] = useState('');

  const [pacienteInfo, setPacienteInfo] = useState({
    nombre: '',
    email: '',
    telefono: ''
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetch('/api/metadata')
      .then(res => res.json())
      .then(data => {
        setLocales(data.locales || []);
        setProfesionales(data.profesionales || []);
        setServicios(data.servicios || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setErrorMsg('Error al cargar la información.');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (selectedProfesional && fecha) {
      fetch(`/api/disponibilidad?profesional_id=${selectedProfesional}&fecha=${fecha}`)
        .then(res => res.json())
        .then(data => {
          if (data.disponibles) {
            setHorasDisponibles(data.disponibles);
          }
        })
        .catch(err => console.error(err));
    } else {
      setHorasDisponibles([]);
    }
    setSelectedHora('');
  }, [selectedProfesional, fecha]);

  const filteredServicios = selectedLocal 
    ? servicios.filter(s => profesionales.find(p => p.id === s.profesional_id)?.local_id === selectedLocal)
    : [];

  const filteredProfesionales = selectedServicio 
    ? profesionales.filter(p => p.id === servicios.find(s => s.id === selectedServicio)?.profesional_id)
    : [];

  // Get today's date formatted as YYYY-MM-DD for min date in local time
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/citas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paciente_nombre: pacienteInfo.nombre,
          paciente_email: pacienteInfo.email,
          paciente_telefono: pacienteInfo.telefono,
          local_id: selectedLocal,
          servicio_id: selectedServicio,
          profesional_id: selectedProfesional,
          fecha,
          hora: selectedHora
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al agendar cita');
      }

      setSuccessMsg('¡Cita agendada con éxito! Te esperamos.');
      // Reset form
      setSelectedLocal('');
      setSelectedProfesional('');
      setSelectedServicio('');
      setFecha('');
      setSelectedHora('');
      setPacienteInfo({ nombre: '', email: '', telefono: '' });
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="citas-loading">Cargando opciones...</div>;

  return (
    <div className="citas-form-container">
      <h3>Agendar Cita</h3>


      <form onSubmit={handleSubmit} className="citas-form">
        <div className="form-group">
          <label>1. Selecciona el Local (Sede)</label>
          <select required value={selectedLocal} onChange={e => { setSelectedLocal(e.target.value); setSelectedProfesional(''); setSelectedServicio(''); }}>
            <option value="">-- Elige un local --</option>
            {locales.map(l => (
              <option key={l.id} value={l.id}>{l.nombre} ({l.direccion})</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>2. Selecciona el Servicio</label>
          <select required value={selectedServicio} onChange={e => { setSelectedServicio(e.target.value); setSelectedProfesional(''); }} disabled={!selectedLocal}>
            <option value="">-- Elige un servicio --</option>
            {filteredServicios.map(s => (
              <option key={s.id} value={s.id}>{s.nombre}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>3. Selecciona el Profesional</label>
          <select required value={selectedProfesional} onChange={e => setSelectedProfesional(e.target.value)} disabled={!selectedServicio}>
            <option value="">-- Elige un profesional --</option>
            {filteredProfesionales.map(p => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>4. Selecciona la Fecha</label>
          <input type="date" required value={fecha} min={today} onChange={e => setFecha(e.target.value)} disabled={!selectedProfesional} />
        </div>

        <div className="form-group">
          <label>5. Selecciona la Hora</label>
          <div className="horas-grid">
            {fecha && selectedProfesional && horasDisponibles.length === 0 && (
              <p className="no-horas">No hay horas disponibles para este día.</p>
            )}
            {horasDisponibles.map(hora => (
              <button 
                type="button" 
                key={hora} 
                className={`hora-btn ${selectedHora === hora ? 'selected' : ''}`}
                onClick={() => setSelectedHora(hora)}
              >
                {hora}
              </button>
            ))}
          </div>
          {/* Hidden input to ensure required validation */}
          <input type="text" style={{display: 'none'}} required value={selectedHora} onChange={()=>{}} />
        </div>

        <div className="form-group">
          <label>6. Tus Datos</label>
          <input type="text" placeholder="Nombre completo" required value={pacienteInfo.nombre} onChange={e => setPacienteInfo({...pacienteInfo, nombre: e.target.value})} />
          <input type="email" placeholder="Correo electrónico" required pattern="[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$" title="Ingrese un correo electrónico válido" value={pacienteInfo.email} onChange={e => setPacienteInfo({...pacienteInfo, email: e.target.value})} />
          <input type="tel" placeholder="Teléfono" required pattern="[\+0-9\s\-]{10}" title="Ingrese un número de teléfono válido (10 caracteres)" value={pacienteInfo.telefono} onChange={e => setPacienteInfo({...pacienteInfo, telefono: e.target.value})} />
        </div>

        {successMsg && <div className="citas-success">{successMsg}</div>}
        {errorMsg && <div className="citas-error">{errorMsg}</div>}
        
        <button type="submit" className="submit-btn" disabled={submitting}>
          {submitting ? 'Agendando...' : 'Confirmar Cita'}
        </button>
      </form>
    </div>
  );
}
