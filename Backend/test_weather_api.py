import requests
import json

def test_weather_endpoint():
    """Test the new weather endpoint"""
    
    # Test data
    test_locations = [
        {"name": "New York", "lat": 40.7128, "lon": -74.0060},
        {"name": "London", "lat": 51.5074, "lon": -0.1278},
        {"name": "Mumbai", "lat": 19.0760, "lon": 72.8777}
    ]
    
    print("🌤️ Testing Weather API Endpoint")
    print("=" * 50)
    
    for location in test_locations:
        print(f"\n📍 Testing {location['name']} ({location['lat']}, {location['lon']})")
        
        try:
            response = requests.post(
                'http://localhost:5000/weather',
                json={
                    'latitude': location['lat'],
                    'longitude': location['lon']
                },
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                weather = data['weather']
                
                print(f"✅ Weather data received:")
                print(f"   Temperature: {weather['temperature']}°C")
                print(f"   Humidity: {weather.get('humidity', 'N/A')}%")
                print(f"   Wind Speed: {weather['wind_speed']} km/h")
                print(f"   Wind Direction: {weather['wind_direction']}°")
                print(f"   Precipitation: {weather['precipitation']} mm")
                print(f"   Min/Max: {weather['temp_min']}°C / {weather['temp_max']}°C")
                print(f"   Comfort: {weather.get('comfort_index', 'N/A')}")
                print(f"   UV Risk: {weather.get('uv_risk', 'N/A')}")
                print(f"   Source: {weather['source']}")
                
            else:
                print(f"❌ Error {response.status_code}: {response.text}")
                
        except requests.exceptions.ConnectionError:
            print("❌ Cannot connect to backend. Make sure Flask server is running on port 5000")
            break
        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_weather_endpoint()