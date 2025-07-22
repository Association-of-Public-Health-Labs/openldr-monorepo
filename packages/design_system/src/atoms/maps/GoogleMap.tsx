import React, { ReactNode, useState, useEffect } from "react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import { useTheme } from "@mui/material";

import lightMap from "../../themes/map.light";
import darkMap from "../../themes/map.dark";

export type Props = {
  children?: ReactNode;
  zoom: number;
};

function GoogleMapComponent({ children, zoom }: Props) {
  const theme = useTheme();
  const mapTheme = theme.palette.mode === "dark" ? darkMap : lightMap;

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyC2zahDM0plWwPMuH_-XDBuS5_dWOBvKtE",
  });

  const [mapZoom, setMapZoom] = useState<number>(zoom);

  useEffect(() => {
    setMapZoom(zoom);
  }, [zoom]);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <GoogleMap
      mapContainerStyle={{ width: "100%", height: "100%" }}
      center={{ lat: -25.9482195, lng: 32.5414244 }}
      zoom={mapZoom}
      options={{
        styles: mapTheme,
        fullscreenControl: false,
        streetViewControl: false,
        mapTypeControl: false,
        zoomControl: false,
      }}
    >
      {/* @ts-ignore */}
      {children}
    </GoogleMap>
  );
}

export default GoogleMapComponent;
