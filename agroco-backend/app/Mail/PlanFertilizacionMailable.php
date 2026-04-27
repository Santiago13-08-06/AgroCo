<?php

namespace App\Mail;

use App\Models\Lot;
use App\Models\SoilAnalysis;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PlanFertilizacionMailable extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Lot $lot,
        public SoilAnalysis $soil,
        public array $planData,
        public string $downloadUrl
    ) {}

    public function build()
    {
        return $this->subject('Plan de fertilización - ' . ($this->lot->name ?? 'Lote #' . $this->lot->id))
            ->view('emails.plan_fertilizacion')
            ->with([
                'lot'         => $this->lot,
                'soil'        => $this->soil,
                'data'        => $this->planData,
                'downloadUrl' => $this->downloadUrl,
            ]);
    }
}