---
trigger: model_decision
---

Especificación de Diseño: Reavi Clinics

1. Visión General
   El objetivo es crear una Landing Page para una empresa de masajes de fisioterapia y movilidad. El diseño debe transmitir tranquilidad, profesionalismo y bienestar. Se utilizarán espacios y elementos visuales suaves para que la experiencia del usuario desde el primer momento sea relajante y resposnivo.

1.1 Resposividad
Utilizar de Grid para mejorar la resposividad de la pagina asi como media querys(Sin embargo intentar no utilizar media querys simpre que sea posible)

1.3 Simplicidad
Mantener el Codigo lo mas simple posble. Evitar a toda costa llenar el codigo de CSS y HTLM. Mantener el codigo manimalista y solo escribir el codigo que usario pida sin poner cosas extra. Por ejemplo no poner sombras a no ser que el usuario lo indique.

2. Paleta de Colores
   Los colores elegidos están diseñados para evocar salud, calma y energía renovada.

Color Primario (Tranquilidad y Salud): #34C1CF (Cian Suave).
Uso: Botones principales, íconos destacados, banners y fondos de secciones clave.
Color Secundario (Calidez y Bienestar): #D266A3 (Rosa Suave).
Uso: Acentos, botones secundarios, y elementos de llamada a la acción (CTA) para resaltar de forma amigable.
Color Terciario (Energía y Movilidad): #CFBB34 (Oro/Mostaza Suave).
Fondo Principal: #F8FAFC o #FFFFFF (para mantener la interfaz limpia y luminosa).
Texto Principal: #334155 (Gris Pizarra oscuro para una lectura cómoda sin el contraste agresivo del negro puro).
Texto Secundario: #64748B (Gris claro para descripciones o texto de apoyo). 3. Tipografía
Se sugiere utilizar una fuente Sans-Serif moderna y limpia como Inter, Poppins o Nunito.
Estas fuentes tienen formas amigables y legibles (especialmente Nunito o Poppins por sus trazos redondeados) que acompañan el sentimiento de relajación y salud. 4. Formas y Espaciado (UI)
Espaciado (Whitespace): Uso amplio y generoso de márgenes (margin) y rellenos (padding). Las secciones deben "respirar", dándole a cada elemento su propio espacio.

5. Animaciones CSS (Flujo y Naturaleza)
   Toda animación debe sentirse orgánica y natural, sin movimientos bruscos, lineales o ridículamente rápidos. El objetivo es emular la respiración o el movimiento suave del agua/viento.

5.1. Reglas Generales de Animación
Duración: Las transiciones de estado (como hover en botones) deben durar entre 0.3s y 0.5s para que el cerebro las perciba de manera relajada.
Easing: Utilizar curvas Bézier suaves como ease-in-out o preferiblemente cubic-bezier(0.4, 0, 0.2, 1).
5.2. Estados Hover (Interacción y Micro-interacciones)
Los componentes interactivos deben reaccionar suavemente al pasar el ratón, invitando a la acción sin un destello repentino.

css
/_ Botones Primarios Suaves _/
.btn-primary {
background-color: #34C1CF;
color: white;
transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.btn-primary:hover {
background-color: #2BA8B5; /_ Un tono ligeramente más profundo _/
transform: translateY(-3px); /_ Se eleva suavemente dando sensación de ingravidez _/
}
/_ Tarjetas de Servicios de Masajes _/
.service-card {
background-color: #FFFFFF;
border-radius: 12px;
transition: transform 0.5s ease-out, box-shadow 0.5s ease-out;
.service-card:hover {
transform: translateY(-5px) scale(1.01);
/_ Sombra cálida o tenue asociada a nuestro color secundario _/
box-shadow: 0 16px 32px rgba(210, 102, 163, 0.12);
}
5.3. Animaciones Keyframes (Movimiento Continuo y Relajante)
Ideal para aplicar a elementos decorativos (como ondas SVG de fondo, formas abstractas o imágenes destacadas).

A. Animación de "Respiración" (Pulsación Suave)
Para envolver un componente central de llamada a la acción (como el botón para agendar un masaje) en un halo calmante.

css
@keyframes breathe {
0%, 100% {
transform: scale(1);
opacity: 0.85;
}
50% {
transform: scale(1.04); /_ Un crecimiento muy sutil _/
opacity: 1;
}
}
.animate-breathe {
animation: breathe 5s ease-in-out infinite;
}
B. Elementos Flotantes (Efecto de Ingravidez/Levitación)
Maravilloso para fotografías recortadas, íconos grandes flotando o fondos decorativos orgánicos.

css
@keyframes float {
0% { transform: translateY(0px); }
50% { transform: translateY(-12px); }
100% { transform: translateY(0px); }
}
.animate-float {
/_ Una duración larga asimila el tempo de un ambiente de spa _/
animation: float 7s ease-in-out infinite;
}
C. Aparición Orgánica (Smooth Fade-In-Up)
Para revelar armónicamente las secciones mientras el paciente hace scroll por los servicios.

css
@keyframes fadeInUpRelaxing {
from {
opacity: 0;
transform: translateY(30px);
}
to {
opacity: 1;
transform: translateY(0);
}
}
.animate-fade-in-up {
animation: fadeInUpRelaxing 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
} 6. Prompting para la Generación (Instrucciones Clave para la IA)
Cuando la inteligencia artificial tenga que crear código basado en este Spec, usará las siguientes reglas irrompibles:

Regla del 60-30-10: 60% color neutro/fondo, 30% color primario (#34C1CF), 10% color secundario (#D266A3) y terciario (#CFBB34).
Prohibido el negro puro (#000000): Usar siempre grises azulados o tonos grafito para calmar la vista.
Sombrear con color: Todas las sombras (box-shadows) deben intentar utilizar la variable del color con baja opacidad en vez de simples negros con canal alfa, dándole magia térmica a los componentes.
Todo respira: Nunca pegar los textos a los bordes. Utilizar al menos p-8 o o padding: 2rem; en casi todos los bloques de contenido para evocar confort expansivo.
