@echo off
setlocal enabledelayedexpansion
chcp 65001 > nul

echo // Arxiu generat automaticament per ActualitzarLogos.bat > llista_sponsors.js
echo const llistaSponsors = [ >> llista_sponsors.js

for %%f in ("Imatges\LOGOS SPONSORS\*.*") do (
    echo     "%%~nxf", >> llista_sponsors.js
)

echo ]; >> llista_sponsors.js
echo Llista de sponsors actualitzada correctament!
pause
