from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
import requests
from decouple import config

OPENWEATHER_API_KEY = config('OPENWEATHER_API_KEY')
OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5'


@api_view(['GET'])
def get_weather(request):
    """Get current weather for a city"""
    city = request.query_params.get('city')
    unit = request.query_params.get('unit', 'metric')
    
    if not city:
        return Response(
            {'error': 'City name is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        url = f'{OPENWEATHER_BASE_URL}/weather?q={city}&units={unit}&appid={OPENWEATHER_API_KEY}'
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        
        data = response.json()
        
        return Response({
            'city': data.get('name'),
            'country': data.get('sys', {}).get('country'),
            'temperature': data.get('main', {}).get('temp'),
            'feels_like': data.get('main', {}).get('feels_like'),
            'humidity': data.get('main', {}).get('humidity'),
            'pressure': data.get('main', {}).get('pressure'),
            'description': data.get('weather', [{}])[0].get('main'),
            'wind_speed': data.get('wind', {}).get('speed'),
            'cloudiness': data.get('clouds', {}).get('all'),
            'unit': 'Celsius' if unit == 'metric' else 'Fahrenheit',
        }, status=status.HTTP_200_OK)
    
    except requests.exceptions.Timeout:
        return Response({'error': 'Request timeout'}, status=status.HTTP_504_GATEWAY_TIMEOUT)
    except requests.exceptions.HTTPError:
        return Response({'error': 'City not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_forecast(request):
    """Get 5-day weather forecast for a city"""
    city = request.query_params.get('city')
    unit = request.query_params.get('unit', 'metric')
    
    if not city:
        return Response(
            {'error': 'City name is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        url = f'{OPENWEATHER_BASE_URL}/forecast?q={city}&units={unit}&appid={OPENWEATHER_API_KEY}'
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        
        data = response.json()
        
        # Group forecast by day
        daily_forecasts = {}
        
        for item in data.get('list', []):
            date = item['dt_txt'].split(' ')[0]
            
            if date not in daily_forecasts:
                daily_forecasts[date] = {
                    'date': date,
                    'temp_max': item['main']['temp_max'],
                    'temp_min': item['main']['temp_min'],
                    'description': item['weather'][0]['main'],
                    'humidity': item['main']['humidity'],
                    'wind_speed': item['wind']['speed'],
                }
            else:
                daily_forecasts[date]['temp_max'] = max(
                    daily_forecasts[date]['temp_max'],
                    item['main']['temp_max']
                )
                daily_forecasts[date]['temp_min'] = min(
                    daily_forecasts[date]['temp_min'],
                    item['main']['temp_min']
                )
        
        return Response({
            'city': data['city']['name'],
            'country': data['city']['country'],
            'forecast': list(daily_forecasts.values())[:5],
            'unit': 'Celsius' if unit == 'metric' else 'Fahrenheit',
        }, status=status.HTTP_200_OK)
    
    except requests.exceptions.Timeout:
        return Response({'error': 'Request timeout'}, status=status.HTTP_504_GATEWAY_TIMEOUT)
    except requests.exceptions.HTTPError:
        return Response({'error': 'City not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def health_check(request):
    """Health check endpoint"""
    return Response({'status': 'Backend is running'}, status=status.HTTP_200_OK)