import { Component, OnInit, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

type Lot = { id: number; nombre: string };
type Analysis = { id: number; lote_id: number; meta_rendimiento_t_ha: number | null; fecha_muestreo?: string; fertilizer_plan?: { id: number; pdf_download?: string | null } };

@Component({
  standalone: true,
  selector: 'app-analyses-page',
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="hero-shell">
      <div class="hero-copy">
        <span class="tagline">Laboratorio del campo</span>
        <h1 class="hero-title">Convierte resultados de suelo en acciones concretas.</h1>
        <p class="hero-subtitle">Registra tus análisis, genera planes de fertilización y descarga documentos listos para compartir.</p>
      </div>
    </section>

    <div class="hero-actions hero-actions--below">
      <button type="button" class="btn" (click)="scrollTo('crear-analisis')">Crear análisis</button>
    </div>

    <section class="ana-section" id="crear-analisis">
      <details class="ana-acc-card" id="create-analysis-acc">
        <summary class="ana-acc-hero"><div class="acc-hero-center"><h3 class="acc-hero-title">Crea tu análisis</h3></div></summary>
        <div class="acc-content">
          <div class="floating-layers">
        <form class="form-shell" (ngSubmit)="onCreate(); toggleAfterCreate()">
          <div class="form-title">Nuevo análisis</div>
          <div class="form-sub">Selecciona el lote y define el objetivo de recolección de grano.</div>
          <div class="row">
            <div class="col step">
              <label>Lote</label>
              <div class="lot-dropdown" [class.open]="lotDropdownOpen()" (click)="$event.stopPropagation()">
                <button type="button" class="lot-dropdown__trigger" (click)="toggleLotDropdown()">
                  <span class="lot-dropdown__icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 7h18M3 12h18M3 17h18" stroke="#2f8f3d" stroke-width="2" stroke-linecap="round"/></svg></span>
                  <span class="lot-dropdown__value" [class.placeholder]="!form.lotId">{{ form.lotId ? lotLabel(form.lotId) : 'Selecciona un lote' }}</span>
                  <span class="lot-dropdown__arrow" [class.rotated]="lotDropdownOpen()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 9L12 15L18 9" stroke="#153e29" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
                </button>
                <div class="lot-dropdown__menu" *ngIf="lotDropdownOpen()">
                  <div class="lot-dropdown__search">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="#466e59" stroke-width="2"/><path d="M16.5 16.5 21 21" stroke="#466e59" stroke-width="2" stroke-linecap="round"/></svg>
                    <input class="lot-dropdown__search-input" type="text" placeholder="Buscar lote..." [(ngModel)]="lotSearch" name="lotSearch" (click)="$event.stopPropagation()" />
                  </div>
                  <div class="lot-dropdown__list">
                    <button *ngFor="let l of filteredLots()" type="button" class="lot-dropdown__option" [class.selected]="form.lotId == l.id" (click)="selectLot(l)">
                      <span class="lot-dropdown__option-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" stroke-width="2"/></svg></span>
                      <span class="lot-dropdown__option-name">{{ l.nombre }}</span>
                      <svg *ngIf="form.lotId == l.id" class="lot-dropdown__check" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L19 7" stroke="#2f8f3d" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                    <div *ngIf="filteredLots().length === 0" class="lot-dropdown__empty">No se encontraron lotes</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col step" *ngIf="form.lotId">
              <label>Fecha muestreo</label>
              <input class="input" type="date" [(ngModel)]="form.sampled_at" name="sampled_at" />
            </div>
            <div class="col step" *ngIf="form.sampled_at">
              <label>Objetivo de recolección (t/ha)</label>
              <input class="input" type="number" step="0.1" min="4" max="12" [(ngModel)]="form.yield_target_t_ha" name="yield" required />
            </div>
          </div>
          <div class="row" *ngIf="form.lotId && form.sampled_at">
  <div class="col"><label>pH</label><input class="input" type="number" step="0.01" min="3" max="10" [(ngModel)]="form.ph" name="ph" placeholder="Ej: 6.3" /></div>
  <div class="col"><label>Materia Orgánica (%)</label><input class="input" type="number" step="0.01" min="0" max="20" [(ngModel)]="form.mo_percent" name="mo_percent" placeholder="Ej: 2.0" /></div>
  <div class="col"><label>CIC – Capacidad de Intercambio (cmol/kg)</label><input class="input" type="number" step="0.01" [(ngModel)]="form.cec_cmol" name="cec_cmol" placeholder="Ej: 6.48" /></div>
</div>
          <div class="row" *ngIf="form.lotId && form.sampled_at">
            <div class="col"><label>P – Fósforo (mg/kg)</label><input class="input" type="number" [(ngModel)]="form.p_mgkg" name="p" /></div>
            <div class="col"><label>K – Potasio (cmol/kg)</label><input class="input" type="number" [(ngModel)]="form.k_cmol" name="k" /></div>
            <div class="col"><label>Ca – Calcio (cmol/kg)</label><input class="input" type="number" [(ngModel)]="form.ca_cmol" name="ca" /></div>
            <div class="col"><label>Mg – Magnesio (cmol/kg)</label><input class="input" type="number" [(ngModel)]="form.mg_cmol" name="mg" /></div>
            <div class="col"><label>S – Azufre (mg/kg)</label><input class="input" type="number" [(ngModel)]="form.s_mgkg" name="s" /></div>
          </div>
          <div class="row" *ngIf="form.lotId && form.sampled_at">
            <div class="col"><label>B – Boro (mg/kg)</label><input class="input" type="number" step="0.01" [(ngModel)]="form.b_mgkg" name="b_mgkg" /></div>
            <div class="col"><label>Fe – Hierro (mg/kg)</label><input class="input" type="number" [(ngModel)]="form.fe_mgkg" name="fe_mgkg" /></div>
            <div class="col"><label>Mn – Manganeso (mg/kg)</label><input class="input" type="number" [(ngModel)]="form.mn_mgkg" name="mn_mgkg" /></div>
          </div>
          <div class="row" *ngIf="form.lotId && form.sampled_at">
            <div class="col"><label>Zn – Zinc (mg/kg)</label><input class="input" type="number" step="0.01" [(ngModel)]="form.zn_mgkg" name="zn_mgkg" /></div>
            <div class="col"><label>Cu – Cobre (mg/kg)</label><input class="input" type="number" [(ngModel)]="form.cu_mgkg" name="cu_mgkg" /></div>
          </div>
          <div *ngIf="error()" style="color:#d16969">{{ error() }}</div>
          <div class="row" style="justify-content:flex-start">
            <button class="btn" [disabled]="loading()" type="submit">Crear análisis</button>
          </div>
        </form>
          </div>
        </div>
      </details>
    </section>

    <!-- Descargas (desplegable) -->
    <section class="section-grid" style="margin-top:16px">
      <details class="download-acc" id="download-analysis-acc">
        <summary class="download-hero">
            <div class="download-hero__img">
            <div class="download-hero__label">Descargar análisis</div>
          </div>
        </summary>
        <div class="download-panel">
          <div class="lot-selector-label">Selecciona un lote para ver sus análisis</div>
          <div class="lot-chips">
            <button *ngFor="let l of lots()" type="button" class="lot-chip" [class.active]="downloadLotId() === l.id" (click)="selectDownloadLot(l.id)">{{ l.nombre }}</button>
          </div>
          <div *ngIf="lots().length === 0" class="empty-state" style="padding:12px 0">No tienes lotes creados.</div>
          <ng-container *ngIf="downloadLotId() !== null">
            <div class="lot-analyses-heading">Análisis de <strong>{{ lotName(downloadLotId()!) }}</strong></div>
            <div class="download-grid" *ngIf="filteredAnalyses().length; else emptyLot">
              <div class="download-item" *ngFor="let a of filteredAnalyses(); let i = index" [class.ready]="a.fertilizer_plan?.pdf_download" [class.pending]="!a.fertilizer_plan?.pdf_download">
                <div class="download-info">
                  <div class="download-title">Análisis #{{ filteredAnalyses().length - i }}</div>
                  <div class="download-sub">Objetivo: {{ a.meta_rendimiento_t_ha ?? '?' }} t/ha</div>
                  <div class="download-sub">{{ a.fecha_muestreo ?? '' }}</div>
                  <div class="download-status" [class.ready]="a.fertilizer_plan?.pdf_download" [class.pending]="!a.fertilizer_plan?.pdf_download">{{ a.fertilizer_plan?.pdf_download ? 'PDF listo' : 'Pendiente' }}</div>
                </div>
                <div class="download-actions">
                  <a class="btn btn-icon" [routerLink]="['/analyses', a.id]"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5c-7 0-11 7-11 7s4 7 11 7 11-7 11-7-4-7-11-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z" fill="currentColor"/></svg><span>Ver detalles</span></a>
                  <a *ngIf="a.fertilizer_plan?.pdf_download" class="btn btn-secondary btn-icon" [href]="a.fertilizer_plan?.pdf_download" target="_blank" rel="noopener"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 3v12m0 0 4-4m-4 4-4-4M4 19h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Descargar PDF</span></a>
                  <button *ngIf="!a.fertilizer_plan?.pdf_download" class="btn btn-secondary btn-icon" type="button" (click)="onGeneratePlan(a)" [disabled]="planInProgress() === a.id"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 3v12m0 0 4-4m-4 4-4-4M4 19h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><ng-container *ngIf="planInProgress() === a.id; else genLabel">Generando...</ng-container><ng-template #genLabel><span>Generar plan</span></ng-template></button>
                </div>
              </div>
            </div>
            <ng-template #emptyLot><div class="empty-state" style="padding:12px 0">Este lote no tiene análisis registrados.</div></ng-template>
          </ng-container>
        </div>
      </details>
    </section>

    <section class="section-grid" style="margin-top:24px" *ngIf="showLegacyList">
      <ng-container *ngIf="analyses().length; else empty">
        <div *ngFor="let a of analyses(); let i = index" class="section-card">
          <div class="section-heading">Análisis #{{ a.id }}</div>
          <div class="section-sub">Objetivo: {{ a.meta_rendimiento_t_ha ?? '?' }} t/ha</div>
          <div class="row" style="gap:12px; margin-top:8px">
            <a class="btn" [routerLink]="['/analyses', a.id]">Ver detalles</a>
            <button
              class="btn btn-secondary"
              type="button"
              (click)="onGeneratePlan(a)"
              [disabled]="planInProgress() === a.id"
            >
              <ng-container *ngIf="planInProgress() === a.id; else label">Generando...</ng-container>
              <ng-template #label>Generar plan</ng-template>
            </button>
          </div>
        </div>
      </ng-container>
    </section>

    <ng-template #empty>
      <div class="empty-state">Registra tu primer análisis para desbloquear planes de fertilización personalizados.</div>
    </ng-template>
  `,
  styles: [`
    /* Hero card container with background image */
    .hero-shell{ position:relative; background: url('/assets/7867974.jpg') center/110% no-repeat; border:none; border-radius:22px; overflow:hidden; box-shadow:0 18px 44px rgba(21,62,41,0.22); padding:24px; min-height: 400px; display:flex; align-items:center; justify-content:center; width: 100%; margin: 6px 0 0 0 }
    .hero-shell::before{ content:''; position:absolute; inset:0; background: linear-gradient(180deg, rgba(0,0,0,0.32), rgba(0,0,0,0.62)); backdrop-filter: blur(1.5px); }
    .hero-shell > *{ position: relative; z-index: 1; }
    .hero-copy{ color:#fff; max-width: 760px; text-align:center; display:flex; flex-direction:column; align-items:center }
    .hero-copy .tagline{ display:inline-block; background: rgba(255,255,255,0.96); color:#153e29; border-radius:999px; padding:7px 14px; font-weight:900; margin:0 auto 12px; font-size:13px; box-shadow:0 6px 18px rgba(0,0,0,0.18) }
    .hero-copy .hero-title{ color:#ffffff; text-shadow: 0 2px 14px rgba(0,0,0,0.55); margin: 10px 0 10px; font-size: 36px; line-height: 1.18; font-weight: 900; letter-spacing:.2px }
      .hero-copy .hero-subtitle{ color:#f1fffa; margin: 0; text-shadow: 0 2px 12px rgba(0,0,0,0.5); max-width: 52ch; font-weight:700; font-size:18px; line-height:1.45 }
      .hero-actions{ margin-top:16px; display:flex; gap:12px; flex-wrap:wrap; justify-content:center }
      .hero-actions--below{ padding:20px 0 8px; display:flex; justify-content:center; }
      .hero-actions--below .btn{
        position: relative;
        overflow: hidden;
        width: 100%;
        max-width: 420px;
        border-radius: 999px;
        padding: 16px 30px;
        font-size: 18px;
        font-weight: 900;
        letter-spacing: .3px;
        box-shadow: 0 18px 40px rgba(13,42,28,0.35);
        background: linear-gradient(135deg,#2f8f3d,#1f5f3a);
        color:#ffffff;
      }
      .hero-actions--below .btn::before{
        content:'';
        position:absolute;
        inset:-14%;
        background-image:
          url('/assets/GranoDeArroz.webp'),
          url('/assets/GranoDeArroz.webp'),
          url('/assets/GranoDeArroz.webp');
        background-size: 40px auto, 30px auto, 24px auto;
        background-repeat:no-repeat;
        background-position: 12% 140%, 52% 160%, 88% 135%;
        opacity:0.35;
        filter: drop-shadow(0 4px 8px rgba(0,0,0,0.25));
        animation: riceFloat 12s linear infinite alternate;
        pointer-events:none;
      }
      .hero-actions--below .btn::after{
        content:'';
        position:absolute;
        inset:0;
        background: linear-gradient(120deg, rgba(255,255,255,0.18), transparent 45%, rgba(255,255,255,0.10) 70%, transparent 100%);
        mix-blend-mode: screen;
        transform: translateX(-130%);
        animation: shineSweep 6s ease-in-out infinite;
        pointer-events:none;
      }
      @keyframes riceFloat{
        from{ background-position: 10% 145%, 50% 165%, 90% 140%; }
        to{ background-position: 0% 120%, 48% 140%, 100% 125%; }
      }
      @keyframes shineSweep{
        0%, 40%{ transform: translateX(-130%); }
        55%, 70%{ transform: translateX(130%); }
        100%{ transform: translateX(130%); }
      }
      @media (max-width: 720px){ .hero-shell{ min-height: 340px; padding:18px } .hero-copy .hero-title{ font-size: 30px } .hero-copy .hero-subtitle{ font-size:16px } }

    /* Inner form card */
    .floating-layers{ background: rgba(255,255,255,0.98); border:none; border-radius: 0 0 16px 16px; box-shadow: none; padding:12px 14px 16px; margin-top: 0; }
    .form-title { font-weight: 800; color:#153e29; margin-bottom: 4px; text-align:center }
    .form-sub { color:#335f47; margin-bottom: 8px; }
    .row { display:grid; grid-template-columns: 1fr; gap:12px; margin-bottom: 10px; }
    @media(min-width:720px){ .row{ grid-template-columns: repeat(2, 1fr) } }
    .col{ display:flex; flex-direction:column; gap:8px }
    label{ font-size:14px; color:#274736; font-weight:800 }
      .input{ height: 56px; border-radius: 16px; border:1px solid rgba(21,62,41,0.20); padding: 12px 14px; font-size:16px; background:#ffffff }
      .input:focus{ outline:none; border-color:#2f8f3d; box-shadow:0 0 0 4px rgba(47,143,61,0.12) }
      .input:hover{ border-color:#1f5f3a }
      /* Custom lot dropdown */
      .lot-dropdown{ position:relative; width:100% }
      .lot-dropdown__trigger{ width:100%; display:flex; align-items:center; gap:10px; background: linear-gradient(135deg, #f5fff8, #e3f3ea) padding-box, linear-gradient(135deg, rgba(47,143,61,0.45), rgba(21,62,41,0.35)) border-box; border: 1.5px solid transparent; border-radius: 18px; height: 56px; padding: 0 16px; cursor:pointer; box-shadow: 0 8px 22px rgba(21,62,41,0.13); transition: box-shadow .15s; }
      .lot-dropdown__trigger:hover{ box-shadow: 0 12px 28px rgba(21,62,41,0.18); }
      .lot-dropdown.open .lot-dropdown__trigger{ border-radius: 18px 18px 0 0; background: linear-gradient(135deg, #edfbf1, #d8f0e1) padding-box, linear-gradient(135deg, rgba(47,143,61,0.7), rgba(21,62,41,0.5)) border-box; }
      .lot-dropdown__icon{ flex-shrink:0; display:flex; align-items:center }
      .lot-dropdown__value{ flex:1; text-align:left; font-size:15px; font-weight:700; color:#153e29 }
      .lot-dropdown__value.placeholder{ color:#7aaa8c; font-weight:500 }
      .lot-dropdown__arrow{ flex-shrink:0; display:flex; align-items:center; transition: transform .18s ease }
      .lot-dropdown__arrow.rotated{ transform: rotate(180deg) }
      .lot-dropdown__menu{ position:absolute; top:100%; left:0; right:0; z-index:200; background:#fff; border: 1.5px solid rgba(47,143,61,0.35); border-top:none; border-radius: 0 0 18px 18px; box-shadow: 0 16px 36px rgba(21,62,41,0.18); overflow:hidden; }
      .lot-dropdown__search{ display:flex; align-items:center; gap:8px; padding: 10px 14px; border-bottom: 1px solid rgba(21,62,41,0.08); background: #f7fbf8; }
      .lot-dropdown__search-input{ flex:1; border:none; outline:none; background:transparent; font-size:13px; color:#274736; font-weight:500; }
      .lot-dropdown__search-input::placeholder{ color:#9abba7 }
      .lot-dropdown__list{ max-height:200px; overflow-y:auto }
      .lot-dropdown__option{ width:100%; display:flex; align-items:center; gap:10px; padding: 12px 16px; border:none; background:transparent; cursor:pointer; text-align:left; transition: background .12s; border-bottom: 1px solid rgba(21,62,41,0.05); }
      .lot-dropdown__option:last-child{ border-bottom:none }
      .lot-dropdown__option:hover{ background: #f0f9f3 }
      .lot-dropdown__option.selected{ background: linear-gradient(90deg,#e8f7ee,#f5fff8) }
      .lot-dropdown__option-icon{ flex-shrink:0; color:#2f8f3d; display:flex; align-items:center }
      .lot-dropdown__option-name{ flex:1; font-size:14px; font-weight:700; color:#153e29 }
      .lot-dropdown__check{ flex-shrink:0 }
      .lot-dropdown__empty{ padding:14px 16px; font-size:13px; color:#7aaa8c; text-align:center }
    /* Oculta flechas de number para un look más limpio */
    input[type=number]::-webkit-outer-spin-button,
    input[type=number]::-webkit-inner-spin-button{ -webkit-appearance: none; margin: 0 }
    input[type=number]{ -moz-appearance:textfield }
    .btn{ background: linear-gradient(135deg, #2f8f3d, #1f5f3a); color:#fff; border:none; border-radius:14px; padding:12px 16px; font-weight:900; letter-spacing:.2px; box-shadow: 0 12px 26px rgba(21,62,41,0.20); }
    .btn.btn-secondary{ background: #e8f2ec; color:#1f5f3a }

    /* Step-by-step reveal */
    .step-form .step{ animation: fadeSlideIn .18s ease; }
    .actions{ margin-top:8px }
    .form-error{ color:#d16969 }
    @keyframes fadeSlideIn{ from{ opacity:0; transform: translateY(-6px) } to{ opacity:1; transform: translateY(0) } }

    /* Accordion card for the analysis form */
    .ana-acc-card{ background:#fff; border:none; border-radius:16px; box-shadow: 0 14px 32px rgba(21,62,41,0.10); overflow:visible; margin: 12px 0 18px; }
    .ana-acc-card>summary{ list-style:none; display:block; cursor:pointer; padding:0; position:relative }
    .ana-acc-card>summary::-webkit-details-marker{ display:none }
    .ana-acc-hero{ position: relative; padding:0; min-height: 150px; background: url('/assets/5104194.jpg') center/cover no-repeat !important; border-bottom: none; border-radius:16px 16px 0 0; overflow:hidden; }
    .ana-acc-hero::before{ content:''; position:absolute; inset:0; background: linear-gradient(180deg, rgba(0,0,0,0.20), rgba(0,0,0,0.45)); }
    .acc-hero-center{ position:absolute; inset:0; display:flex; align-items:center; justify-content:center; text-align:center; padding: 12px }
    .acc-hero-title{ color:#fff; font-weight:900; font-size: 30px; letter-spacing:.2px; text-shadow: 0 2px 12px rgba(0,0,0,0.6) }
    .acc-content{ padding:0 16px 16px; overflow:visible; }
    .ana-form .input{ height: 54px; border-radius: 14px; font-size: 16px }
    .ana-form label{ font-size: 13px; font-weight: 800; color:#153e29 }

      /* Hacer que los cards ocupen todo el ancho (pegados a los lados) */
      .hero-shell{ margin: 6px 0 0 0; }
      .ana-section{ width: 100%; margin-left: 0; margin-right: 0; }
    .download-item{ display:flex; align-items:center; justify-content:space-between; gap:12px; background: linear-gradient(180deg, #ffffff, #f7faf8); border:none; border-radius:16px; padding:14px 16px; overflow:hidden; flex-wrap:wrap; box-shadow:0 10px 24px rgba(21,62,41,0.08) }
    .download-item.ready{ box-shadow: 0 10px 24px rgba(16,185,129,0.12) }
    .download-item.pending{ box-shadow: 0 10px 24px rgba(245,158,11,0.10) }
    .download-info{ display:flex; flex-direction:column }
    .download-title{ font-weight:900; color:#153e29; font-size:16px; letter-spacing:.2px }
    .download-sub{ color:#466e59; font-size:12px }
    .download-actions{ display:flex; gap:8px; flex-wrap:nowrap; align-items:center; justify-content:flex-start; white-space:nowrap }
    .download-actions .btn{ flex:0 0 auto }
    .btn-icon{ display:inline-flex; align-items:center; gap:8px }
    .download-status{ margin-top:4px; font-weight:800; font-size:11px; padding:4px 8px; border-radius:999px; width:max-content }
    .download-status.ready{ background: rgba(16,185,129,0.12); color:#047857 }
    .download-status.pending{ background: rgba(245,158,11,0.12); color:#92400e }
    .download-actions .btn{ padding:10px 14px; border-radius:16px }
    .download-actions .btn:hover{ transform: translateY(-1px); transition: transform .12s ease }
    .download-actions .btn.btn-secondary{ background:#eaf5ef; color:#1f5f3a }
    /* Descargar análisis - acordeón */
    .download-acc{ background:#fff; border:none; border-radius:16px; box-shadow: 0 14px 32px rgba(21,62,41,0.10); overflow:hidden; margin: 12px 0 18px; }
    .download-acc>summary{ list-style:none; display:block; cursor:pointer; padding:0; position:relative }
    .download-acc>summary::-webkit-details-marker{ display:none }
    .download-hero__img{ position: relative; height:140px; background: url('/assets/2110.w023.n001.1202B.p1.1202.jpg') center/cover no-repeat }
    .download-hero__img::before{ content:''; position:absolute; inset:0; background: linear-gradient(180deg, rgba(0,0,0,0.10), rgba(0,0,0,0.35)) }
    .download-hero__label{
      position:absolute; left:50%; top:50%; transform: translate(-50%, -50%);
      background: transparent; border:none; box-shadow:none; backdrop-filter:none;
      color:#ffffff; font-weight:900; font-size:24px; letter-spacing:.3px; line-height:1; white-space:nowrap; text-align:center;
      padding:0; margin:0;
      text-shadow: 0 2px 10px rgba(0,0,0,0.65), 0 4px 14px rgba(0,0,0,0.45);
      z-index:1;
    }
    .download-panel{ padding: 12px 14px 16px }
    .download-grid{ display:grid; grid-template-columns: repeat(auto-fit, minmax(280px,1fr)); gap:12px }
    .lot-selector-label{ font-weight:800; color:#153e29; font-size:14px; margin-bottom:10px }
    .lot-chips{ display:flex; flex-wrap:wrap; gap:8px; margin-bottom:16px }
    .lot-chip{ background:#eaf5ef; color:#1f5f3a; border:1.5px solid transparent; border-radius:999px; padding:8px 18px; font-weight:700; font-size:14px; cursor:pointer; transition: background .14s, border-color .14s, box-shadow .14s }
    .lot-chip:hover{ background:#d4edda; border-color:#2f8f3d }
    .lot-chip.active{ background: linear-gradient(135deg,#2f8f3d,#1f5f3a); color:#fff; border-color:transparent; box-shadow:0 6px 18px rgba(21,62,41,0.22) }
    .lot-analyses-heading{ font-weight:700; color:#335f47; font-size:13px; margin-bottom:10px; padding:6px 0 }
  `]
})
export class AnalysesPageComponent implements OnInit {
  analyses = signal<Analysis[]>([]);
  lots = signal<Lot[]>([]);
  error = signal<string | null>(null);
  loading = signal(false);
  planInProgress = signal<number | null>(null);
  downloadLotId = signal<number | null>(null);
  lotDropdownOpen = signal(false);
  lotSearch = '';
  showLegacyList = false;
  form: any = { lotId: '', sampled_at: '', yield_target_t_ha: '7', ph: '', mo_percent: '', cec_cmol: '', p_mgkg: '', k_cmol: '', ca_cmol: '', mg_cmol: '', s_mgkg: '', b_mgkg: '', fe_mgkg: '', mn_mgkg: '', zn_mgkg: '', cu_mgkg: '' };

  constructor(private api: ApiService, public auth: AuthService, private toast: ToastService) { }

  async ngOnInit() { await this.load(); }

  async load() {
    if (!this.auth.token()) return;
    this.loading.set(true); this.error.set(null);
    try {
      const resA = await this.api.get<{ data: Analysis[] }>(`/api/v1/soil-analyses?include=plan`, true);
      const resL = await this.api.get<{ data: Lot[] }>(`/api/v1/lots`, true);
      this.analyses.set(resA?.data || []);
      this.lots.set(resL?.data || []);
    } catch (e: any) {
      const message = e?.message || 'No se pudieron cargar los análisis';
      this.error.set(message);
      this.toast.show(message, 'error');
    }
    this.loading.set(false);
  }

  async onCreate() {
    if (!this.auth.token()) return;
    // Validaciones rápidas en cliente
    if (!this.form.lotId) {
      this.error.set('Debes seleccionar el lote al que pertenece el análisis.');
      return;
    }
    if (!this.form.sampled_at) {
      this.error.set('Ingresa la fecha de muestreo. Es la fecha en la que se tomó la muestra de suelo.');
      return;
    }
    const sample = new Date(this.form.sampled_at);
    const today = new Date();
    sample.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    if (sample.getTime() > today.getTime()) {
      this.error.set('La fecha de muestreo no puede ser mayor a la fecha actual. Selecciona hoy o una fecha anterior en la que realmente se tomó la muestra.');
      return;
    }
    const lot = this.lots().find(l => (l as any).id === Number(this.form.lotId));
    if (lot && (lot as any).fecha_siembra) {
      try {
        const sowing = new Date((lot as any).fecha_siembra);
        sowing.setHours(0, 0, 0, 0);
        if (sample.getTime() < sowing.getTime()) {
          this.error.set('La fecha de muestreo no puede ser menor a la fecha de siembra del lote. Usa una fecha igual o posterior a la siembra.');
          return;
        }
      } catch { }
    }
    const goal = Number(this.form.yield_target_t_ha);
    if (isNaN(goal) || goal < 4 || goal > 12) {
      this.error.set('El objetivo de recolección debe ser un número entre 4 y 12 t/ha. Por ejemplo: 7.5.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    try {
      const payload: any = { sampled_at: this.form.sampled_at || undefined, yield_target_t_ha: Number(this.form.yield_target_t_ha) };
      for (const k of ['ph', 'mo_percent', 'cec_cmol', 'p_mgkg', 'k_cmol', 'ca_cmol', 'mg_cmol', 's_mgkg', 'b_mgkg', 'fe_mgkg', 'mn_mgkg', 'zn_mgkg', 'cu_mgkg']) {
        if (this.form[k] !== '' && this.form[k] !== null && this.form[k] !== undefined) {
          payload[k] = Number(this.form[k]);
        }
      }
      await this.api.post(`/api/v1/lots/${this.form.lotId}/soil-analyses`, payload, true);
      this.form = { lotId: '', sampled_at: '', yield_target_t_ha: '7', p_mgkg: '', k_cmol: '', ca_cmol: '', mg_cmol: '', s_mgkg: '', b_mgkg: '', fe_mgkg: '', mn_mgkg: '', zn_mgkg: '', cu_mgkg: '' };
      await this.load();
      this.toast.show('Análisis creado correctamente', 'success');
    } catch (e: any) {
      const message = 'Hay errores en los datos del análisis. Revisa que la fecha y los nutrientes estén dentro de los rangos permitidos (por ejemplo, K no debe ser mayor a 5 cmol(+)/kg).';
      this.error.set(message);
      this.toast.show(message, 'error');
    }
    this.loading.set(false);
  }

  async onGeneratePlan(a: Analysis) {
    if (!this.auth.token()) return;
    this.planInProgress.set(a.id);
    try {
      await this.api.post(`/api/v1/soil-analyses/${a.id}/plan/generate`, {}, true);
      await this.load();
      this.toast.show('Plan generado. Revisa el detalle para descargar el PDF.', 'success');
    } catch (e: any) {
      const message = e?.message || 'No se pudo generar el plan';
      this.toast.show(message, 'error');
    } finally {
      this.planInProgress.set(null);
    }
  }

  @HostListener('document:click')
  onDocumentClick() { this.lotDropdownOpen.set(false); }

  toggleLotDropdown() { this.lotDropdownOpen.update(v => !v); }

  selectLot(lot: Lot) {
    this.form.lotId = lot.id;
    this.lotDropdownOpen.set(false);
    this.lotSearch = '';
  }

  lotLabel(id: any): string {
    return this.lots().find(l => l.id == id)?.nombre ?? '';
  }

  filteredLots() {
    const q = this.lotSearch.toLowerCase().trim();
    if (!q) return this.lots();
    return this.lots().filter(l => l.nombre.toLowerCase().includes(q));
  }

  selectDownloadLot(id: number) {
    this.downloadLotId.set(this.downloadLotId() === id ? null : id);
  }

  filteredAnalyses() {
    const id = this.downloadLotId();
    if (id === null) return [];
    return this.analyses().filter(a => a.lote_id === id);
  }

  lotName(id: number): string {
    return this.lots().find(l => l.id === id)?.nombre ?? '';
  }

  // Filtra análisis con plan y enlace disponible
  readyAnalyses() {
    return this.analyses().filter(a => !!a.fertilizer_plan?.pdf_download);
  }
  scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) {
      const acc = el.querySelector('details.ana-acc-card') as HTMLDetailsElement | null;
      if (acc && !acc.open) { acc.open = true; }
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  toggleAfterCreate() {
    try {
      const createAcc = document.getElementById('create-analysis-acc') as HTMLDetailsElement | null;
      if (createAcc) { createAcc.open = false; }
      const downloadAcc = document.getElementById('download-analysis-acc') as HTMLDetailsElement | null;
      if (downloadAcc) {
        downloadAcc.open = true;
        downloadAcc.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch { }
  }
}













