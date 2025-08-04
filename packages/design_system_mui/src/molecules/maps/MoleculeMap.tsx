
import React, { useState, Fragment } from "react";
import * as geolib from "geolib";
import {
  Polyline,
  OverlayView
} from "react-google-maps";
import hexToRgba from "hex-to-rgba";
import {useTheme} from "@mui/material/styles";

import {ZoomControl} from "./ZoomControl";
import {MapDrawer} from "./MapDrawer";
import {MapIcon} from "./MapIcon";
import {GoogleMapComponent} from "../../atoms/maps/GoogleMap";

import {RoutesProps} from "../../types/facilities";

export type MoleculeMapProps = {
  routes: RoutesProps[],
  hideZoomControls?: boolean
}

export function MoleculeMap({routes, hideZoomControls}: MoleculeMapProps) {
  const [zoom, setZoom] = useState(13);
  const [openMapDrawer, setOpenMapDrawer] = useState(false);
  const [route, setRoute] = useState<RoutesProps>(null);
  const {palette} = useTheme();

  const getPixelPositionOffset = (width: number, height: number) => ({
    x: -(width / 2),
    y: -(height / 2)
  });


  return (
    <>
      <ZoomControl 
        handleIncreaseZoom={() => setZoom(zoom => zoom + 1)}
        handleDecreaseZoom={() => setZoom(zoom => zoom - 1)}
        hide={hideZoomControls}
      />

      <GoogleMapComponent  zoom={zoom}>
        {routes?.map((route, index) => {

          const coord = geolib?.getCenterOfBounds([
            { latitude: -25.9608221, longitude: 32.5688425 },
            { latitude: -25.9608221, longitude: 32.5688425 }
          ]);

          const distanceFacilityToLIMS = geolib?.getDistance(
            { latitude: -25.9608221, longitude: 32.5688425 },
            { latitude: -25.9608221, longitude: 32.5688425  }
          )/1000;

          return (
            <Fragment key={index}>
              {(route?.facilityLatitude && route?.facilityLongitude) &&
                <OverlayView
                  key={route?.facilityCode}
                  position={{ lat: route?.facilityLatitude, lng: route?.facilityLongitude }}
                  mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                  getPixelPositionOffset={getPixelPositionOffset}
                >
                  <div style={{
                      width: 40,
                      height: 40,
                      marginBottom: 35,
                      marginLeft: 9,
                      position: "relative"
                    }}
                  >
                    <MapIcon 
                      color="" 
                      label={route?.facilityName} 
                      pulse={false} 
                    />
                  </div>
                </OverlayView>
              }
              {(route?.hubLatitude && route?.hubLongitude) &&
                <OverlayView
                  key={route?.hubCode}
                  position={{ lat: route?.hubLatitude, lng: route?.hubLongitude }}
                  mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                  getPixelPositionOffset={getPixelPositionOffset}
                >
                  <div style={{
                      width: 40,
                      height: 40,
                      marginBottom: 35,
                      marginLeft: 9,
                      position: "relative"
                    }}
                  >
                    <MapIcon 
                      color={palette.secondary.main}
                      label={route?.hubName} 
                      pulse={false} 
                    />
                  </div>
                </OverlayView>
              }
              {(route?.labLatitude && route?.labLongitude) &&
                <OverlayView
                  key={route?.labCode}
                  position={{ lat: route?.labLatitude, lng: route?.labLongitude }}
                  mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                  getPixelPositionOffset={getPixelPositionOffset}
                >
                  <div style={{
                      width: 40,
                      height: 40,
                      marginBottom: 35,
                      marginLeft: 9,
                      position: "relative"
                    }}
                  >
                    <MapIcon 
                      color={palette.primary.main}
                      label={route?.labName} 
                      pulse={true} 
                    />
                  </div>
                </OverlayView>
              }

              <Polyline
                // ref={polyRef}
                path={[
                  { lat: route?.facilityLatitude, lng: route?.facilityLongitude },
                  ((route?.hubLatitude && route?.hubLongitude) ? 
                    { lat: route?.hubLatitude, lng: route?.hubLongitude } : 
                    { lat: route?.facilityLatitude, lng: route?.facilityLongitude }),
                  { lat: route?.labLatitude, lng: route?.labLongitude }
                ]}
                // onClick={handlePolylineOnLoad}
                options={{
                  strokeColor: hexToRgba(palette.primary.main, "0.6"),
                  strokeOpacity: 1,
                  strokeWeight: 2,
                  geodesic: true,
                }}
              />

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
                        display: (zoom <= 13 && distanceFacilityToLIMS <= 2300) ? "none" : "block"
                      }}
                      onClick={() => {
                        setOpenMapDrawer(true);
                        setRoute(route);
                      }}
                    >
                      <span style={{
                        textAlign: "center"
                      }}>
                        {route?.totalSamples || route?.totalSamples} <br/>
                        {
                          distanceFacilityToLIMS + " Km"
                        }
                      </span>
                    </div>
                  </OverlayView>
              )}
            </Fragment>
          )
        })}
      </GoogleMapComponent>
      <MapDrawer 
        openMapDrawer={openMapDrawer}
        onClose={() => setOpenMapDrawer(false)}
        route={route}
      />
    </>
  );
}
