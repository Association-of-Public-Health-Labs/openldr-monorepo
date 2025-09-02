"use client";

import React, { useState, Fragment, useMemo } from "react";
import * as geolib from "geolib";
import { GoogleMap, Marker, Polyline, OverlayView, useLoadScript } from "@react-google-maps/api";
import hexToRgba from "hex-to-rgba";
import { useTheme } from "@mui/material/styles";

import { ZoomControl } from "./ZoomControl";
import { MapDrawer } from "./MapDrawer";
import { MapIcon } from "./MapIcon";
import { RoutesProps } from "../../types/facilities";

export type MoleculeMapProps = {
  routes: RoutesProps[];
  hideZoomControls?: boolean;
};

export function MoleculeMap({ routes, hideZoomControls }: MoleculeMapProps) {
  const [zoom, setZoom] = useState(13);
  const [openMapDrawer, setOpenMapDrawer] = useState(false);
  const [route, setRoute] = useState<RoutesProps | null>(null);
  const { palette } = useTheme();

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
  });

  const center = useMemo(() => {
    if (!routes?.length) return { lat: -25.9655, lng: 32.5832 };
    return {
      lat: routes[0].facilityLatitude,
      lng: routes[0].facilityLongitude,
    };
  }, [routes]);

  const getPixelPositionOffset = (width: number, height: number) => ({
    x: -(width / 2),
    y: -(height / 2),
  });

  if (!isLoaded) return <p>Loading Map...</p>;

  return (
    <>
      <ZoomControl
        handleIncreaseZoom={() => setZoom((z) => z + 1)}
        handleDecreaseZoom={() => setZoom((z) => z - 1)}
        hide={hideZoomControls}
      />

      <GoogleMap
        zoom={zoom}
        center={center}
        mapContainerStyle={{ width: "100%", height: "100%" }}
        options={{ disableDefaultUI: true }}
      >
        {routes?.map((route, index) => {
          const coord = geolib.getCenterOfBounds([
            { latitude: route.facilityLatitude, longitude: route.facilityLongitude },
            { latitude: route.labLatitude, longitude: route.labLongitude },
          ]);

          const distanceFacilityToLIMS =
            geolib.getDistance(
              { latitude: route.facilityLatitude, longitude: route.facilityLongitude },
              { latitude: route.labLatitude, longitude: route.labLongitude }
            ) / 1000;

          return (
            <Fragment key={index}>
              {/* Facility */}
              {route?.facilityLatitude && route?.facilityLongitude && (
                <OverlayView
                  position={{ lat: route.facilityLatitude, lng: route.facilityLongitude }}
                  mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                  getPixelPositionOffset={getPixelPositionOffset}
                >
                  <div style={{ width: 40, height: 40, marginBottom: 35, marginLeft: 9, position: "relative" }}>
                    <MapIcon color="" label={route.facilityName} pulse={false} />
                  </div>
                </OverlayView>
              )}

              {/* Hub */}
              {route?.hubLatitude && route?.hubLongitude && (
                <OverlayView
                  position={{ lat: route.hubLatitude, lng: route.hubLongitude }}
                  mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                  getPixelPositionOffset={getPixelPositionOffset}
                >
                  <div style={{ width: 40, height: 40, marginBottom: 35, marginLeft: 9, position: "relative" }}>
                    <MapIcon color={palette.secondary.main} label={route.hubName} pulse={false} />
                  </div>
                </OverlayView>
              )}

              {/* Lab */}
              {route?.labLatitude && route?.labLongitude && (
                <OverlayView
                  position={{ lat: route.labLatitude, lng: route.labLongitude }}
                  mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                  getPixelPositionOffset={getPixelPositionOffset}
                >
                  <div style={{ width: 40, height: 40, marginBottom: 35, marginLeft: 9, position: "relative" }}>
                    <MapIcon color={palette.primary.main} label={route.labName} pulse />
                  </div>
                </OverlayView>
              )}

              {/* Route line */}
              <Polyline
                path={[
                  { lat: route.facilityLatitude, lng: route.facilityLongitude },
                  route?.hubLatitude && route?.hubLongitude
                    ? { lat: route.hubLatitude, lng: route.hubLongitude }
                    : { lat: route.facilityLatitude, lng: route.facilityLongitude },
                  { lat: route.labLatitude, lng: route.labLongitude },
                ]}
                options={{
                  strokeColor: hexToRgba(palette.primary.main, "0.6"),
                  strokeOpacity: 1,
                  strokeWeight: 2,
                  geodesic: true,
                }}
              />

              {/* Distance badge */}
              {zoom > 12 && (
                <OverlayView
                  position={{ lat: coord?.latitude, lng: coord?.longitude }}
                  mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                  getPixelPositionOffset={getPixelPositionOffset}
                >
                  <div
                    style={{
                      backgroundColor: "#00b000",
                      color: "white",
                      borderRadius: "16px",
                      padding: "5px",
                      textAlign: "center",
                      cursor: "pointer",
                      display: zoom <= 13 && distanceFacilityToLIMS <= 2300 ? "none" : "block",
                    }}
                    onClick={() => {
                      setOpenMapDrawer(true);
                      setRoute(route);
                    }}
                  >
                    <span>
                      {route.totalSamples} <br />
                      {distanceFacilityToLIMS} Km
                    </span>
                  </div>
                </OverlayView>
              )}
            </Fragment>
          );
        })}
      </GoogleMap>

      <MapDrawer openMapDrawer={openMapDrawer} onClose={() => setOpenMapDrawer(false)} route={route} />
    </>
  );
}
