import { HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

export const SILENT_REQUEST = new HttpContextToken<boolean>(() => false);

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(SILENT_REQUEST)) {
    return next(req);
  }
  const loading = inject(LoadingService);
  loading.show();
  return next(req).pipe(finalize(() => loading.hide()));
};
