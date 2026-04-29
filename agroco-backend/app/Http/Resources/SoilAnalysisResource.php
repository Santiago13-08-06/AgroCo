<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class SoilAnalysisResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                     => $this->id,
            'lote_id'                => $this->lot_id,
            'fecha_muestreo'         => optional($this->sampled_at)->toDateString(),
            'meta_rendimiento_t_ha'  => $this->yield_target_t_ha !== null ? (float) $this->yield_target_t_ha : null,

            // === Elementos mayores ===
            'fosforo_mgkg'           => $this->p_mgkg       !== null ? (float) $this->p_mgkg : null,
            'potasio_cmol'           => $this->k_cmol       ?? $this->k_cmolkg ?? null,
            'calcio_cmol'            => $this->ca_cmol      !== null ? (float) $this->ca_cmol : null,
            'magnesio_cmol'          => $this->mg_cmol      !== null ? (float) $this->mg_cmol : null,
            'azufre_mgkg'            => $this->s_mgkg       !== null ? (float) $this->s_mgkg : null,

            // === Elementos menores ===
            'boro_mgkg'              => $this->b_mgkg       !== null ? (float) $this->b_mgkg : null,
            'hierro_mgkg'            => $this->fe_mgkg      !== null ? (float) $this->fe_mgkg : null,
            'manganeso_mgkg'         => $this->mn_mgkg      !== null ? (float) $this->mn_mgkg : null,
            'zinc_mgkg'              => $this->zn_mgkg      !== null ? (float) $this->zn_mgkg : null,
            'cobre_mgkg'             => $this->cu_mgkg      !== null ? (float) $this->cu_mgkg : null,

            // Auditoría
            'creado_en'              => $this->created_at,
            'actualizado_en'         => $this->updated_at,

            // === Plan de fertilización ===
            // Requiere que la relación SE HAYA CARGADO: with('plan')
            'fertilizer_plan' => $this->when(
                $this->relationLoaded('plan') || $this->relationLoaded('fertilizerPlan'),
                function () {
                    $plan = $this->relationLoaded('plan') ? $this->plan : $this->fertilizerPlan;

                    if (! $plan) {
                        return null;
                    }

                    return [
                        'id'               => $plan->id,
                        'email_sent_count' => (int) ($plan->email_sent_count ?? 0),
                    ];
                }
            ),
        ];
    }
}
