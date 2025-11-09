import requests
import numpy as np
from PIL import Image
import io
import base64
from datetime import datetime, timedelta
import json
import time

class RealSatelliteImageProcessor:
    """
    Real Satellite Image Processor
    Fetches and processes actual satellite imagery from free APIs
    """
    
    def __init__(self):
        self.satellite_apis = {
            'sentinel_hub': {
                'base_url': 'https://services.sentinel-hub.com/api/v1',
                'requires_auth': True,
                'description': 'Sentinel-2 high-resolution imagery'
            },
            'nasa_worldview': {
                'base_url': 'https://map1.vis.earthdata.nasa.gov/wmts-geo/1.0.0',
                'requires_auth': False,
                'description': 'NASA MODIS and VIIRS imagery'
            },
            'mapbox_satellite': {
                'base_url': 'https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles',
                'requires_auth': True,
                'description': 'High-resolution satellite tiles'
            },
            'google_earth_engine': {
                'base_url': 'https://earthengine.googleapis.com',
                'requires_auth': True,
                'description': 'Google Earth Engine imagery'
            },
            'usgs_landsat': {
                'base_url': 'https://earthexplorer.usgs.gov/api/json/v1.4.0',
                'requires_auth': True,
                'description': 'Landsat satellite imagery'
            },
            'planet_labs': {
                'base_url': 'https://api.planet.com/data/v1',
                'requires_auth': True,
                'description': 'Planet Labs daily satellite imagery'
            }
        }
        
        # Free satellite image sources (no API key required)
        self.free_sources = {
            'nasa_gibs': {
                'base_url': 'https://map1.vis.earthdata.nasa.gov/wmts-geo/1.0.0',
                'layers': [
                    'MODIS_Terra_CorrectedReflectance_TrueColor',
                    'MODIS_Aqua_CorrectedReflectance_TrueColor',
                    'VIIRS_SNPP_CorrectedReflectance_TrueColor'
                ],
                'format': 'jpg',
                'description': 'NASA GIBS - Global Imagery Browse Services'
            },
            'sentinel_playground': {
                'base_url': 'https://services.sentinel-hub.com/ogc/wms',
                'description': 'Sentinel Hub Playground (limited free access)'
            }
        }
        
        print("SATELLITE: Real Satellite Image Processor Initialized")
        print("Available Free Sources:")
        for source, info in self.free_sources.items():
            print(f"   {source}: {info['description']}")

        # Precomputed tile matrix metadata for NASA GIBS EPSG:4326 WMTS sets.
        # Values sourced from https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/1.0.0/WMTSCapabilities.xml
        self._gibs_tile_matrix_metadata = {
            '250m': {
                0: (2, 1),
                1: (3, 2),
                2: (5, 3),
                3: (10, 5),
                4: (20, 10),
                5: (40, 20),
                6: (80, 40),
                7: (160, 80),
                8: (320, 160),
            },
            '1km': {
                0: (2, 1),
                1: (3, 2),
                2: (5, 3),
                3: (10, 5),
                4: (20, 10),
                5: (40, 20),
                6: (80, 40),
            },
        }
    
    def fetch_real_satellite_image(self, lat, lon, zoom=12, width=512, height=512, source='nasa_gibs'):
        """
        Fetch real satellite image for the specified location
        """
        try:
            if source == 'nasa_gibs':
                return self._fetch_nasa_gibs_image(lat, lon, zoom, width, height)
            elif source == 'sentinel_playground':
                return self._fetch_sentinel_playground_image(lat, lon, width, height)
            else:
                print(f"Source {source} not implemented yet")
                return None
                
        except Exception as e:
            print(f"Error fetching satellite image: {e}")
            return None
    
    def _fetch_nasa_gibs_image(self, lat, lon, zoom, width, height):
        """
        Fetch real satellite image from NASA GIBS
        """
        try:
            # Use NASA GIBS EPSG:4326 tile scheme, clamp zoom to valid range for 250m matrix
            # Supported layers and tile matrices to try
            base_layers = [
                'MODIS_Terra_CorrectedReflectance_TrueColor',
                'MODIS_Aqua_CorrectedReflectance_TrueColor',
                'VIIRS_SNPP_CorrectedReflectance_TrueColor',
            ]
            layers = [self._sanitize_gibs_layer(layer) for layer in base_layers]
            matrices = [
                ('250m', 8),  # (matrix id, max zoom)
                ('1km', 6),
            ]
            base_urls = [
                'https://gibs.earthdata.nasa.gov/wmts/epsg4326/best',
            ]

            # Try multiple dates going back further (satellite imagery has significant delays)
            # Start from 3 days ago and go back up to 60 days to find available imagery
            for days_back in range(3, 61):
                try_date = (datetime.now() - timedelta(days=days_back)).strftime('%Y-%m-%d')

                for layer in layers:
                    layer_id = self._sanitize_gibs_layer(layer)
                    for matrix, max_zoom_for_matrix in matrices:
                        preferred_zoom = min(int(zoom if isinstance(zoom, (int, float)) else max_zoom_for_matrix), max_zoom_for_matrix)
                        preferred_zoom = max(preferred_zoom, 0)

                        for z in range(preferred_zoom, -1, -1):
                            # Calculate tile coordinates using EPSG:4326 scheme
                            tile_coords = self._deg2tile_epsg4326(lat, lon, matrix, z)
                            if tile_coords is None:
                                continue
                            tile_x, tile_y = tile_coords

                            for base in base_urls:
                                url = (
                                    f"{base}/"
                                    f"{layer_id}/default/{try_date}/{matrix}/{z}/{tile_y}/{tile_x}.jpg"
                                )

                                print(f"🛰️ Fetching NASA GIBS image: {url}")

                                try:
                                    response = requests.get(url, timeout=10)  # Reduced timeout from 15 to 10

                                    if response.status_code == 200:
                                        # Convert to PIL Image
                                        image = Image.open(io.BytesIO(response.content))

                                        # Resize to requested dimensions
                                        image = image.resize((width, height))

                                        # Get proper resolution info based on matrix
                                        resolution_info = {
                                            '250m': {'resolution': '250 meters per pixel', 'pixel_size': 250},
                                            '1km': {'resolution': '1 kilometer per pixel', 'pixel_size': 1000}
                                        }.get(matrix, {'resolution': f'{matrix} per pixel', 'pixel_size': 250})
                                        
                                        # Get layer-specific metadata
                                        layer_metadata = {
                                            'MODIS_Terra_CorrectedReflectance_TrueColor': {
                                                'satellite': 'Terra',
                                                'instrument': 'MODIS',
                                                'bands': ['Red', 'Green', 'Blue'],
                                                'description': 'True color corrected reflectance'
                                            },
                                            'MODIS_Aqua_CorrectedReflectance_TrueColor': {
                                                'satellite': 'Aqua', 
                                                'instrument': 'MODIS',
                                                'bands': ['Red', 'Green', 'Blue'],
                                                'description': 'True color corrected reflectance'
                                            },
                                            'VIIRS_SNPP_CorrectedReflectance_TrueColor': {
                                                'satellite': 'Suomi NPP',
                                                'instrument': 'VIIRS',
                                                'bands': ['I01', 'I02', 'I03'],
                                                'description': 'Visible infrared imaging radiometer suite'
                                            }
                                        }.get(layer_id, {
                                            'satellite': layer_id.split('_')[0] if '_' in layer_id else 'Unknown',
                                            'instrument': layer_id.split('_')[1] if '_' in layer_id and len(layer_id.split('_')) > 1 else 'Unknown',
                                            'bands': ['RGB'],
                                            'description': f'{layer_id} imagery'
                                        })

                                        return {
                                            'image': image,
                                            'source': 'nasa_gibs',
                                            'layer': layer_id,
                                            'date': try_date,
                                            'acquisition_date': try_date,
                                            'coordinates': {'lat': lat, 'lon': lon},
                                            'tile_coords': {'x': tile_x, 'y': tile_y, 'z': z},
                                            'matrix': matrix,
                                            'url': url,
                                            'success': True,
                                            'resolution': resolution_info['resolution'],
                                            'pixel_size': resolution_info['pixel_size'],
                                            'satellite': layer_metadata['satellite'],
                                            'instrument': layer_metadata['instrument'],
                                            'bands': layer_metadata['bands'],
                                            'description': layer_metadata['description'],
                                            'provider': 'NASA GIBS',
                                            'format': 'JPEG'
                                        }
                                    else:
                                        # Print first bytes of error body to aid debugging (limit output)
                                        snippet = ''
                                        try:
                                            snippet = response.text[:100]  # Reduced from 200 to 100
                                        except Exception:
                                            pass
                                        
                                        # Only print error for first few attempts to reduce spam
                                        if days_back < 5:
                                            print(f"NASA GIBS attempt date-{days_back} z-{z} {matrix} {layer_id.split('_')[0]}: HTTP {response.status_code}")
                                        
                                        # If the error hints the layer is invalid, abort NASA attempts early
                                        if response.status_code == 400 and isinstance(snippet, str) and (
                                            'LayerNotDefined' in snippet or 'InvalidParameterValue' in snippet or 'Unknown layer' in snippet
                                        ):
                                            print("INFO: NASA GIBS reports layer not defined. Falling back to alternative sources.")
                                            return None
                                        
                                        # If we get too many 404s for recent dates, skip to older dates faster
                                        if response.status_code == 404 and days_back < 10:
                                            break  # Skip to next date faster

                                except requests.exceptions.RequestException as e:
                                    print(f"NASA GIBS network error: {e}")
                                    continue  # Try next URL/attempt

            print("ERROR: Failed to fetch from NASA GIBS after multiple attempts and zoom levels")
            return None
            
        except Exception as e:
            print(f"NASA GIBS fetch error: {e}")
            return None
    
    def _fetch_sentinel_playground_image(self, lat, lon, width, height):
        """
        Fetch image from Sentinel Hub Playground (free tier)
        """
        try:
            # Sentinel Hub WMS request
            bbox = self._get_bbox_from_point(lat, lon, 0.01)  # ~1km box
            
            params = {
                'SERVICE': 'WMS',
                'REQUEST': 'GetMap',
                'LAYERS': 'TRUE_COLOR',
                'STYLES': '',
                'FORMAT': 'image/jpeg',
                'BGCOLOR': '0x000000',
                'TRANSPARENT': 'TRUE',
                'SRS': 'EPSG:4326',
                'BBOX': f"{bbox['west']},{bbox['south']},{bbox['east']},{bbox['north']}",
                'WIDTH': width,
                'HEIGHT': height,
                'TIME': '2023-01-01/2024-12-31'  # Date range
            }
            
            url = "https://services.sentinel-hub.com/ogc/wms/your-instance-id"
            
            # Note: This requires Sentinel Hub instance ID
            print("INFO: Sentinel Hub requires API key setup")
            return None
            
        except Exception as e:
            print(f"Sentinel Hub fetch error: {e}")
            return None
    
    def _deg2tile(self, lat, lon, zoom):
        """
        Convert latitude/longitude to tile coordinates
        """
        lat_rad = np.radians(lat)
        n = 2.0 ** zoom
        x = int((lon + 180.0) / 360.0 * n)
        y = int((1.0 - np.asinh(np.tan(lat_rad)) / np.pi) / 2.0 * n)
        return x, y

    def _deg2tile_epsg4326(self, lat, lon, matrix_id, zoom):
        """
        Convert latitude/longitude to NASA GIBS EPSG:4326 tile coordinates for the given matrix set.
        Tile row 0 is at +90° (north), tile row increases toward -90° (south).
        """
        # Clamp latitude/longitude to valid ranges
        lat = max(min(lat, 90.0), -90.0)
        lon = ((lon + 180.0) % 360.0) - 180.0  # wrap to [-180, 180)

        matrix_info = self._gibs_tile_matrix_metadata.get(matrix_id, {})
        if zoom not in matrix_info:
            return None

        matrix_width, matrix_height = matrix_info[zoom]

        x = int((lon + 180.0) / 360.0 * matrix_width)
        y = int((90.0 - lat) / 180.0 * matrix_height)

        # Clamp to matrix bounds
        x = max(0, min(x, matrix_width - 1))
        y = max(0, min(y, matrix_height - 1))
        return x, y

    def _sanitize_gibs_layer(self, layer: str) -> str:
        """
        Map common misspellings/aliases to valid NASA GIBS layer identifiers.
        Prevents issues like 'CorrecteddReflectance' causing 400s.
        """
        if not isinstance(layer, str):
            return 'MODIS_Terra_CorrectedReflectance_TrueColor'
        mapping = {
            'MODIS_Terra_CorrecteddReflectance_TrueColor': 'MODIS_Terra_CorrectedReflectance_TrueColor',
            'MODIS_Aqua_CorrecteddReflectance_TrueColor': 'MODIS_Aqua_CorrectedReflectance_TrueColor',
            'VIIRS_SNPP_CorrecteddReflectance_TrueColor': 'VIIRS_SNPP_CorrectedReflectance_TrueColor',
        }
        # Exact mapping
        if layer in mapping:
            return mapping[layer]
        # Heuristic fix for double-d typos
        return layer.replace('CorrecteddReflectance', 'CorrectedReflectance')
    
    def _get_bbox_from_point(self, lat, lon, delta):
        """
        Get bounding box around a point
        """
        return {
            'west': lon - delta,
            'east': lon + delta,
            'south': lat - delta,
            'north': lat + delta
        }
    
    def fetch_multiple_satellite_sources(self, lat, lon):
        """
        Try to fetch satellite images from multiple sources
        """
        results = {}
        
        # Try NASA GIBS first (most reliable free source)
        print("🛰️ Attempting NASA GIBS...")
        nasa_result = self.fetch_real_satellite_image(lat, lon, source='nasa_gibs')
        if nasa_result and nasa_result['success']:
            results['nasa_gibs'] = nasa_result
            print("✅ NASA GIBS: Success")
        else:
            print("ERROR: NASA GIBS: Failed")
        
        # Could add more sources here
        
        return results
    
    def preprocess_satellite_image_for_cnn(self, image_data):
        """
        Preprocess real satellite image for CNN analysis
        """
        if not image_data or not image_data.get('success'):
            return None
        
        try:
            image = image_data['image']
            
            # Ensure RGB format
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Resize to CNN input size (224x224)
            image = image.resize((224, 224))
            
            # Convert to numpy array and normalize
            image_array = np.array(image) / 255.0
            
            # Add batch dimension
            image_array = np.expand_dims(image_array, axis=0)
            
            return {
                'processed_image': image_array,
                'original_info': image_data,
                'preprocessing_applied': [
                    'RGB conversion',
                    'Resize to 224x224',
                    'Normalization (0-1)',
                    'Batch dimension added'
                ]
            }
            
        except Exception as e:
            print(f"Image preprocessing error: {e}")
            return None

class EnhancedRealSatelliteImageProcessor:
    """
    Enhanced processor with more sophisticated satellite data access
    """
    
    def __init__(self):
        self.base_processor = RealSatelliteImageProcessor()
        self.alternative_sources = {
            'esri_world_imagery': {
                'url_template': 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                'description': 'ESRI World Imagery (free)'
            },
            'bing_aerial': {
                'url_template': 'https://ecn.t0.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=1',
                'description': 'Bing Aerial Imagery'
            }
        }
    
    def fetch_esri_world_imagery(self, lat, lon, zoom=15):
        """
        Fetch from ESRI World Imagery service (free)
        """
        try:
            tile_x, tile_y = self.base_processor._deg2tile(lat, lon, zoom)
            
            url = f"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{zoom}/{tile_y}/{tile_x}"
            
            print(f"🛰️ Fetching ESRI World Imagery: {url}")
            
            response = requests.get(url, timeout=15)
            
            if response.status_code == 200:
                image = Image.open(io.BytesIO(response.content))
                
                return {
                    'image': image,
                    'source': 'esri_world_imagery',
                    'coordinates': {'lat': lat, 'lon': lon},
                    'tile_coords': {'x': tile_x, 'y': tile_y, 'z': zoom},
                    'url': url,
                    'success': True
                }
            else:
                print(f"ESRI fetch failed: HTTP {response.status_code}")
                return None
                
        except Exception as e:
            print(f"ESRI fetch error: {e}")
            return None
    
    def get_best_available_satellite_image(self, lat, lon):
        """
        Try multiple sources to get the best available satellite image
        """
        print(f"🛰️ Fetching real satellite imagery for {lat:.3f}, {lon:.3f}")
        
        # Try NASA GIBS first (but with timeout to avoid long waits)
        print("🛰️ Trying NASA GIBS...")
        nasa_result = self.base_processor.fetch_real_satellite_image(lat, lon, source='nasa_gibs')
        if nasa_result and nasa_result.get('success'):
            print("✅ Got real satellite image from NASA GIBS")
            return nasa_result
        
        print("🛰️ NASA GIBS failed, trying ESRI World Imagery...")
        # Try ESRI World Imagery as fallback
        esri_result = self.fetch_esri_world_imagery(lat, lon)
        if esri_result and esri_result.get('success'):
            print("✅ Got real satellite image from ESRI World Imagery")
            return esri_result
        
        print("🛰️ ESRI failed, trying multiple zoom levels for ESRI...")
        # Try ESRI with different zoom levels
        for zoom in [14, 13, 12, 11, 10]:
            esri_result = self.fetch_esri_world_imagery(lat, lon, zoom=zoom)
            if esri_result and esri_result.get('success'):
                print(f"✅ Got real satellite image from ESRI World Imagery (zoom {zoom})")
                return esri_result
        
        print("❌ Failed to fetch real satellite imagery from all sources")
        return None

# Test function for real satellite images
def test_real_satellite_images():
    """Test real satellite image fetching"""
    print("🛰️ Testing Real Satellite Image Fetching")
    print("=" * 60)
    
    # Initialize processor
    processor = EnhancedRealSatelliteImageProcessor()
    
    # Test locations
    test_locations = [
        {"name": "Amazon Rainforest", "lat": -3.4653, "lon": -62.2159},
        {"name": "New York City", "lat": 40.7128, "lon": -74.0060},
        {"name": "Sahara Desert", "lat": 23.8, "lon": 11.0}
    ]
    
    for location in test_locations:
        print(f"\n📍 Testing {location['name']}")
        
        # Try to fetch real satellite image
        image_result = processor.get_best_available_satellite_image(
            location['lat'], 
            location['lon']
        )
        
        if image_result and image_result.get('success'):
            print(f"✅ Successfully fetched satellite image")
            print(f"   Source: {image_result['source']}")
            print(f"   Image size: {image_result['image'].size}")
            print(f"   URL: {image_result['url'][:80]}...")
            
            # Test preprocessing for CNN
            preprocessed = processor.base_processor.preprocess_satellite_image_for_cnn(image_result)
            if preprocessed:
                print(f"   ✅ Preprocessed for CNN: {preprocessed['processed_image'].shape}")
                print(f"   Applied: {', '.join(preprocessed['preprocessing_applied'])}")
            
        else:
            print(f"ERROR: Failed to fetch satellite image")

if __name__ == "__main__":
    test_real_satellite_images()