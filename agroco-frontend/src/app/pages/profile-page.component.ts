import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-profile-page',
  imports: [CommonModule, FormsModule],
  styles: [`
    .hero-shell{
      margin: -8px -16px 0;
      padding: 16px 16px 32px;
      background: linear-gradient(180deg, var(--app-bg-1), var(--app-bg-2));
      display: flex;
      flex-direction: column;
      gap: 18px;
    }
    .hero-copy{
      margin-bottom: 8px;
      text-align: center;
    }
    .hero-copy .tagline{
      display:none;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: .12em;
      text-transform: uppercase;
      color: #335f47;
      margin-bottom: 4px;
    }
    .hero-copy .hero-title{
      margin: 4px 0 8px;
      font-size: 30px;
      line-height: 1.18;
      font-weight: 900;
      letter-spacing: .01em;
      font-family: 'Outfit', 'Plus Jakarta Sans', system-ui, -apple-system, 'Segoe UI', sans-serif;
    }
    .hero-copy .hero-subtitle{
      margin: 0;
      font-size: 13px;
      color: #355d3f;
      font-weight: 600;
    }
    .profile-summary{
      margin: 0 -16px 0;
      padding: 16px 16px 14px;
      border-radius: 20px;
      background: linear-gradient(120deg, rgba(255,255,255,0.75), rgba(255,255,255,0.75)), url('/assets/5115294.jpg');
      background-size: cover;
      background-position: right center;
      background-repeat: no-repeat;
      box-shadow: 0 12px 32px rgba(21,62,41,0.16);
    }
    .profile-summary-main{
      display: flex;
      align-items: flex-start;
      gap: 0;
    }
    .profile-details{
      margin-top: 8px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .profile-details .detail{
      display: grid;
      grid-template-columns: auto 1fr;
      column-gap: 8px;
      row-gap: 2px;
      align-items: center;
      font-size: 13px;
    }
    .profile-details .ico{
      width: 20px;
      height: 20px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #153e29;
    }
    .profile-details .label{
      font-weight: 700;
      font-size: 15px;
      color: #153e29;
    }
    .profile-details .value{
      font-weight: 600;
      font-size: 15px;
      color: #153e29;
    }
    .profile-art{
      display: none;
    }
    .section-heading{
      font-size: 20px;
      font-weight: 900;
      color: #153e29;
      margin-bottom: 2px;
    }
    .section-sub{
      font-size: 14px;
      color: #374151;
    }
    .floating-layers{
      margin: 0;
      padding: 16px 16px 18px;
      border-radius: 20px;
      background: linear-gradient(180deg, rgba(255,255,255,0.7), rgba(255,255,255,0.85)), url('/assets/3453452.jpg');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      box-shadow: 0 12px 30px rgba(21,62,41,0.12);
    }
    .form-shell{
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .form-title{
      margin: 0 0 6px;
      font-size: 22px;
      font-weight: 900;
      color: #153e29;
    }
    .form-sub{
      margin: 0 0 10px;
      font-size: 14px;
      color: #466e59;
    }
    .form-shell .row{
      gap: 12px;
      margin-bottom: 8px;
    }
    .form-shell label{
      font-size: 15px;
      font-weight: 800;
      color: #274736;
    }
    .form-shell .input{
      border-radius: 999px;
      padding: 14px 18px;
      font-size: 15px;
    }
    .form-shell .btn{
      border-radius: 999px;
      padding: 14px 24px;
      font-weight: 800;
      font-size: 16px;
    }
    .form-shell label{
      font-size: 15px;
      font-weight: 800;
    }
    .profile-msg{
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      border-radius: 14px;
      font-size: 14px;
      font-weight: 700;
      animation: msgFadeIn .25s ease;
    }
    .profile-msg--success{ background:#ecfdf5; color:#047857; border:1.5px solid #a7f3d0; }
    .profile-msg--error{ background:#fef2f2; color:#b91c1c; border:1.5px solid #fecaca; }
    @keyframes msgFadeIn{ from{ opacity:0; transform:translateY(6px) } to{ opacity:1; transform:translateY(0) } }
  `],
  template: `
    <ng-container *ngIf="auth.user(); else guest">
      <section class="hero-shell" style="grid-template-columns: repeat(auto-fit,minmax(320px,1fr));">
        <div class="hero-copy">
          <span class="tagline">Perfil</span>
          <h1 class="hero-title">Tu información personal y acceso seguro.</h1>
          <div class="section-card profile-summary" style="width:100%; position:relative; margin:0;">
            <div class="profile-summary-main">
              <div>
                <div class="section-heading">{{ auth.user()!.nombre_completo }}</div>
              </div>
            </div>
            <div class="profile-details">
                <div class="detail">
                  <span class="ico" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><path d="M4 5h16v14H4zM4 9h16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>
                  </span>
                  <span class="label">Documento</span>
                  <span class="value">{{ auth.user()?.documento_mascara || 'Sin dato' }}</span>
                </div>
                <div class="detail">
                  <span class="ico" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.09 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.88.33 1.74.62 2.56a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.52-1.14a2 2 0 0 1 2.11-.45c.82.29 1.68.5 2.56.62A2 2 0 0 1 22 16.92z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>
                  </span>
                  <span class="label">Teléfono</span>
                  <span class="value">{{ auth.user()?.telefono || 'Sin dato' }}</span>
                </div>
                <div class="detail">
                  <span class="ico" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><path d="M4 4h16v16H4z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M4 8h16" stroke="currentColor" stroke-width="1.6"/></svg>
                  </span>
                  <span class="label">Ocupación</span>
                  <span class="value">Agricultor</span>
                </div>
                <div class="detail">
                  <span class="ico" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><path d="M4 6h16v12H4z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M4 8l8 6 8-6" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>
                  </span>
                  <span class="label">Correo</span>
                  <span class="value">{{ auth.user()?.email || 'Sin dato' }}</span>
                </div>
              </div>
            <div class="profile-art" aria-hidden="true"></div>
          </div>
        </div>

        <div class="floating-layers">
          <form class="form-shell" (ngSubmit)="onSave()">
            <div class="form-title">Editar perfil</div>

            <div class="row" style="align-items:center; gap:12px; display:none">
              <div class="avatar-circle avatar-lg">
                <img
                  *ngIf="photoPreview || auth.user()?.avatar_url"
                  [src]="photoPreview || auth.user()?.avatar_url!"
                  alt="Foto de perfil"
                  (error)="imgErrorForm=true"
                  (load)="imgErrorForm=false"
                />
                <span *ngIf="!(photoPreview || auth.user()?.avatar_url) || imgErrorForm">
                  {{ initials(auth.user()!.nombre_completo) }}
                </span>
              </div>
              <div>
                <label>Foto de usuario</label>
                <input type="file" accept="image/*" (change)="onPhotoChange($event)" />
              </div>
            </div>

            <div class="row" style="gap:12px">
              <div class="col" style="min-width:220px">
                <label>Ocupación</label>
                <input class="input" type="text" value="Agricultor" disabled style="opacity:0.6; cursor:not-allowed; background:#f0f7f2" />
              </div>
              <div class="col" style="min-width:180px">
                <label>Teléfono</label>
                <input class="input" type="tel" [(ngModel)]="telefono" name="telefono" placeholder="Ej.: 300 123 4567" />
              </div>
            </div>
            <div>
              <label>Actualiza tu correo</label>
              <input class="input" type="email" [(ngModel)]="email" name="email" placeholder="Ingresa tu correo" />
            </div>

            <div class="row" style="justify-content:flex-start">
              <button class="btn" [disabled]="busy">Guardar cambios</button>
            </div>
            <div *ngIf="msg" class="profile-msg profile-msg--success">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#d1fae5"/><path d="M7 12l4 4 6-7" stroke="#047857" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              <span>{{ msg }}</span>
            </div>
            <div *ngIf="error" class="profile-msg profile-msg--error">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#fee2e2"/><path d="M12 8v4m0 4h.01" stroke="#b91c1c" stroke-width="2.2" stroke-linecap="round"/></svg>
              <span>{{ error }}</span>
            </div>
          </form>
        </div>
      </section>
    </ng-container>

    <ng-template #guest>
      <div class="empty-state">Debes iniciar sesi├│n para consultar tu perfil.</div>
    </ng-template>
  `
})
export class ProfilePageComponent {
  ocupacion: string | null = null;
  telefono: string | null = null;
  email: string | null = null;
  imgErrorTop = false;
  imgErrorForm = false;
  photoFile: File | null = null;
  photoPreview: string | null = null;
  busy = false;
  msg: string | null = null;
  error: string | null = null;

  constructor(public auth: AuthService) {}

  ngOnInit() {
    this.ocupacion = null;
    this.telefono = null;
    this.email = null;
  }

  async onPhotoChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) return;

    // Previsualizar de inmediato
    this.imgErrorForm = false;
    this.photoFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      const data = String(reader.result || '');
      this.photoPreview = data;
    };
    reader.readAsDataURL(file);

    // Guardar foto en el perfil en cuanto se selecciona
    if (!this.auth.token()) return;
    this.busy = true;
    this.error = null;
    try {
      await this.auth.updatePhoto(file);
      this.photoFile = null;
      // Mantenemos el preview para que visualmente no ÔÇ£vuelvaÔÇØ a la anterior
      this.msg = 'Foto actualizada';
    } catch (err: any) {
      this.error = err?.error?.message || err?.message || 'No se pudo actualizar la foto';
    } finally {
      this.busy = false;
    }
  }

  async onSave() {
    if (!this.auth.token()) return;
    this.busy = true; this.msg = null; this.error = null;
    try {
      const telRaw = (this.telefono ?? '').trim();
      const emailRaw = (this.email ?? '').trim();

      let telefonoNormalizado: string | null = null;
      if (telRaw) {
        const digits = telRaw.replace(/\D/g, '');
        if (digits.length !== 10) {
          this.error = 'El teléfono debe tener exactamente 10 dígitos. Ejemplo: 3001234567.';
          this.busy = false;
          return;
        }
        telefonoNormalizado = digits;
      }

      if (emailRaw) {
        const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
        if (!emailRegex.test(emailRaw)) {
          this.error = 'Ingresa un correo electrónico válido. Ejemplo: agricultor@correo.com.';
          this.busy = false;
          return;
        }
      }

      await this.auth.updateProfile({
        telefono: telefonoNormalizado ?? undefined,
        email: emailRaw || undefined,
      });
      if (this.photoFile) {
        await this.auth.updatePhoto(this.photoFile);
        this.photoFile = null;
        this.photoPreview = null;
      }
      this.telefono = null;
      this.email = null;
      this.msg = 'Perfil actualizado correctamente';
      setTimeout(() => { this.msg = null; }, 4000);
    } catch (e: any) {
      this.error = e?.error?.message || e?.message || 'No se pudo actualizar el perfil';
      setTimeout(() => { this.error = null; }, 5000);
    } finally {
      this.busy = false;
    }
  }

  initials(name: string | null | undefined) {
    const parts = (name || '').trim().split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? 'A';
    const second = parts[1]?.[0] ?? 'G';
    return (first + second).toUpperCase();
  }
}

