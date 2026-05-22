import * as Location from "expo-location";

import { CurrentWeather } from "../models/weather";

type OpenMeteoResponse = {
  current?: {
    temperature_2m?: number;
    weather_code?: number;
  };
};

export async function fetchCurrentWeather(): Promise<CurrentWeather | undefined> {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== Location.PermissionStatus.GRANTED) {
    return undefined;
  }

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  const params = new URLSearchParams({
    latitude: String(location.coords.latitude),
    longitude: String(location.coords.longitude),
    current: "temperature_2m,weather_code",
    temperature_unit: "fahrenheit",
    wind_speed_unit: "mph",
    precipitation_unit: "inch",
    timezone: "auto",
  });

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Weather request failed: ${response.status}`);
  }

  const data = (await response.json()) as OpenMeteoResponse;
  const temperature = data.current?.temperature_2m;
  if (typeof temperature !== "number") {
    return undefined;
  }

  return {
    temperatureF: Math.round(temperature),
    condition: conditionForWeatherCode(data.current?.weather_code),
    fetchedAt: new Date().toISOString(),
  };
}

function conditionForWeatherCode(code?: number) {
  if (code === 0) return "Clear";
  if (code === 1 || code === 2) return "Mostly Clear";
  if (code === 3) return "Cloudy";
  if (code === 45 || code === 48) return "Foggy";
  if (code === 51 || code === 53 || code === 55 || code === 56 || code === 57) return "Drizzle";
  if (code === 61 || code === 63 || code === 65 || code === 66 || code === 67) return "Rain";
  if (code === 71 || code === 73 || code === 75 || code === 77) return "Snow";
  if (code === 80 || code === 81 || code === 82) return "Showers";
  if (code === 85 || code === 86) return "Snow Showers";
  if (code === 95 || code === 96 || code === 99) return "Storms";
  return "Local Weather";
}

