import React, { useState, useEffect } from "react";
import LineChart from "./WeatherSubcomponents/LineChart";
import BarChart from "./WeatherSubcomponents/BarChart";

interface WeatherComponentProps {
  latitude: string;
  longitude: string;
  location: string;
  selectedDate: string;
}

interface AnyObject {
  [key: string]: any;
}

interface DailyWeatherData {
  date: string;
  hourlyTemp: number[];
  hourlyAppTemp: number[];
  hourlyPrecProb: number[];
  hourlyWeatherCode: number[];
  hourlyWindSpeed: number[];
  dailyWeatherCode: number;
  dailyMaxTemp: number;
  dailyMinTemp: number;
  dailySunrise: string;
  dailySunset: string;
  dailyUVIndex: number;
}

interface CurrentWeatherData {
  currTemp: number;
  currAppTemp: number;
  currWeatherCode: number;
  currWindSpeed: number;
}

const generateHours = (): string[] => {
  const result: string[] = [];

  for (let i = 0; i < 24; i++) {
    if (i < 10) {
      result.push(`0${i}:00`);
    } else {
      result.push(`${i}:00`);
    }
  }

  return result;
};

const processDailyWeatherData = (data: AnyObject): DailyWeatherData[] => {
  const arrObject: AnyObject = {};

  // Convert values in the data object to arrays if they are objects
  for (const [key, value] of Object.entries(data)) {
    if (typeof value == "object" && !Array.isArray(value) && value !== null) {
      arrObject[key] = Object.values(value);
    } else {
      arrObject[key] = value;
    }
  }

  const result: DailyWeatherData[] = [];
  for (let i = 0; i < arrObject.dates.length; i++) {
    const resultObj = {} as DailyWeatherData;

    // Adding daily data
    resultObj.date = arrObject.dates[i];
    resultObj.dailyWeatherCode = arrObject.dailyWeatherCode[i];
    resultObj.dailyMaxTemp = arrObject.dailyMaxTemp[i];
    resultObj.dailyMinTemp = arrObject.dailyMinTemp[i];
    resultObj.dailySunrise = arrObject.dailySunrise[i];
    resultObj.dailySunset = arrObject.dailySunset[i];
    resultObj.dailyUVIndex = arrObject.dailyUVIndex[i];

    // Adding hourly data
    const start = i * 24;
    const end = start + 24;
    resultObj.hourlyTemp = arrObject.hourlyTemp.slice(start, end);
    resultObj.hourlyAppTemp = arrObject.hourlyAppTemp.slice(start, end);
    resultObj.hourlyPrecProb = arrObject.hourlyPrecProb.slice(start, end);
    resultObj.hourlyWeatherCode = arrObject.hourlyWeatherCode.slice(start, end);
    resultObj.hourlyWindSpeed = arrObject.hourlyWindSpeed.slice(start, end);

    result.push(resultObj);
  }

  return result;
};

const processCurrentWeatherData = (data: AnyObject): CurrentWeatherData => {
  const result: CurrentWeatherData = {
    currTemp: data.currTemp,
    currAppTemp: data.currAppTemp,
    currWeatherCode: data.currWeatherCode,
    currWindSpeed: data.currWindSpeed,
  };

  return result;
};

const WeatherComponent: React.FC<WeatherComponentProps> = ({
  latitude,
  longitude,
  location,
  selectedDate,
}) => {
  const [dailyWeatherData, setDailyWeatherData] = useState<
    DailyWeatherData[] | null
  >(null);
  const [currWeatherData, setCurrWeatherData] =
    useState<CurrentWeatherData | null>(null);
  const [error, setError] = useState("");
  const hours = generateHours();

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const response = await fetch(
          `/weather?latitude=${latitude}&longitude=${longitude}&selectedDate=${selectedDate}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch weather data");
        }
        const data = await response.json();
        const dailyData = processDailyWeatherData(data);
        const currData = processCurrentWeatherData(data);
        setDailyWeatherData(dailyData);
        setCurrWeatherData(currData);
        setError("");
      } catch (e) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError("An unknown error occurred");
        }
        setDailyWeatherData(null);
      }
    };

    fetchWeatherData();
  }, [
    latitude,
    longitude,
    location,
    selectedDate,
    dailyWeatherData,
    currWeatherData,
  ]);

  return (
    <div>
      {error && <p>Error: {error}</p>}
      {dailyWeatherData && (
        <div>
          <LineChart
            data={[
              dailyWeatherData[0].hourlyTemp,
              dailyWeatherData[0].hourlyAppTemp,
            ]}
            labels={hours}
            dataLabels={["Temperature", "Feels Like"]}
            unit={["°C", "°C"]}
            borderColors={["red", "blue"]}
            borderDashes={[[], [5, 5]]}
          />
          <LineChart
            data={[dailyWeatherData[0].hourlyWindSpeed]}
            labels={hours}
            dataLabels={["Wind Speed"]}
            unit={["km/h"]}
            borderColors={["green"]}
            borderDashes={[[]]}
          />
          <BarChart
            data={[dailyWeatherData[0].hourlyPrecProb]}
            labels={hours}
            dataLabels={["Precipitation Probability"]}
            unit={["%"]}
            backgroundColors={["purple"]}
          />
        </div>
      )}
    </div>
  );
};

export default WeatherComponent;
