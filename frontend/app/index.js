/*
WEATHER APP - REACT NATIVE FRONTEND
This is the main app component using Expo

Setup Instructions:
1. npx create-expo-app weather-app-frontend
2. cd weather-app-frontend
3. npm install axios
4. Replace App.js with this code
5. npx expo start
6. Press 'i' for iOS or 'a' for Android simulator
*/

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import axios from 'axios';

// Update this to your backend URL
// For local testing: http://192.168.x.x:8000 (use your computer's IP)
// For production: your deployed Django URL
const BACKEND_URL = 'http://192.168.1.69:8000'; // Change this to your PC's IP

const API = axios.create({
  baseURL: BACKEND_URL,
  timeout: 10000,
});

export default function App() {
  const [city, setCity] = useState('London');
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [unit, setUnit] = useState('metric'); // 'metric' for C, 'imperial' for F
  const [error, setError] = useState(null);

  // Fetch weather on app load
  useEffect(() => {
    fetchWeather('London');
  }, []);

  const fetchWeather = async (cityName) => {
    setLoading(true);
    setError(null);
    try {
      const [weatherRes, forecastRes] = await Promise.all([
        API.get('/api/weather/', {
          params: { city: cityName, unit },
        }),
        API.get('/api/forecast/', {
          params: { city: cityName, unit },
        }),
      ]);

      setCurrentWeather(weatherRes.data);
      setForecast(forecastRes.data);
      setCity(cityName);
    } catch (err) {
      let errorMessage = 'Failed to fetch weather';
      
      if (err.response?.status === 404) {
        errorMessage = 'City not found. Please try another.';
      } else if (err.response?.status === 504) {
        errorMessage = 'Request timeout. Try again.';
      } else if (err.code === 'ECONNREFUSED') {
        errorMessage = 'Cannot connect to backend. Is Django running?';
      } else if (err.message === 'Network Error') {
        errorMessage = 'Network error. Check your connection & backend URL.';
      }
      
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleUnit = () => {
    const newUnit = unit === 'metric' ? 'imperial' : 'metric';
    setUnit(newUnit);
    if (city) {
      fetchWeather(city);
    }
  };

  const handleSearch = () => {
    if (city.trim()) {
      fetchWeather(city.trim());
    } else {
      Alert.alert('Error', 'Please enter a city name');
    }
  };

  const getWeatherIcon = (description) => {
    const desc = description?.toLowerCase() || '';
    if (desc.includes('cloud')) return '☁️';
    if (desc.includes('rain')) return '🌧️';
    if (desc.includes('clear') || desc.includes('sunny')) return '☀️';
    if (desc.includes('snow')) return '❄️';
    if (desc.includes('storm') || desc.includes('thunder')) return '⛈️';
    if (desc.includes('mist') || desc.includes('fog')) return '🌫️';
    if (desc.includes('wind')) return '💨';
    return '🌤️';
  };

  const unitSymbol = unit === 'metric' ? '°C' : '°F';
  const speedUnit = unit === 'metric' ? 'km/h' : 'mph';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🌦️ Weather App</Text>
        <TouchableOpacity
          style={styles.unitButton}
          onPress={toggleUnit}
        >
          <Text style={styles.unitButtonText}>
            {unit === 'metric' ? '°C' : '°F'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Enter city name..."
            placeholderTextColor="#999"
            value={city}
            onChangeText={setCity}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearch}
            disabled={loading}
          >
            <Text style={styles.searchButtonText}>
              {loading ? '...' : '🔍'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Error Display */}
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}

        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A90E2" />
            <Text style={styles.loadingText}>Fetching weather...</Text>
          </View>
        )}

        {/* Current Weather Card */}
        {currentWeather && !loading && (
          <View style={styles.currentWeatherCard}>
            <View style={styles.locationRow}>
              <Text style={styles.locationText}>
                {currentWeather.city}, {currentWeather.country}
              </Text>
            </View>

            <View style={styles.temperatureRow}>
              <Text style={styles.weatherIcon}>
                {getWeatherIcon(currentWeather.description)}
              </Text>
              <View style={styles.temperatureColumn}>
                <Text style={styles.temperature}>
                  {Math.round(currentWeather.temperature)}{unitSymbol}
                </Text>
                <Text style={styles.description}>
                  {currentWeather.description}
                </Text>
              </View>
            </View>

            <Text style={styles.feelsLike}>
              Feels like {Math.round(currentWeather.feels_like)}{unitSymbol}
            </Text>

            {/* Weather Details Grid */}
            <View style={styles.detailsGrid}>
              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>Humidity</Text>
                <Text style={styles.detailValue}>
                  {currentWeather.humidity}%
                </Text>
              </View>
              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>Wind Speed</Text>
                <Text style={styles.detailValue}>
                  {currentWeather.wind_speed.toFixed(1)} {speedUnit}
                </Text>
              </View>
              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>Pressure</Text>
                <Text style={styles.detailValue}>
                  {currentWeather.pressure} hPa
                </Text>
              </View>
              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>Cloudiness</Text>
                <Text style={styles.detailValue}>
                  {currentWeather.cloudiness}%
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* 5-Day Forecast */}
        {forecast && !loading && (
          <View style={styles.forecastSection}>
            <Text style={styles.forecastTitle}>5-Day Forecast</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.forecastList}
            >
              {forecast.forecast && forecast.forecast.map((day, index) => (
                <View key={index} style={styles.forecastCard}>
                  <Text style={styles.forecastDate}>{day.date}</Text>
                  <Text style={styles.forecastIcon}>
                    {getWeatherIcon(day.description)}
                  </Text>
                  <Text style={styles.forecastTemp}>
                    {Math.round(day.temp_max)}{unitSymbol}
                  </Text>
                  <Text style={styles.forecastTempMin}>
                    {Math.round(day.temp_min)}{unitSymbol}
                  </Text>
                  <Text style={styles.forecastDesc}>{day.description}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Initial State - Show when no data */}
        {!currentWeather && !loading && !error && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🌍</Text>
            <Text style={styles.emptyStateText}>
              Search for a city to see the weather
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Powered by OpenWeatherMap
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F2027',
  },
  header: {
    backgroundColor: '#203A43',
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#4A90E2',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  unitButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  unitButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#2C5282',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  searchButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    fontSize: 20,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
  errorBox: {
    backgroundColor: '#C53030',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  currentWeatherCard: {
    backgroundColor: '#203A43',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  locationRow: {
    marginBottom: 12,
  },
  locationText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  temperatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  weatherIcon: {
    fontSize: 60,
    marginRight: 16,
  },
  temperatureColumn: {
    flex: 1,
  },
  temperature: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  description: {
    fontSize: 16,
    color: '#B0BEC5',
    marginTop: 4,
  },
  feelsLike: {
    fontSize: 14,
    color: '#90CAF9',
    marginBottom: 16,
    marginLeft: 76,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailBox: {
    flex: 0.48,
    backgroundColor: '#0F2027',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  detailLabel: {
    fontSize: 12,
    color: '#90CAF9',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  forecastSection: {
    marginBottom: 20,
  },
  forecastTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  forecastList: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  forecastCard: {
    backgroundColor: '#203A43',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 100,
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  forecastDate: {
    fontSize: 12,
    color: '#90CAF9',
    marginBottom: 8,
  },
  forecastIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  forecastTemp: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  forecastTempMin: {
    fontSize: 12,
    color: '#90CAF9',
    marginTop: 2,
  },
  forecastDesc: {
    fontSize: 11,
    color: '#B0BEC5',
    marginTop: 4,
    textAlign: 'center',
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#90CAF9',
    textAlign: 'center',
  },
  footer: {
    backgroundColor: '#203A43',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#4A90E2',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#90CAF9',
  },
});