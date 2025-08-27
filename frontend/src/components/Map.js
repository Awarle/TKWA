import React from 'react';
import { GoogleMap, LoadScript } from '@react-google-maps/api';
import AdvancedMarker from './advanced-marker';
import Pin from './Pin';
import markerImage from '../styles/MarkerImage.png';

const Map = ({ printers = [], defaultCenter = { lat: 48.8566, lng: 2.3522 } }) => {
  const mapStyles = {
    height: '80vh',
    width: '100%',
  };

  return (
    <LoadScript
      googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
      libraries={['places']}
      async
      onError={() => console.error('Erreur lors du chargement de Google Maps')}
    >
      <GoogleMap
        mapContainerStyle={mapStyles}
        zoom={13}
        center={printers.length > 0 ? { lat: printers[0].coordinates.lat, lng: printers[0].coordinates.lng } : defaultCenter}
      >
        {printers.map((printer, index) => (
          <AdvancedMarker key={index} position={{ lat: printer.coordinates.lat, lng: printer.coordinates.lng }}>
            <Pin background="#0f9d58" borderColor="#006425" glyphColor="#60d98f" />
          </AdvancedMarker>
        ))}
        <AdvancedMarker position={{ lat: 29.5, lng: -81.2 }}>
          <img src={markerImage} width={32} height={32} alt="custom-marker" />
        </AdvancedMarker>
      </GoogleMap>
    </LoadScript>
  );
};

export default Map;
