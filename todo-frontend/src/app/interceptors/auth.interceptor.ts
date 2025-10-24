import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Evitar adjuntar token en endpoints de auth
  const isAuthEndpoint = /\/auth\//.test(req.url);
  const token = localStorage.getItem('token');

  if (!isAuthEndpoint && token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }

  return next(req);
};