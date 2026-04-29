<!doctype html>
<html>

<body style="font-family: sans-serif; color:#222; line-height:1.4;">
    <p>Hola {{ optional($lot->user)->full_name ?? 'Productor' }},</p>

    <p>
        Tu <strong>Plan de fertilización</strong> para el lote
        <strong>{{ $lot->name ?? 'Lote #'.$lot->id }}</strong> ha sido generado exitosamente.
    </p>

    <p>
        <strong>Resumen:</strong><br>
        &bull; Área: {{ $lot->area_ha ?? '—' }} ha<br>
        &bull; Rendimiento objetivo: {{ $soil->yield_target_t_ha ?? '—' }} t/ha
    </p>

    @if(isset($data['resumen_totales_lote']))
    <p><strong>Totales de fertilizantes para tu lote:</strong></p>
    <ul>
        @foreach($data['resumen_totales_lote'] as $item)
        <li>{{ $item['nombre'] }}: {{ number_format($item['kg_totales'], 0, ',', '.') }} kg ({{ ceil($item['kg_totales'] / 50) }} bultos)</li>
        @endforeach
    </ul>
    @endif

    <p>
        Puedes descargar tu plan completo en PDF haciendo clic en el siguiente enlace:<br><br>
        <a href="{{ $downloadUrl }}" style="background:#2e7d32;color:#fff;padding:10px 20px;text-decoration:none;border-radius:5px;">
            Descargar Plan de Fertilización (PDF)
        </a>
    </p>

    <p style="font-size:12px;color:#666;">
        Este enlace es válido por 24 horas.
    </p>

    <p>
        El plan incluye el detalle de:<br>
        &bull; Objetivos nutricionales (kg/ha y totales)<br>
        &bull; Dosis de cada fertilizante por hectárea y por lote<br>
        &bull; Fraccionamiento por fases (siembra, macollamiento, embuche)
    </p>

    <p>Éxitos en tu cultivo de arroz.</p>

    <p style="margin-top:20px;">Equipo AgroCo</p>
</body>

</html>