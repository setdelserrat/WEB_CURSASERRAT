// Inicialització del mapa
const map = L.map('map', {
    zoomControl: false // Movemos zoom control a una posición mejor
}).setView([41.95, 2.01], 14); // Centro aproximado de la ruta (Collbató/Montserrat)

// Añadir control de zoom abajo a la derecha
L.control.zoom({
    position: 'bottomright'
}).addTo(map);

// Capa base de OpenStreetMap
const baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors',
    className: 'dark-tiles'
}).addTo(map);

// Theme Toggle Logic
const themeBtn = document.getElementById('theme-toggle');
const themeIcon = themeBtn.querySelector('i');
let isDarkTheme = true;

themeBtn.addEventListener('click', () => {
    isDarkTheme = !isDarkTheme;
    if (isDarkTheme) {
        document.body.classList.remove('light-theme');
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
        baseLayer.getContainer().classList.add('dark-tiles');
        baseLayer.getContainer().classList.remove('light-tiles');
    } else {
        document.body.classList.add('light-theme');
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
        baseLayer.getContainer().classList.remove('dark-tiles');
        baseLayer.getContainer().classList.add('light-tiles');
    }
});

// Colores para la leyenda y marcadores
const categoryColors = {
    'SORTIDA/ARRIBADA': '#bdbdbd',
    'WC': '#0288D1',
    'DUTXES': '#0288D1',
    'CONTROL': '#A52714',
    'ANIMACIÓ': '#FFEA00',
    'RUTA': '#558B2F',
    'PARKING': '#1A237E',
    'DEFAULT': '#ff2f8b'
};

// Generar leyenda dinámica
const legendContainer = document.getElementById('legend');
const legendItems = [
    { name: 'Sortida / Arribada', color: categoryColors['SORTIDA/ARRIBADA'] },
    { name: 'Ruta Cursa del Serrat', color: categoryColors['RUTA'] },
    { name: 'Punts de Control', color: categoryColors['CONTROL'] },
    { name: 'Serveis (WC/Dutxes)', color: categoryColors['WC'] },
    { name: 'Animació', color: categoryColors['ANIMACIÓ'] },
    { name: 'Pàrquing', color: categoryColors['PARKING'] }
];

legendItems.forEach(item => {
    const div = document.createElement('div');
    div.className = 'legend-item';
    div.innerHTML = `<div class="legend-color" style="background-color: ${item.color}"></div><span>${item.name}</span>`;
    legendContainer.appendChild(div);
});

// Función para obtener color según el nombre
function getMarkerConfig(name) {
    if (!name) return { color: categoryColors['DEFAULT'], icon: 'fa-map-marker-alt' };
    name = name.toUpperCase();
    if (name.includes('SORTIDA') || name.includes('ARRIBADA')) return { color: categoryColors['SORTIDA/ARRIBADA'], icon: 'fa-flag-checkered' };
    if (name.includes('WC') || name.includes('DUTXES')) return { color: categoryColors['WC'], icon: 'fa-restroom' };
    if (name.includes('CONTROL') || name.includes('SERRAT LLOBATER') && !name.includes('BALMA')) return { color: categoryColors['CONTROL'], icon: 'fa-clipboard-check' };
    if (name.includes('ANIMACIÓ') || name.includes('BALMA')) return { color: categoryColors['ANIMACIÓ'], icon: 'fa-music' };
    if (name.includes('PARKING')) return { color: categoryColors['PARKING'], icon: 'fa-parking' };
    return { color: categoryColors['DEFAULT'], icon: 'fa-map-pin' };
}

// Cargar KML
fetch('cursa_serrat.kml')
    .then(response => response.text())
    .then(kmltext => {
        // Parsear XML y convertir a GeoJSON
        const parser = new DOMParser();
        const kml = parser.parseFromString(kmltext, 'text/xml');
        const geojson = toGeoJSON.kml(kml);

        // Añadir GeoJSON al mapa con estilos personalizados
        const routeLayer = L.geoJSON(geojson, {
            style: function (feature) {
                if (feature.geometry.type === 'LineString') {
                    return {
                        color: categoryColors['RUTA'],
                        weight: 6,
                        opacity: 0.8,
                        shadowColor: '#000',
                        shadowBlur: 10
                    };
                }
                if (feature.geometry.type === 'Polygon') {
                    return {
                        color: categoryColors['PARKING'],
                        fillColor: categoryColors['PARKING'],
                        fillOpacity: 0.5,
                        weight: 2
                    };
                }
            },
            pointToLayer: function (feature, latlng) {
                const name = feature.properties.name || '';
                const config = getMarkerConfig(name);

                // Marcador HTML personalizado (estilo gota css)
                const markerHtmlStyles = `
                    background-color: ${config.color};
                `;

                // Animación extra para sortida y arribada
                const extraClass = (name.toUpperCase().includes('SORTIDA') || name.toUpperCase().includes('ARRIBADA')) ? 'pulse' : '';

                const customIcon = L.divIcon({
                    className: 'custom-marker',
                    iconAnchor: [0, 0],
                    popupAnchor: [0, -40],
                    html: `<div class="marker-pin ${extraClass}" style="${markerHtmlStyles}"><i class="fas ${config.icon}"></i></div>`
                });

                return L.marker(latlng, { icon: customIcon });
            },
            onEachFeature: function (feature, layer) {
                if (feature.properties && feature.properties.name) {
                    let popupContent = `<h3>${feature.properties.name}</h3>`;
                    if (feature.properties.description) {
                        popupContent += `<p>${feature.properties.description}</p>`;
                    }
                    layer.bindPopup(popupContent);
                }

                // Hover effect for polygons/lines to highlight them
                layer.on({
                    mouseover: function (e) {
                        const l = e.target;
                        if (l.setStyle) l.setStyle({ weight: 8, opacity: 1 });
                    },
                    mouseout: function (e) {
                        const l = e.target;
                        if (l.setStyle && feature.geometry.type === 'LineString') l.setStyle({ weight: 6, opacity: 0.8 });
                        if (l.setStyle && feature.geometry.type === 'Polygon') l.setStyle({ weight: 2 });
                    }
                });
            }
        }).addTo(map);

        // Ajustar vista del mapa para englobar toda la ruta
        map.fitBounds(routeLayer.getBounds(), { padding: [50, 50] });
    })
    .catch(err => {
        console.error('Error carregant el mapa:', err);
        alert('Hi ha hagut un error carregant les dades de la cursa. Intenta recarregar la pàgina.');
    });
