
const apiKey = "2ac038fa320f456db38160342262406";
let currentUnit = "c";

let currentWeatherData = null;
let currentForecastData = null;
let currentCity = "Lahore";

const cityInput = document.querySelector(".city-input");
const forecastCardsContainer = document.querySelector(".forecast-cards");
const recentList = document.querySelector(".recent-list");
const unitToggle = document.querySelector(".unit-toggle");
const locationBtn = document.querySelector(".location-btn");
const heroDegree = document.querySelector(".hero-degree");
const mainWeatherCard = document.querySelector(".main-weather-card");


const loadingText = document.querySelector(".loading-text");
const errorText = document.querySelector(".error-text");

const cityName = document.querySelector(".hero-city");
const dateTime = document.querySelector(".hero-date-time");
const temperature = document.querySelector(".hero-temp");
const weatherCondition = document.querySelector(".hero-condition");
const feelsLike = document.querySelector(".feels-like");

const detailValues = document.querySelectorAll(".detail-value");

async function getWeather(city) {
  try {
    loadingText.textContent = "Loading weather...";
    errorText.textContent = "";

    const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=5&aqi=no&alerts=no`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    currentWeatherData = data.current;
    currentForecastData = data.forecast.forecastday;
    currentCity = data.location.name;

    cityName.textContent = `${data.location.name}, ${data.location.country}`;
    dateTime.textContent = data.location.localtime;
    weatherCondition.textContent = currentWeatherData.condition.text;
    updateWeatherTheme(currentWeatherData.condition.text, currentWeatherData.is_day);


    detailValues[0].textContent = `${currentWeatherData.humidity}%`;
    detailValues[1].textContent = `${currentWeatherData.wind_kph} km/h`;
    detailValues[2].textContent = `${currentWeatherData.pressure_mb} hPa`;
    detailValues[3].textContent = `${currentWeatherData.vis_km} km`;
    detailValues[4].textContent = currentForecastData[0].astro.sunrise;
    detailValues[5].textContent = currentForecastData[0].astro.sunset;

    updateWeatherByUnit();
    saveRecentCity(data.location.name);

    loadingText.textContent = "";
  } catch (error) {
    loadingText.textContent = "";
    errorText.textContent = "City not found or weather could not be loaded.";
    console.log(error);
  }
}


function updateWeatherTheme(conditionText, isDay) {
  mainWeatherCard.classList.remove(
    "sunny-theme",
    "cloudy-theme",
    "rainy-theme",
    "night-theme"
  );

  const condition = conditionText.toLowerCase();

  if (isDay === 0) {
    mainWeatherCard.classList.add("night-theme");
  } else if (
    condition.includes("rain") ||
    condition.includes("drizzle") ||
    condition.includes("thunder")
  ) {
    mainWeatherCard.classList.add("rainy-theme");
  } else if (
    condition.includes("cloud") ||
    condition.includes("overcast") ||
    condition.includes("mist")
  ) {
    mainWeatherCard.classList.add("cloudy-theme");
  } else {
    mainWeatherCard.classList.add("sunny-theme");
  }
}


function updateWeatherByUnit() {
  if (!currentWeatherData || !currentForecastData) return;

  if (currentUnit === "c") {
    temperature.textContent = Math.round(currentWeatherData.temp_c);
    feelsLike.textContent = `Feels like ${Math.round(currentWeatherData.feelslike_c)}°`;
    heroDegree.textContent = "°C";
  } else {
    temperature.textContent = Math.round(currentWeatherData.temp_f);
    feelsLike.textContent = `Feels like ${Math.round(currentWeatherData.feelslike_f)}°`;
    heroDegree.textContent = "°F";
  }

  showForecast(currentForecastData);
}

function showForecast(forecastDays) {
  forecastCardsContainer.innerHTML = "";

  forecastDays.forEach((day) => {
    const date = new Date(day.date);
    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

    const forecastTemp =
      currentUnit === "c"
        ? `${Math.round(day.day.avgtemp_c)}°C`
        : `${Math.round(day.day.avgtemp_f)}°F`;

    forecastCardsContainer.innerHTML += `
      <div class="forecast-card">
        <p class="forecast-day">${dayName}</p>
        <img src="https:${day.day.condition.icon}" alt="Forecast Icon" class="forecast-icon">
        <h3 class="forecast-temp">${forecastTemp}</h3>
        <p class="forecast-condition">${day.day.condition.text}</p>
      </div>
    `;
  });
}

function saveRecentCity(city) {
  let recentCities = JSON.parse(localStorage.getItem("recentCities")) || [];

  recentCities = recentCities.filter((item) => item !== city);
  recentCities.unshift(city);

  if (recentCities.length > 5) {
    recentCities = recentCities.slice(0, 5);
  }

  localStorage.setItem("recentCities", JSON.stringify(recentCities));
  showRecentCities();
}

function showRecentCities() {
  const recentCities = JSON.parse(localStorage.getItem("recentCities")) || [];

  recentList.innerHTML = "";

  recentCities.forEach((city) => {
    recentList.innerHTML += `<button class="recent-city">${city}</button>`;
  });
}

cityInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    const city = cityInput.value.trim();

    if (city !== "") {
      getWeather(city);
      cityInput.value = "";
    }
  }
});

recentList.addEventListener("click", function (event) {
  if (event.target.classList.contains("recent-city")) {
    getWeather(event.target.textContent);
  }
});


unitToggle.addEventListener("click", function () {
  if (currentUnit === "c") {
    currentUnit = "f";
    unitToggle.textContent = "°F / °C";
  } else {
    currentUnit = "c";
    unitToggle.textContent = "°C / °F";
  }

  updateWeatherByUnit();
});

locationBtn.addEventListener("click", function () {
  if (!navigator.geolocation) {
    errorText.textContent = "Geolocation is not supported by your browser.";
    return;
  }

  loadingText.textContent = "Getting your location...";
  errorText.textContent = "";

  navigator.geolocation.getCurrentPosition(
    function (position) {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      getWeather(`${latitude},${longitude}`);
    },
    function () {
      loadingText.textContent = "";
      errorText.textContent = "Unable to get your location.";
    }
  );
});
getWeather("Lahore");
showRecentCities();


