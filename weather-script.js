// ============================================
// WEATHER DASHBOARD JAVASCRIPT
// ============================================

// API Configuration
const API_KEY = 'your_api_key_here'; // Get from https://openweathermap.org/api
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_API_URL = 'https://api.openweathermap.org/geo/1.0';

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const unitToggle = document.getElementById('unitToggle');

const loading = document.getElementById('loading');
const error = document.getElementById('error');
const errorMessage = document.getElementById('errorMessage');

const currentWeather = document.getElementById('currentWeather');
const forecastSection = document.getElementById('forecastSection');
const hourlySection = document.getElementById('hourlySection');
const savedLocations = document.getElementById('savedLocations');

const forecastContainer = document.getElementById('forecastContainer');
const hourlyContainer = document.getElementById('hourlyContainer');
const locationsContainer = document.getElementById('locationsContainer');

// State Management
let state = {
    isCelsius: true,
    currentCity: null,
    currentWeatherData: null,
    forecastData: null,
    savedCities: JSON.parse(localStorage.getItem('savedCities')) || []
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadDefaultCity();
    displaySavedLocations();
});

function setupEventListeners() {
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    locationBtn.addEventListener('click', handleLocationRequest);
    unitToggle.addEventListener('click', toggleUnit);
}

// ============================================
// SEARCH AND LOCATION HANDLING
// ============================================

async function handleSearch() {
    const city = searchInput.value.trim();
    if (!city) return;

    searchInput.value = '';
    await fetchWeatherByCity(city);
}

async function handleLocationRequest() {
    locationBtn.textContent = '...';
    locationBtn.disabled = true;

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                await fetchWeatherByCoordinates(latitude, longitude);
                locationBtn.textContent = '📍';
                locationBtn.disabled = false;
            },
            (err) => {
                showError('Unable to get your location. ' + err.message);
                locationBtn.textContent = '📍';
                locationBtn.disabled = false;
            }
        );
    } else {
        showError('Geolocation is not supported by your browser');
        locationBtn.textContent = '📍';
        locationBtn.disabled = false;
    }
}

function toggleUnit() {
    state.isCelsius = !state.isCelsius;
    unitToggle.textContent = state.isCelsius ? '°C / °F' : '°F / °C';

    if (state.currentWeatherData) {
        displayCurrentWeather(state.currentWeatherData);
    }
    if (state.forecastData) {
        displayForecast(state.forecastData);
    }
}

// ============================================
// API CALLS
// ============================================

async function fetchWeatherByCity(city) {
    try {
        showLoading();
        const response = await fetch(
            `${API_BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`
        );

        if (!response.ok) {
            throw new Error('City not found');
        }

        const data = await response.json();
        state.currentCity = {
            lat: data.coord.lat,
            lon: data.coord.lon,
            name: data.name,
            country: data.sys.country
        };

        await Promise.all([
            fetchCurrentWeather(data),
            fetchForecast(state.currentCity.lat, state.currentCity.lon)
        ]);

        hideError();
    } catch (err) {
        showError(err.message);
    }
}

async function fetchWeatherByCoordinates(lat, lon) {
    try {
        showLoading();
        const response = await fetch(
            `${API_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch weather');
        }

        const data = await response.json();
        state.currentCity = {
            lat: data.coord.lat,
            lon: data.coord.lon,
            name: data.name,
            country: data.sys.country
        };

        await Promise.all([
            fetchCurrentWeather(data),
            fetchForecast(lat, lon)
        ]);

        hideError();
    } catch (err) {
        showError(err.message);
    }
}

async function fetchCurrentWeather(data) {
    state.currentWeatherData = data;
    displayCurrentWeather(data);
    hideLoading();
}

async function fetchForecast(lat, lon) {
    try {
        const response = await fetch(
            `${API_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch forecast');
        }

        const data = await response.json();
        state.forecastData = data;
        displayForecast(data);
        displayHourlyForecast(data);
    } catch (err) {
        console.error('Forecast error:', err);
    }
}

// ============================================
// DISPLAY FUNCTIONS
// ============================================

function displayCurrentWeather(data) {
    const temp = convertTemperature(data.main.temp);
    const feelsLike = convertTemperature(data.main.feels_like);
    const windSpeed = state.isCelsius ? data.wind.speed : data.wind.speed * 2.237;
    const visibility = state.isCelsius ? (data.visibility / 1000).toFixed(1) : (data.visibility / 1609).toFixed(1);
    const visibilityUnit = state.isCelsius ? 'km' : 'mi';
    const windUnit = state.isCelsius ? 'm/s' : 'mph';
    const rain = data.rain?.['1h'] || 0;

    document.getElementById('cityName').textContent = `${data.name}, ${data.sys.country}`;
    document.getElementById('weatherDate').textContent = formatDate(new Date());
    document.getElementById('temperature').textContent = Math.round(temp);
    document.getElementById('temperatureUnit').textContent = state.isCelsius ? '°C' : '°F';
    document.getElementById('weatherIcon').src = getWeatherIcon(data.weather[0].main);
    document.getElementById('weatherDescription').textContent = data.weather[0].description;
    document.getElementById('humidity').textContent = data.main.humidity;
    document.getElementById('windSpeed').textContent = windSpeed.toFixed(1);
    document.getElementById('windUnit').textContent = windUnit;
    document.getElementById('pressure').textContent = data.main.pressure;
    document.getElementById('visibility').textContent = visibility;
    document.getElementById('visibilityUnit').textContent = visibilityUnit;
    document.getElementById('rain').textContent = rain.toFixed(1);
    document.getElementById('uvIndex').textContent = calculateUVIndex(data);

    currentWeather.classList.remove('hidden');
}

function displayForecast(data) {
    const dailyForecasts = {};

    // Group forecasts by day
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000).toLocaleDateString();
        if (!dailyForecasts[date]) {
            dailyForecasts[date] = {
                temps: [],
                description: item.weather[0].description,
                main: item.weather[0].main,
                humidity: item.main.humidity,
                windSpeed: item.wind.speed,
                data: item
            };
        }
        dailyForecasts[date].temps.push(item.main.temp);
    });

    forecastContainer.innerHTML = '';

    Object.entries(dailyForecasts).slice(0, 5).forEach(([date, forecast]) => {
        const minTemp = convertTemperature(Math.min(...forecast.temps));
        const maxTemp = convertTemperature(Math.max(...forecast.temps));
        const windSpeed = state.isCelsius ? forecast.windSpeed : forecast.windSpeed * 2.237;
        const windUnit = state.isCelsius ? 'm/s' : 'mph';

        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.innerHTML = `
            <div class="forecast-date">${new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
            <div class="forecast-icon">
                <img src="${getWeatherIcon(forecast.main)}" alt="${forecast.description}">
            </div>
            <div class="forecast-temp">${Math.round(maxTemp)}°</div>
            <div class="forecast-temp-range">${Math.round(minTemp)}°</div>
            <div class="forecast-description">${forecast.description}</div>
            <div class="forecast-details">
                <div>
                    <i class="fas fa-water"></i> ${forecast.humidity}%
                </div>
                <div>
                    <i class="fas fa-wind"></i> ${windSpeed.toFixed(1)}${windUnit}
                </div>
            </div>
        `;
        forecastContainer.appendChild(card);
    });

    forecastSection.classList.remove('hidden');
}

function displayHourlyForecast(data) {
    hourlyContainer.innerHTML = '';

    data.list.slice(0, 8).forEach(item => {
        const temp = convertTemperature(item.main.temp);
        const time = new Date(item.dt * 1000).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
        const rain = item.rain?.['1h'] || 0;

        const card = document.createElement('div');
        card.className = 'hourly-card';
        card.innerHTML = `
            <div class="hourly-time">${time}</div>
            <div class="hourly-icon">
                <img src="${getWeatherIcon(item.weather[0].main)}" alt="${item.weather[0].description}">
            </div>
            <div class="hourly-temp">${Math.round(temp)}°</div>
            <div class="hourly-rain">
                <i class="fas fa-cloud-rain"></i> ${rain.toFixed(1)}mm
            </div>
        `;
        hourlyContainer.appendChild(card);
    });

    hourlySection.classList.remove('hidden');
}

function displaySavedLocations() {
    if (state.savedCities.length === 0) {
        savedLocations.classList.add('hidden');
        return;
    }

    locationsContainer.innerHTML = '';

    state.savedCities.forEach(city => {
        const card = document.createElement('div');
        card.className = 'location-card';
        card.innerHTML = `
            <div class="location-card-header">
                <h4>${city.name}</h4>
                <button class="remove-location" data-city="${city.name}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="location-card-temp">${city.temp}°</div>
            <div class="location-card-description">${city.description}</div>
        `;

        const removeBtn = card.querySelector('.remove-location');
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeSavedLocation(city.name);
        });

        card.addEventListener('click', () => fetchWeatherByCity(city.name));
        locationsContainer.appendChild(card);
    });

    savedLocations.classList.remove('hidden');
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function convertTemperature(celsius) {
    return state.isCelsius ? celsius : (celsius * 9/5) + 32;
}

function getWeatherIcon(weather) {
    const iconMap = {
        'Clear': 'https://openweathermap.org/img/wn/01d@4x.png',
        'Clouds': 'https://openweathermap.org/img/wn/02d@4x.png',
        'Drizzle': 'https://openweathermap.org/img/wn/09d@4x.png',
        'Rain': 'https://openweathermap.org/img/wn/10d@4x.png',
        'Thunderstorm': 'https://openweathermap.org/img/wn/11d@4x.png',
        'Snow': 'https://openweathermap.org/img/wn/13d@4x.png',
        'Mist': 'https://openweathermap.org/img/wn/50d@4x.png',
        'Smoke': 'https://openweathermap.org/img/wn/50d@4x.png',
        'Haze': 'https://openweathermap.org/img/wn/50d@4x.png',
        'Dust': 'https://openweathermap.org/img/wn/50d@4x.png',
        'Fog': 'https://openweathermap.org/img/wn/50d@4x.png',
        'Sand': 'https://openweathermap.org/img/wn/50d@4x.png',
        'Ash': 'https://openweathermap.org/img/wn/50d@4x.png',
        'Squall': 'https://openweathermap.org/img/wn/50d@4x.png',
        'Tornado': 'https://openweathermap.org/img/wn/50d@4x.png'
    };

    return iconMap[weather] || iconMap['Clouds'];
}

function formatDate(date) {
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function calculateUVIndex(data) {
    // Simplified UV index calculation based on cloud cover and time of day
    const cloudCover = data.clouds.all;
    const hour = new Date().getHours();
    const baseUV = hour >= 10 && hour <= 16 ? 5 : 2;
    const uvIndex = Math.max(0, baseUV - (cloudCover / 20));
    return Math.round(uvIndex * 10) / 10;
}

// ============================================
// STATE MANAGEMENT
// ============================================

function saveLoca</tion(city, temp, description) {
    const cityExists = state.savedCities.some(c => c.name.toLowerCase() === city.toLowerCase());

    if (!cityExists) {
        state.savedCities.push({
            name: city,
            temp: Math.round(temp),
            description: description
        });

        localStorage.setItem('savedCities', JSON.stringify(state.savedCities));
        displaySavedLocations();
    }
}

function removeSavedLocation(cityName) {
    state.savedCities = state.savedCities.filter(c => c.name.toLowerCase() !== cityName.toLowerCase());
    localStorage.setItem('savedCities', JSON.stringify(state.savedCities));
    displaySavedLocations();
}

function loadDefaultCity() {
    const defaultCity = 'London';
    fetchWeatherByCity(defaultCity);
}

// ============================================
// UI STATE FUNCTIONS
// ============================================

function showLoading() {
    loading.classList.remove('hidden');
    error.classList.add('hidden');
    currentWeather.classList.add('hidden');
    forecastSection.classList.add('hidden');
    hourlySection.classList.add('hidden');
}

function hideLoading() {
    loading.classList.add('hidden');
}

function showError(message) {
    errorMessage.textContent = message;
    error.classList.remove('hidden');
    loading.classList.add('hidden');
    currentWeather.classList.add('hidden');
    forecastSection.classList.add('hidden');
    hourlySection.classList.add('hidden');
}

function hideError() {
    error.classList.add('hidden');
}
