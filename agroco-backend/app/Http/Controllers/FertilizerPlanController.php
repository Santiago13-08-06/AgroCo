<?php

namespace App\Http\Controllers;

use App\Http\Resources\FertilizerPlanResource;
use App\Mail\PlanFertilizacionMailable;
use App\Models\FertilizerPlan;
use App\Models\SoilAnalysis;
use App\Services\FertilizationCalculator;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;

class FertilizerPlanController extends Controller
{
    public function generate(SoilAnalysis $soilAnalysis, FertilizationCalculator $calculator): JsonResponse
    {
        $soilAnalysis->loadMissing('lot.user');
        $this->authorize('update', $soilAnalysis->lot);

        $result   = (array) $calculator->buildPlan($soilAnalysis);
        $targets  = $this->normalizeKeys((array) Arr::get($result, 'targets', []));
        $products = $this->normalizeKeys((array) Arr::get($result, 'products', []));
        $split    = Arr::get($result, 'split', []);

        $pick = function (array $source, array|string $aliases, mixed $default = 0) {
            $aliases = is_array($aliases) ? $aliases : [$aliases];
            foreach ($aliases as $alias) {
                $key = strtolower((string) $alias);
                if (array_key_exists($key, $source)) {
                    return $source[$key];
                }
            }
            return $default;
        };

        $asNumber = static fn ($value) => is_numeric($value) ? round((float) $value, 2) : 0.0;

        /** @var FertilizerPlan $plan */
        $plan = $soilAnalysis->plan()->updateOrCreate([], [
            'download_token'     => Str::random(40),
            'n'                  => $asNumber($pick($targets, 'n')),
            'p2o5'               => $asNumber($pick($targets, 'p2o5')),
            'k2o'                => $asNumber($pick($targets, 'k2o')),
            's'                  => $asNumber($pick($targets, 's')),
            'use_zn_soil'        => (bool) $pick($targets, ['use_zn_soil', 'usar_zinc_suelo'], false),
            'use_mn_foliar'      => (bool) $pick($targets, ['use_mn_foliar', 'usar_manganeso_foliar'], true),
            'urea_46'            => $asNumber($pick($products, 'urea_46')),
            'asam_21_24s'        => $asNumber($pick($products, ['asam_21_24s', 'sulfato_amonio_21_24s'])),
            'dap_18_46_0'        => $asNumber($pick($products, 'dap_18_46_0')),
            'kcl_0_0_60'         => $asNumber($pick($products, 'kcl_0_0_60')),
            'k2so4_0_0_50_18s'   => $asNumber($pick($products, 'k2so4_0_0_50_18s')),
            'yeso_agricola'      => $asNumber($pick($products, 'yeso_agricola')),
            'cal_agricola'       => $asNumber($pick($products, 'cal_agricola')),
            'kieserita_16mg_13s' => $asNumber($pick($products, 'kieserita_16mg_13s')),
            'dolomita'           => $asNumber($pick($products, 'dolomita')),
            'znso4_suelo'        => $asNumber($pick($products, ['znso4_suelo', 'znso4 suelo'])),
            'znso4_foliar'       => $asNumber($pick($products, 'znso4_foliar')),
            'mnso4_suelo'        => $asNumber($pick($products, 'mnso4_suelo')),
            'mnso4_foliar'       => $asNumber($pick($products, 'mnso4_foliar')),
            'borax_11b'          => $asNumber($pick($products, ['borax_11b', 'borax_11B'])),
            'cuso4_25cu'         => $asNumber($pick($products, ['cuso4_25cu', 'cuso4_25Cu'])),
            'fe_eddha_6fe'       => $asNumber($pick($products, ['fe_eddha_6fe', 'fe_eddha_6Fe'])),
            'split'              => $split,
        ])->fresh();

        $plan->loadMissing('soilAnalysis.lot');

        $resource = (new FertilizerPlanResource($plan))->toArray(request());

        if ($this->hasInvalidNumbers($resource)) {
            Log::channel('agroco')->warning('Plan con valores no válidos', [
                'plan_id' => $plan->id,
                'payload' => $resource,
            ]);

            return response()->json([
                'message' => 'El plan generado contiene valores fuera de rango. Revisa el análisis o intenta de nuevo.',
            ], 422);
        }

        // Generar URL de descarga firmada (24 horas)
        $signedUrl = URL::temporarySignedRoute(
            'fert-plans.download',
            now()->addHours(24),
            ['plan' => $plan->id, 'token' => $plan->download_token]
        );

        // Generar PDF en memoria (sin Storage)
        $pdfFilename = sprintf('plan_fertilizacion_%d.pdf', $plan->id);
        $pdfContent  = Pdf::loadView('pdf.plan_fertilizacion', [
            'plan' => $resource,
            'lot'  => $soilAnalysis->lot,
            'soil' => $soilAnalysis,
        ])->output();

        // Enviar correo con PDF adjunto
        // Solo se requiere que el usuario tenga email; no exigimos verificación de email
        $mailSent = false;
        $mailError = null;
        $user = $soilAnalysis->lot->user;

        if ($user && $user->email) {
            try {
                Mail::to($user->email)->send(
                    new PlanFertilizacionMailable(
                        $soilAnalysis->lot,
                        $soilAnalysis,
                        $resource,
                        $signedUrl,
                        $pdfContent,
                        $pdfFilename,
                    )
                );
                $plan->increment('email_sent_count');
                $mailSent = true;
            } catch (\Throwable $e) {
                $mailError = $e->getMessage();
                // Usar error_log para que sea visible en Railway logs (stderr/stdout)
                error_log('[AgroCo] Error al enviar correo plan_id=' . $plan->id . ' => ' . $mailError);
            }
        }

        error_log('[AgroCo] Plan generado plan_id=' . $plan->id . ' mail_sent=' . ($mailSent ? 'true' : 'false'));

        return response()->json([
            'message'      => 'Plan de fertilización generado correctamente.',
            'soil_id'      => $soilAnalysis->id,
            'lot_id'       => $soilAnalysis->lot_id,
            'area_ha'      => $soilAnalysis->lot->area_ha ?? 1,
            'pdf_download' => $signedUrl,
            'mail_sent'    => $mailSent,
            'mail_error'   => $mailError, // visible en respuesta para debug
            'plan'         => $resource,
        ]);
    }

    /**
     * Descarga el PDF generándolo al vuelo desde los datos guardados en BD.
     * No depende de Storage (compatible con Railway y otros hostings efímeros).
     */
    public function download(FertilizerPlan $plan): \Illuminate\Http\Response
    {
        if (! request()->hasValidSignature()) {
            abort(401, 'Link inválido o expirado.');
        }

        $token = request()->route('token') ?? request('token');
        if (! $token || $token !== $plan->download_token) {
            abort(401, 'Token de descarga inválido.');
        }

        $plan->loadMissing('soilAnalysis.lot');

        $resource    = (new FertilizerPlanResource($plan))->toArray(request());
        $pdfContent  = Pdf::loadView('pdf.plan_fertilizacion', [
            'plan' => $resource,
            'lot'  => $plan->soilAnalysis->lot,
            'soil' => $plan->soilAnalysis,
        ])->output();

        $filename = sprintf('plan_fertilizacion_%d.pdf', $plan->id);

        return response($pdfContent, 200, [
            'Content-Type'        => 'application/pdf',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Content-Length'      => strlen($pdfContent),
        ]);
    }

    private function normalizeKeys(array $data): array
    {
        $output = [];
        foreach ($data as $key => $value) {
            $output[strtolower((string) $key)] = $value;
        }
        return $output;
    }

    private function hasInvalidNumbers(array $data): bool
    {
        $invalid = false;

        $walker = function ($value) use (&$invalid, &$walker) {
            if ($invalid) {
                return;
            }
            if (is_array($value)) {
                array_walk($value, $walker);
                return;
            }
            if (is_numeric($value)) {
                $number = (float) $value;
                if (! is_finite($number) || abs($number) > 100000) {
                    $invalid = true;
                }
            }
        };

        array_walk($data, $walker);

        return $invalid;
    }
}
