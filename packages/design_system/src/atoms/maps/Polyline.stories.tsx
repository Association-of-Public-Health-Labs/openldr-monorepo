import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { GoogleMap, LoadScript } from "@react-google-maps/api";
import { Polyline, Props } from "./Polyline";
import lightMap from "../../themes/map.light";

export default {
  title: "DesignSystem/Atoms/Maps/Polyline",
  component: Polyline,
  tags: ["autodocs"]
} as Meta;

const Template: StoryFn<Props> = (args) => {
  return (
    <LoadScript googleMapsApiKey="AIzaSyC2zahDM0plWwPMuH_-XDBuS5_dWOBvKtE">
      <GoogleMap
        mapContainerStyle={{
          width: "100%",
          height: "400px",
        }}
        center={{
          lat: args.startPoint.lat,
          lng: args.startPoint.lng,
        }}
        zoom={6}
        options={{
          styles: lightMap,
          fullscreenControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          zoomControl: false,
        }}
      >
        <Polyline {...args} />
      </GoogleMap>
    </LoadScript>
  );
};

export const Default = Template.bind({});
Default.args = {
  startPoint: { lat: -25.966667, lng: 32.583333 }, // Maputo
  endPoint: { lat: -19.833333, lng: 34.85 }, // Beira
  color: "#FF0000",
};

export const NorthernRoute = Template.bind({});
NorthernRoute.args = {
  startPoint: { lat: -12.5, lng: 40.0 }, // Pemba
  endPoint: { lat: -14.5, lng: 39.3 }, // Nampula
  color: "#0000FF",
};

export const CoastalRoute = Template.bind({});
CoastalRoute.args = {
  startPoint: { lat: -15.0, lng: 40.0 }, // Quelimane
  endPoint: { lat: -17.5, lng: 38.3 }, // Inhambane
  color: "#00FF00",
};