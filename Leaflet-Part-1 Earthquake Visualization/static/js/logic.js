// STEP 1: Define the Base Layer

// Adding the tile layer
let street_layer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

let topo_layer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

// STEP 2: Get the Data

fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson')
    .then(response => response.json())
    .then(data => { 
        var myMap = L.map('map').setView([0, 0], 2); // Center the map at [0, 0] with a zoom level of 2 for a global view


        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 
            maxZoom: 19, 
        }).addTo(myMap);
        
        L.geoJSON(data, { 
            pointToLayer: function (feature, latlng) {
                let radius = feature.properties.mag * 3.2;
                let depth = feature.geometry.coordinates[2]; // Depth is the third element in the coordinates array
                let fillColor = getColor(depth);

                // Bind popup with additional earthquake information
                let popupContent = `
                    <b>Location:</b> ${feature.properties.place}<br>
                    <b>Magnitude:</b> ${feature.properties.mag}<br>
                    <b>Depth:</b> ${depth} km<br>
                    <b>Time:</b> ${new Date(feature.properties.time).toLocaleString()}
                `;
                return L.circleMarker(latlng, { 
                    radius: radius, 
                    fillColor: fillColor, 
                    color: '#000', 
                    weight: 1, 
                    opacity: 1, 
                    fillOpacity: 0.8,
                    interactive: true 
                }).bindPopup(popupContent);
            } 
        }).addTo(myMap);

// STEP 3: Define legend
        var legend = L.control({ position: 'bottomright' });

        legend.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'info legend'),
                depths = [0, 10, 30, 50],
                labels = [];

            div.innerHTML += '<h4>Depth</h4>';

// STEP 4: Loop through depth intervals and generate a label with a colored square for each interval
            for (var i = 0; i < depths.length; i++) {
                div.innerHTML +=
                    '<i style="background:' + getColor(depths[i] + 1) + '"></i> ' +
                    depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + ' km<br>' : '+ km');
            }

            return div;
        };

        // Add legend to map
        legend.addTo(myMap);
    })
    .catch(error => console.error('Error fetching GeoJSON data:', error));

// STEP 5: Function to determine marker color based on depth
function getColor(depth) {

    // Define color scale based on the depth values
    if (depth < 10) {
        return 'green';
    } else if (depth < 30) {
        return 'yellow';
    } else if (depth < 50) {
        return 'orange';
    } else {
        return 'red';
    }
};
