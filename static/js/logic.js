function yEqualsMXPlusB(maxY, minY, maxX, minX, x) {
    var y = +((((maxY - minY)/(maxX - minX))*x) + (minY - (minX*((maxY - minY)/(maxX - minX)))));
    return y;
};

function RGBToHex(r,g,b) {
    r = r.toString(16);
    g = g.toString(16);
    b = b.toString(16);
  
    if (r.length == 1)
      r = "0" + r;
    if (g.length == 1)
      g = "0" + g;
    if (b.length == 1)
      b = "0" + b;
  
    return "#" + r + g + b;
};

var zoomLevel = 4;

var myMap = L.map("map", {
    // center: [15.5994, -28.6731], given
    // center: [36.7783, -119.4179], center of california
    center: [36.8283, -98.5795],
    zoom: 5
});

function mercator(latitude) {

    // Convert latitude to radians
    var latitudeRadians = Math.abs(latitude) * (Math.PI/180);

    // Set up "Constants"
    m1 = 111132.92;		// latitude calculation term 1
    m2 = -559.82;		// latitude calculation term 2
    m3 = 1.175;			// latitude calculation term 3
    m4 = -0.0023;		// latitude calculation term 4
    p1 = 111412.84;		// longitude calculation term 1
    p2 = -93.5;			// longitude calculation term 2
    p3 = 0.118;			// longitude calculation term 3

    // Calculate the length of a degree of latitude and longitude in meters
    // latlen = m1 + (m2 * Math.cos(2 * lat)) + (m3 * Math.cos(4 * lat)) +
    //         (m4 * Math.cos(6 * lat));
    longlen = (p1 * Math.cos(latitudeRadians)) + (p2 * Math.cos(3 * latitudeRadians)) + (p3 * Math.cos(5 * latitudeRadians));
    return longlen;
};



function metersPerPixel(latitude, zoomLevel) {
    var earthCircumference = +40075017;
    var latitudeRadians = +latitude * (Math.PI/180);
    var metersPerPixel = earthCircumference * Math.cos(latitudeRadians) / Math.pow(2, zoomLevel + 8);
    return metersPerPixel;
};

function pixelValue(meters, latitude, zoomLevel) {
    return meters / metersPerPixel(latitude, zoomLevel);
};
  
L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/light-v10",
    accessToken: "pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw"
}).addTo(myMap);

var geoData = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

var geojson;

d3.json(geoData, function(geodata) {

    console.log(geodata);
    console.log(geodata.features.length);
    console.log(geodata.features[0]);
    console.log([geodata.features[0].geometry.coordinates[0],geodata.features[0].geometry.coordinates[1]]);
    console.log(geodata.features[0].geometry.coordinates[2]);
    console.log(geodata.features[0].properties.mag);

    var count = +geodata.features.length;

    var magnitude_array = [];

    for (let f = 0; f < count; f++) {
        magnitude_array.push(geodata.features[f].properties.mag)
    };

    var min_magnitude = Math.min.apply(null, magnitude_array);
    console.log("minMag;", min_magnitude);
    var max_magnitude = Math.max.apply(null, magnitude_array);
    console.log("maxMag", max_magnitude);

    var depth_array = [];

    for (let f = 0; f < count; f++) {
        depth_array.push(geodata.features[f].geometry.coordinates[2])
    };

    var min_depth = Math.min.apply(null, depth_array);
    console.log("minDepth", min_depth);
    var max_depth = Math.max.apply(null, depth_array);
    console.log("maxDepth", max_depth);

    for (let f = 0; f < count; f++) {
        
        var radius, r, g, b;

        if (geodata.features[f].properties.mag < 1) {
            depth = Math.round((yEqualsMXPlusB(127, 0, max_depth - min_depth, min_depth - min_depth, geodata.features[f].geometry.coordinates[2] - min_depth)));
            radius = Math.round(yEqualsMXPlusB(250000, 1000, max_magnitude, min_magnitude, geodata.features[f].properties.mag) / pixelValue(yEqualsMXPlusB(250000, 1000, 9, min_magnitude, geodata.features[f].properties.mag), Math.abs(geodata.features[f].geometry.coordinates[1]), zoomLevel));
            console.log(geodata.features[f].geometry.coordinates[1]);
            r = 0;
            g = 255 - depth;
            b = 0;
            console.log("r & g:", r, g);
            console.log("depth: ", depth);
            console.log(r, g, b);
            L.circle([geodata.features[f].geometry.coordinates[1], geodata.features[f].geometry.coordinates[0]], {
                color: RGBToHex(0,0,0),
                fillColor: RGBToHex(r,g,b),
                fillOpacity: 1,
                radius: radius,
                weight: 1
            }).addTo(myMap);
        } else if (geodata.features[f].properties.mag >= 1 && geodata.features[f].properties.mag < 5) {
            depth = Math.round((yEqualsMXPlusB(127, 0, max_depth - min_depth, min_depth - min_depth, geodata.features[f].geometry.coordinates[2] - min_depth)));
            radius = Math.round(yEqualsMXPlusB(250000, 1000, max_magnitude - min_magnitude, min_magnitude - min_magnitude, geodata.features[f].properties.mag - min_magnitude) / pixelValue(yEqualsMXPlusB(250000, 1000, 9, min_magnitude, geodata.features[f].properties.mag), Math.abs(geodata.features[f].geometry.coordinates[1]), zoomLevel)) * geodata.features[f].properties.mag;
            console.log(geodata.features[f].geometry.coordinates[1]);
            r = Math.round(yEqualsMXPlusB(255, depth, 5, 1, geodata.features[f].properties.mag)) - depth;
            g = 255 - depth;
            b = 0;
            console.log("r & g:", r, g);
            console.log("depth: ", depth);
            console.log(r, g, b);
            L.circle([geodata.features[f].geometry.coordinates[1], geodata.features[f].geometry.coordinates[0]], {
                color: RGBToHex(0,0,0),
                fillColor: RGBToHex(r,g,b),
                fillOpacity: 1,
                radius: radius,
                weight: 1
            }).addTo(myMap);
        } else if (geodata.features[f].properties.mag == 5) {
            depth = Math.round((yEqualsMXPlusB(127, 0, max_depth - min_depth, min_depth - min_depth, geodata.features[f].geometry.coordinates[2] - min_depth)));
            radius = Math.round(yEqualsMXPlusB(250000, 1000, max_magnitude, min_magnitude, geodata.features[f].properties.mag) / pixelValue(yEqualsMXPlusB(250000, 1000, 9, min_magnitude, geodata.features[f].properties.mag), Math.abs(geodata.features[f].geometry.coordinates[1]), zoomLevel)) * geodata.features[f].properties.mag;
            console.log(geodata.features[f].geometry.coordinates[1]);
            r = 255 - depth;
            g = 255 - depth;
            b = 0;
            console.log("r & g:", r, g);
            console.log("depth: ", depth);
            console.log(r, g, b);
            L.circle([geodata.features[f].geometry.coordinates[1], geodata.features[f].geometry.coordinates[0]], {
                color: RGBToHex(0,0,0),
                fillColor: RGBToHex(r,g,b),
                fillOpacity: 1,
                radius: radius,
                weight: 1
            }).addTo(myMap);
        } else if (geodata.features[f].properties.mag > 5 && geodata.features[f].properties.mag <= 9) {
            depth = Math.round((yEqualsMXPlusB(127, 0, max_depth - min_depth, min_depth - min_depth, geodata.features[f].geometry.coordinates[2] - min_depth)));
            radius = Math.round(yEqualsMXPlusB(250000, 1000, max_magnitude, min_magnitude, geodata.features[f].properties.mag) / pixelValue(yEqualsMXPlusB(250000, 1000, 9, min_magnitude, geodata.features[f].properties.mag), Math.abs(geodata.features[f].geometry.coordinates[1]), zoomLevel)) * geodata.features[f].properties.mag;
            console.log(geodata.features[f].geometry.coordinates[1]);
            r = 255 - depth;
            g = Math.round(yEqualsMXPlusB(depth, 255, max_magnitude, 5, geodata.features[f].properties.mag)) - depth;
            b = 0;
            console.log("r & g:", r, g);
            console.log("depth: ", depth);
            console.log(r, g, b);
            L.circle([geodata.features[f].geometry.coordinates[1], geodata.features[f].geometry.coordinates[0]], {
                color: RGBToHex(0,0,0),
                fillColor: RGBToHex(r,g,b),
                fillOpacity: 1,
                radius: radius,
                weight: 1
            }).addTo(myMap);
        }
        else if (geodata.features[f].properties.mag > 9) {
            depth = Math.round((yEqualsMXPlusB(127, 0, max_depth - min_depth, min_depth - min_depth, geodata.features[f].geometry.coordinates[2] - min_depth)));
            radius = Math.round(yEqualsMXPlusB(250000, 1000, max_magnitude, min_magnitude, geodata.features[f].properties.mag) / pixelValue(yEqualsMXPlusB(250000, 1000, 9, min_magnitude, geodata.features[f].properties.mag), Math.abs(geodata.features[f].geometry.coordinates[1]), zoomLevel)) * geodata.features[f].properties.mag;
            r = 255 - depth;
            g = 0;
            b = 0;
            console.log(geodata.features[f].properties.mag);
            console.log("depth: ", depth);
            console.log(r, g, b);
            L.circle([geodata.features[f].geometry.coordinates[1], geodata.features[f].geometry.coordinates[0]], {
                color: RGBToHex(0,0,0),
                fillColor: RGBToHex(r,g,b),
                fillOpacity: 1,
                radius: radius,
                weight: 1
            }).addTo(myMap);
        }
    };
});

