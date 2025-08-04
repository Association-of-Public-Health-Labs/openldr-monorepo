import { Polyline as GooglePolyline } from "@react-google-maps/api";

export interface GeoPointProps {
  lat: number;
  lng: number;
}

export interface PolylineProps {
  startPoint: GeoPointProps;
  endPoint: GeoPointProps;
  color?: string;
}

export function Polyline({ startPoint, endPoint, color }: PolylineProps) {
  const path = [
    { lat: startPoint.lat, lng: startPoint.lng },
    { lat: endPoint.lat, lng: endPoint.lng },
  ];

  const options = {
    strokeColor: color || "#000", // Default color is black
    strokeOpacity: 1,
    strokeWeight: 1,
  };

  return <GooglePolyline path={path} options={options} />;
}
