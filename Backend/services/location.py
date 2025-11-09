import requests
import logging
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

class LocationService:
    """
    Free Location Service using OpenStreetMap Nominatim
    Converts coordinates to city names and addresses
    """
    
    def __init__(self):
        # Using free OpenStreetMap Nominatim service
        self.base_url = "https://nominatim.openstreetmap.org"
        self.headers = {
            'User-Agent': 'AIVA-Environmental-AI/1.0 (https://github.com/your-repo)'
        }
    
    def get_location_name(self, lat: float, lon: float) -> Dict[str, Any]:
        """
        Get location name from coordinates using reverse geocoding
        """
        try:
            # Use Nominatim reverse geocoding API
            url = f"{self.base_url}/reverse"
            params = {
                'lat': lat,
                'lon': lon,
                'format': 'json',
                'addressdetails': 1,
                'zoom': 10  # City level
            }
            
            response = requests.get(url, params=params, headers=self.headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                # Extract location information
                display_name = data.get('display_name', '')
                address = data.get('address', {})
                
                # Build location name with priority: city > town > village > county
                location_parts = []
                
                # Add city/town/village
                city = (address.get('city') or 
                       address.get('town') or 
                       address.get('village') or 
                       address.get('municipality') or
                       address.get('county'))
                
                if city:
                    location_parts.append(city)
                
                # Add state/region
                state = (address.get('state') or 
                        address.get('region') or 
                        address.get('province'))
                
                if state and state != city:
                    location_parts.append(state)
                
                # Add country
                country = address.get('country')
                if country and len(location_parts) < 2:
                    location_parts.append(country)
                
                # Create formatted name
                location_name = ', '.join(location_parts) if location_parts else f"{lat:.3f}, {lon:.3f}"
                
                return {
                    'success': True,
                    'name': location_name,
                    'full_address': display_name,
                    'coordinates': f"{lat:.3f}, {lon:.3f}",
                    'details': {
                        'city': address.get('city'),
                        'town': address.get('town'),
                        'village': address.get('village'),
                        'state': address.get('state'),
                        'country': address.get('country'),
                        'postcode': address.get('postcode')
                    }
                }
            else:
                logger.warning(f"Location service error: HTTP {response.status_code}")
                return self._fallback_location(lat, lon)
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Location service network error: {e}")
            return self._fallback_location(lat, lon)
        except Exception as e:
            logger.error(f"Location service error: {e}")
            return self._fallback_location(lat, lon)
    
    def _fallback_location(self, lat: float, lon: float) -> Dict[str, Any]:
        """
        Fallback when location service fails
        """
        return {
            'success': False,
            'name': f"{lat:.3f}, {lon:.3f}",
            'full_address': f"Location at {lat:.3f}, {lon:.3f}",
            'coordinates': f"{lat:.3f}, {lon:.3f}",
            'details': {}
        }
    
    def format_location_for_display(self, lat: float, lon: float) -> str:
        """
        Get formatted location name for display
        """
        location_info = self.get_location_name(lat, lon)
        return location_info['name']
    
    def get_location_context_for_ai(self, lat: float, lon: float) -> str:
        """
        Get location context for AI responses
        """
        location_info = self.get_location_name(lat, lon)
        
        if location_info['success']:
            context = f"Location: {location_info['name']} ({location_info['coordinates']})"
            if location_info['details'].get('country'):
                context += f" in {location_info['details']['country']}"
        else:
            context = f"Location: {location_info['coordinates']}"
        
        return context

# Test function
def test_location_service():
    """Test the location service with sample coordinates"""
    service = LocationService()
    
    test_locations = [
        (12.969, 77.723, "Bangalore, India"),
        (40.7128, -74.0060, "New York City, USA"),
        (51.5074, -0.1278, "London, UK"),
        (28.6139, 77.2090, "New Delhi, India")
    ]
    
    print("🌍 Testing Location Service")
    print("=" * 50)
    
    for lat, lon, expected in test_locations:
        print(f"\n📍 Testing: {lat}, {lon} (Expected: {expected})")
        result = service.get_location_name(lat, lon)
        
        print(f"   Result: {result['name']}")
        print(f"   Full: {result['full_address'][:80]}...")
        print(f"   Success: {result['success']}")

if __name__ == "__main__":
    test_location_service()