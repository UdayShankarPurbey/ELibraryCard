import { HttpContextToken } from '@angular/common/http';

// Set on a request to suppress the global error toast (for optional/background reads).
export const SKIP_ERROR_TOAST = new HttpContextToken<boolean>(() => false);
