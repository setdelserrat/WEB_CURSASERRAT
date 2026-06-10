$file2025 = "dades_resultats_2025.js"
$text2025 = (Get-Content $file2025 -Raw) -replace 'window\.resultats2025\s*=\s*', '' -replace ';\s*$', ''
$text2025 = $text2025 -replace '/\*[\s\S]*?\*/\s*', '' # remove comments
$json2025 = $text2025 | ConvertFrom-Json

function Convert-TimeToSeconds {
    param([string]$timeStr)
    $parts = $timeStr.Split(',')
    $hms = $parts[0].Split(':')
    return ([int]$hms[0] * 3600) + ([int]$hms[1] * 60) + [int]$hms[2]
}

function Calculate-Pace {
    param([int]$seconds, [double]$distance)
    $paceSec = [math]::Floor($seconds / $distance)
    $min = [int][math]::Floor($paceSec / 60)
    $sec = [int]($paceSec % 60)
    return "{0:D2}:{1:D2}" -f $min, $sec
}

foreach ($item in $json2025) {
    if ($item.temps) {
        $sec = Convert-TimeToSeconds $item.temps
        $item.ritme = Calculate-Pace -seconds $sec -distance 13.0
    }
}

$newJson2025 = $json2025 | ConvertTo-Json -Depth 10
$final2025 = "/* `n  Dades de classificacions 2025`n  Revisades i corregides segons les fotos oficials.`n  Ritmes recalculats a 13km.`n*/`n`nwindow.resultats2025 = " + $newJson2025 + ";"
Set-Content $file2025 -Value $final2025 -Encoding UTF8


$file2026 = "dades_resultats_2026.js"
$text2026 = (Get-Content $file2026 -Raw) -replace 'window\.resultats2026\s*=\s*', '' -replace ';\s*$', ''
$text2026 = $text2026 -replace '/\*[\s\S]*?\*/\s*', ''
$json2026 = $text2026 | ConvertFrom-Json

foreach ($item in $json2026) {
    if ($item.temps) {
        $sec = Convert-TimeToSeconds $item.temps
        if ($item.cursa -eq "5km") {
            $item.ritme = Calculate-Pace -seconds $sec -distance 5.0
        } else {
            $item.ritme = Calculate-Pace -seconds $sec -distance 12.5
        }
    }
}

$newJson2026 = $json2026 | ConvertTo-Json -Depth 10
$final2026 = "/* `n  Dades de classificacions 2026`n  Generat automàticament a partir dels resultats oficials d'Sportmaniacs.`n  Ritmes recalculats a 12.5km per la 12K i 5km per la 5K.`n*/`n`nwindow.resultats2026 = " + $newJson2026 + ";"
Set-Content $file2026 -Value $final2026 -Encoding UTF8
