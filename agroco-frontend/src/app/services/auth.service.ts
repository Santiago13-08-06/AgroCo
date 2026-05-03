import { Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';

type User = {
  id: number;
  nombre_completo: string;
  email?: string | null;
  documento_mascara?: string;
  avatar_url?: string | null;
  telefono?: string | null;
  ocupacion?: string | null;
  tipo_documento?: string | null;
  must_change_password?: boolean;
  is_admin?: boolean;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _token = signal<string | null>(localStorage.getItem('agroco_token'));
  private _user = signal<User | null>(null);
  loading = signal<boolean>(false);
  // Incrementa cada vez que se limpia intencionalmente la sesión (login/logout).
  // me() descarta respuestas en vuelo si la generación cambió.
  private _gen = 0;

  constructor(private api: ApiService) {
    if (this._token()) this.me();
  }

  token() { return this._token(); }
  user() { return this._user(); }
  isAdmin() { return !!this._user()?.is_admin; }

  async login(data: { nombre_completo: string; documento_identidad: string }) {
    this.loading.set(true);
    this._gen++;                              // invalida cualquier me() en vuelo
    this._token.set(null);
    localStorage.removeItem('agroco_token');
    this._user.set(null);
    try {
      const res = await this.api.post<{ token: string } & any>('/api/v1/login', data, false);
      // El backend puede devolver 200 con un mensaje de error (sin token)
      if (!res?.token) {
        throw { error: { message: res?.message || 'Credenciales incorrectas' } };
      }
      this._token.set(res.token);
      localStorage.setItem('agroco_token', res.token);
      await this.me();
    } catch (e) {
      this._token.set(null);
      localStorage.removeItem('agroco_token');
      this._user.set(null);
      throw e;
    } finally {
      this.loading.set(false);
    }
  }

  async register(data: { nombre_completo: string; documento_identidad: string; ocupacion: string; email?: string }) {
    this.loading.set(true);
    try {
      await this.api.post('/api/v1/register', data, false);
      await this.login({ nombre_completo: data.nombre_completo, documento_identidad: data.documento_identidad });
    } finally { this.loading.set(false); }
  }

  async logout() {
    this._gen++;                              // invalida cualquier me() en vuelo
    try { if (this._token()) await this.api.post('/api/v1/logout', {}, true); } catch { }
    this._token.set(null); this._user.set(null); localStorage.removeItem('agroco_token');
  }

  async changePassword(current_password: string, new_password: string) {
    return this.api.post('/api/v1/password/change', { current_password, new_password }, true);
  }

  async updateEmail(email: string | null | undefined) {
    const res = await this.api.put<Partial<User>>('/api/v1/profile', { email: email ?? null }, true);
    // refrescar usuario para mantener consistencia
    await this.me();
    return res;
  }

  async updateProfile(data: { email?: string | null; nombre_completo?: string; ocupacion?: string | null; telefono?: string | null }) {
    const res = await this.api.put<Partial<User>>('/api/v1/profile', data, true);
    await this.me();
    return res;
  }

  async updatePhoto(file: File) {
    const form = new FormData();
    form.append('photo', file);
    const res = await this.api.post<{ avatar_url?: string }>('/api/v1/profile/photo', form as any, true);
    // Refrescar usuario desde backend
    await this.me();
    // Asegurar que el avatar_url quede actualizado aunque el backend no lo envíe
    const current = this._user();
    if (current) {
      const base = (this.api.base || '').replace(/\/api\/?$/, '');
      const fallback = base ? `${base}/api/v1/avatar/${current.id}?v=${Date.now()}` : current.avatar_url;
      const finalUrl = res?.avatar_url || fallback || undefined;
      this._user.set({ ...current, avatar_url: finalUrl });
    }
  }

  async ensureUser(): Promise<User | null> {
    if (this._user()) return this._user();
    if (!this._token()) return null;
    const gen = this._gen;
    try {
      await this.me();
      // Si la sesión fue reiniciada mientras esperábamos, no confiar en el resultado
      if (this._gen !== gen || !this._token()) return null;
      return this._user();
    } catch {
      return null;
    }
  }

  async me() {
    const gen = this._gen;
    try {
      const me = await this.api.get<User>('/api/v1/me', true);
      if (this._gen !== gen) return;         // sesión fue reiniciada mientras esperábamos
      // Validar que la respuesta sea un usuario real (el backend puede devolver 200 con error)
      if (!me || typeof (me as any).id !== 'number') {
        this._token.set(null);
        localStorage.removeItem('agroco_token');
        this._user.set(null);
        return;
      }
      this._user.set(me);
    } catch {
      if (this._gen !== gen) return;         // sesión fue reiniciada mientras esperábamos
      this._token.set(null);
      localStorage.removeItem('agroco_token');
      this._user.set(null);
    }
  }
}
