import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const pathname = context.url.pathname;

  // Solo proteger rutas bajo /Dashboard
  if (!pathname.startsWith('/Dashboard')) {
    return next();
  }

  // Permitir la página de login
  if (pathname === '/Dashboard/login' || pathname === '/Dashboard/login/') {
    return next();
  }

  // Permitir endpoints de autenticación
  if (pathname.startsWith('/api/auth/')) {
    return next();
  }

  // Verificar cookie de sesión
  const sessionCookie = context.cookies.get('admin_session');
  if (!sessionCookie) {
    return context.redirect('/Dashboard/login');
  }

  try {
    const sessionData = JSON.parse(atob(sessionCookie.value));
    if (!sessionData.id || !sessionData.email) {
      context.cookies.delete('admin_session', { path: '/' });
      return context.redirect('/Dashboard/login');
    }
    // Guardar datos del admin en locals para uso en las páginas
    context.locals.admin = sessionData;
  } catch {
    context.cookies.delete('admin_session', { path: '/' });
    return context.redirect('/Dashboard/login');
  }

  return next();
});
