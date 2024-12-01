import React from 'react';
import { Marker } from '@react-google-maps/api';

const AdvancedMarker = ({ position, children }) => {
  return (
    <Marker position={position}>
      {children}
    </Marker>
  );
};

export default AdvancedMarker;
