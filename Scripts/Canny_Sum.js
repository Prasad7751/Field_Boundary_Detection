var roi = 
    /* color: #d63000 */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[-121.5028430008989, 38.20498341667302],
          [-121.5028430008989, 38.16760873251632],
          [-121.4446497941118, 38.16760873251632],
          [-121.4446497941118, 38.20498341667302]]], null, false);

// IDENTIFY Field Boundry WITH SENTINEL-2(10m resolution)
Map.addLayer(image, {}, 'Canny')

// Function to mask cloud from built-in quality band
// information on cloud
var maskcloud1 = function(image) {
var QA60 = image.select(['QA60']);
return image.updateMask(QA60.lt(1));
};

// Create image collection of S-2 imagery    
var S2_may = ee.ImageCollection('COPERNICUS/S2')
               .filterDate('2020-05-01', '2020-05-31')
                          .filterBounds(roi)
                          .map(function(image){return image.clip(roi)})
                          .map(maskcloud1)
                          .select('B2', 'B3','B4','B8','B11')
                          .median();
                          
print(S2_may)

var S2_june = ee.ImageCollection('COPERNICUS/S2')
               .filterDate('2020-06-01', '2020-06-30')
                          .filterBounds(roi)
                          .map(function(image){return image.clip(roi)})
                          .map(maskcloud1)
                          .select('B2', 'B3','B4','B8','B11')
                          .median();
var S2_july = ee.ImageCollection('COPERNICUS/S2')
               .filterDate('2020-07-01', '2020-07-31')
                          .filterBounds(roi)
                          .map(function(image){return image.clip(roi)})
                          .map(maskcloud1)
                          .select('B2', 'B3','B4','B8','B11')
                          .median();                         
                          
var S2_august = ee.ImageCollection('COPERNICUS/S2')
               .filterDate('2020-08-01', '2020-08-31')
                          .filterBounds(roi)
                          .map(function(image){return image.clip(roi)})
                          .map(maskcloud1)
                          .select('B2', 'B3','B4','B8','B11')
                          .median();  
                          
var S2_september = ee.ImageCollection('COPERNICUS/S2')
               .filterDate('2020-09-01', '2020-09-30')
                          .filterBounds(roi)
                          .map(function(image){return image.clip(roi)})
                          .map(maskcloud1)
                          .select('B2', 'B3','B4','B8','B11')
                          .median();  
                                                    
// Vizualizations map
Map.centerObject(roi,10);

var viz = {min:0,max:0.3,bands:"B4, B3, B2"};
var imageVisParam = {"opacity":1,"bands":["B11","B8","B4"],"min":334.5,"max":4680.5,"gamma":1}

Map.addLayer(S2_may,imageVisParam,"May");
Map.addLayer(S2_june,imageVisParam,"June");
Map.addLayer(S2_july,imageVisParam,"July");
Map.addLayer(S2_august,imageVisParam,"August");
Map.addLayer(S2_september,imageVisParam,"September");

//Calculation NDWI for every month and define visualization parameters and display.
var ndwi_may = S2_may.normalizedDifference(['B3', 'B8']).rename('NDWI');
var ndwi_june = S2_june.normalizedDifference(['B3', 'B8']).rename('NDWI');
var ndwi_july = S2_july.normalizedDifference(['B3', 'B8']).rename('NDWI');
var ndwi_august = S2_august.normalizedDifference(['B3', 'B8']).rename('NDWI');
var ndwi_september = S2_september.normalizedDifference(['B3', 'B8']).rename('NDWI');

//Set Vizualization for NDWI
var colors = ['white','black'];

Map.addLayer(ndwi_may, {palette: colors}, 'NDWI_MAY');
Map.addLayer(ndwi_june, {palette: colors}, 'NDWI_JUNE');
Map.addLayer(ndwi_july, {palette: colors}, 'NDWI_JULY');
Map.addLayer(ndwi_august, {palette: colors}, 'NDWI_AUGUST');
Map.addLayer(ndwi_september, {palette: colors}, 'NDWI_SEPTEMBER');

var image_com = ee.ImageCollection([ndwi_may, ndwi_june, ndwi_july, ndwi_august, ndwi_september]);
var ndwi = image_com.sum();

// Perform Canny edge detection and display the result.
var canny_may = ee.Algorithms.CannyEdgeDetector({
  image: ndwi_may, threshold: 0.1, sigma: 1
});
Map.addLayer(canny_may, {}, 'canny_may');

var canny_june = ee.Algorithms.CannyEdgeDetector({
  image: ndwi_june, threshold: 0.1, sigma: 1
});
Map.addLayer(canny_june, {}, 'canny_june');

var canny_july = ee.Algorithms.CannyEdgeDetector({
  image: ndwi_july, threshold: 0.1, sigma: 1
});
Map.addLayer(canny_july, {}, 'canny_july');

var canny_august = ee.Algorithms.CannyEdgeDetector({
  image: ndwi_august, threshold: 0.1, sigma: 1
});
Map.addLayer(canny_august, {}, 'canny_august');

var canny_september = ee.Algorithms.CannyEdgeDetector({
  image: ndwi_september, threshold: 0.1, sigma: 1
});
Map.addLayer(canny_september, {}, 'canny_september');

// Perform Aggregation for canny images

var image_comb = ee.ImageCollection([canny_may, canny_june,canny_july,canny_august, canny_september]);
print(image_comb);

// Compute a sum image and display.
var cannyOverlay = image_comb.sum();
print(cannyOverlay);

Map.addLayer(cannyOverlay.clip(roi), {}, 'cannyOverlay_SUM');


//EXPORT IMAGE into DRIVE
Export.image.toDrive({
  image: ndwi.clip(roi).select('NDWI'),
  description: 'NDWI_SUM',
  scale: 10,
  region: roi,
  maxPixels: 1e13,
  crs:'EPSG:4326'
});


//EXPORT IMAGE into DRIVE
Export.image.toDrive({
  image: cannyOverlay.clip(roi),
  description: 'Canny_Edge_Sum',
  scale: 10,
  region: roi,
  maxPixels: 1e13,
  crs:'EPSG:4326'
});