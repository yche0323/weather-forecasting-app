import React from "react";
import SearchBar from "../components/SearchBar";
import LocationButton from "../components/LocationButton";
import WeatherComponent from "../components/WeatherComponent";
import logo from "../images/logo.png";
import { useNavigate } from "react-router-dom";
import "../css/WeatherPage.css";

interface WeatherPageProps {
  onCitySelect: (lat: string, lng: string, loc: string) => void;
  latitude: string;
  longitude: string;
  location: string;
}

const WeatherPage: React.FC<WeatherPageProps> = (props) => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate("/");
  };

  return (
    <div className="weatherpage">
      <div className="outer-header">
        <button className="logo-button" onClick={handleLogoClick}>
          <img className="logo" src={logo} alt="Logo" />
        </button>
        <div className="inner-header">
          <SearchBar onCitySelect={props.onCitySelect} />
          <LocationButton onCitySelect={props.onCitySelect} />
        </div>
      </div>
      {props.latitude && props.longitude && props.location && (
        <WeatherComponent
          latitude={props.latitude}
          longitude={props.longitude}
          location={props.location}
        />
      )}
    </div>
  );
};

export default WeatherPage;
