const fs = require('fs');

function calcPace(timeStr, distance) {
  // timeStr: "01:01:16,210" or "00:58:02,351"
  if (!timeStr || timeStr === "-") return "-";
  let parts = timeStr.split(',');
  let hms = parts[0].split(':');
  let seconds = parseInt(hms[0]) * 3600 + parseInt(hms[1]) * 60 + parseInt(hms[2]);
  
  let paceSec = seconds / distance;
  let paceMin = Math.floor(paceSec / 60);
  let paceRemSec = Math.floor(paceSec % 60);
  
  return String(paceMin).padStart(2, '0') + ':' + String(paceRemSec).padStart(2, '0');
}

// 2025
let file2025 = fs.readFileSync('dades_resultats_2025.js', 'utf8');
let obj2025_str = file2025.replace('window.resultats2025 = ', '').replace(/;\s*$/, '');
let res2025;
try {
  // use eval to parse as some keys might not have quotes
  eval('res2025 = ' + obj2025_str);
} catch (e) {
  console.log("Error eval 2025", e);
}

if (res2025) {
  res2025.forEach(r => {
    if (r.temps) {
      r.ritme = calcPace(r.temps, 13.0);
    }
  });
  let new2025 = '/* \n  Dades de classificacions 2025\n  Revisades i corregides segons les fotos oficials.\n  Ritmes recalculats a 13km.\n*/\n\nwindow.resultats2025 = ' + JSON.stringify(res2025, null, 2) + ';\n';
  fs.writeFileSync('dades_resultats_2025.js', new2025, 'utf8');
  console.log('2025 updated');
}

// 2026
let file2026 = fs.readFileSync('dades_resultats_2026.js', 'utf8');
let obj2026_str = file2026.replace('window.resultats2026 = ', '').replace(/;\s*$/, '');
let res2026;
try {
  eval('res2026 = ' + obj2026_str);
} catch (e) {
  console.log("Error eval 2026", e);
}

if (res2026) {
  res2026.forEach(r => {
    if (r.temps) {
      if (r.cursa === '5km') {
        r.ritme = calcPace(r.temps, 5.0);
      } else if (r.cursa === '12K' || !r.cursa) {
        r.ritme = calcPace(r.temps, 12.5);
      }
    }
  });
  let new2026 = '/* \n  Dades de classificacions 2026\n  Generat automàticament a partir dels resultats oficials d\'Sportmaniacs.\n  Ritmes recalculats a 12.5km per la 12K i 5km per la 5K.\n*/\n\nwindow.resultats2026 = ' + JSON.stringify(res2026, null, 2) + ';\n';
  fs.writeFileSync('dades_resultats_2026.js', new2026, 'utf8');
  console.log('2026 updated');
}
