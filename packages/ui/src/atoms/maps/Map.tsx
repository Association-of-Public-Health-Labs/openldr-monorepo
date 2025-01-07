import { useCallback, useRef, useState, memo } from "react";
import { LoadScript } from '@react-google-maps/api';
import { useTheme } from "@mui/material";

import lightMap from "../../themes/map.light";
import darkMap from "../../themes/map.dark";

import {RoutesProps} from "../../types/facilities";

export type Props = {

}

type ViewportProps = {
  lat: {low: number, high: number},
  lng: {low: number, high: number},
}

const containerStyle = {
  width: '100%',
  height: '100%'
};

const center = {
  lat: -25.9482195,
  lng: 32.5414244
};

const getPixelPositionOffset = (width: number, height: number) => ({
  x: -(width / 2),
  y: -(height / 2)
});


function Map({children}) {
  const theme = useTheme();
  const [map, setMap] = useState<google.maps.Map>(null);
  const [viewport, setViewport] = useState<ViewportProps>(null);
  
  return (
      <LoadScript
        googleMapsApiKey="AIzaSyC2zahDM0plWwPMuH_-XDBuS5_dWOBvKtE"
      >
        {children}
      </LoadScript>
  )
}

export default memo(Map);

