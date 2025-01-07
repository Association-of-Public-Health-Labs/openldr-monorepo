import {Fragment, useCallback, useRef, useState} from "react";
import { Box } from "@mui/material";
import { GoogleMap, OverlayView, Polyline } from '@react-google-maps/api';
import { useTheme } from "@mui/material";
import hexToRgba from "hex-to-rgba";

import lightMap from "../../themes/map.light";
import darkMap from "../../themes/map.dark";


import Map from "../../atoms/maps/Map";
import {ZoomControl} from "../../molecules/maps/ZoomControl";
import { MapIcon as LabIcon } from "../../molecules/maps/MapIcon";
import { Icon } from "../../atoms/maps/Icon";
import { RoutesProps } from "../../types/facilities";
import { MapLoader } from "../../atoms/maps/MapLoader";

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

export function Routes () {
  const theme = useTheme();
  const mapRef = useRef(null);
  const [zoom, setZoom] = useState(7);
  const [map, setMap] = useState<google.maps.Map>(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [zoomDisabled, setZoomDisabled] = useState(false);
  const [viewport, setViewport] = useState<ViewportProps>(null);
  const [routes, setRoutes] = useState<RoutesProps[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<string | null>();
  const mapTheme = theme.palette.mode === "dark" ? darkMap : lightMap;
  
  const onLoad = useCallback((map) => {
    const bounds = map.getBounds();
    setMap(map);
    setViewport({ 
      lat: {low: bounds?.Ha?.lo, high: bounds?.Ha?.hi}, 
      lng: {low: bounds?.eb?.lo, high: bounds?.eb?.hi},
    })
  }, []);

  // useEffect(() => {
  //   async function loadFacilities() {
  //     setLoading(true);
  //     setRoutes([]);
  //     const {data: routes} = await api.get<RoutesProps[]>("/eid/lab/sample_routes_viewport", {
  //       params: {
  //         dates: ["2022-01-01", "2022-10-30"],
  //         viewport: viewport
  //       },
  //       paramsSerializer: (params) => {
  //         return QueryString.stringify(params);
  //       },
  //     });
  //     setRoutes(routes);
  //     setLoading(false);
  //   }
  //   loadFacilities();
  // },[viewport])

  const handleMapFitBounds = (coords) => {
    if (map) {
      const bounds = new google.maps.LatLngBounds()

      coords.map(position => {
        bounds.extend(position)
      })
      
      map.fitBounds(bounds)
    }
  }

  function getCurrentViewport(){
    if(!map) return
    const bounds = map.getBounds();
    setViewport({ 
      lat: {low: bounds.getSouthWest().lng(), high: bounds.getNorthEast().lng()}, 
      lng: {low: bounds.getSouthWest().lat(), high: bounds.getNorthEast().lat()},
    })
  }

  return (
    <Box sx={{width: "100%", height: "100%", position: "relative"}}>
      <ZoomControl 
        handleIncreaseZoom={() => setZoom(zoom => zoom + 1)}
        handleDecreaseZoom={() => setZoom(zoom => zoom - 1)}
        hide={false}
      />
      <MapLoader isLoading={loading}/>
      <Map>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          ref={mapRef}
          zoom={zoom}
          options={{
            styles: mapTheme,
            fullscreenControl: false,
            streetViewControl: false,
            mapTypeControl: false,
            zoomControl: false,
          }}
          onLoad={onLoad}
          onDragEnd={() => getCurrentViewport()}
          onBoundsChanged={() => {
            if(loaded) return
            getCurrentViewport()
            setLoaded(true)
          }}
          onZoomChanged={() => {
            if(zoomDisabled) return
            getCurrentViewport()
          }}
        >
          {
            routes.map((route, index) => (
              <Fragment key={index}>
                <OverlayView
                  position={{ lat: route?.facilityLongitude, lng: route?.facilityLatitude }}
                  mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                >
                  <Icon 
                    name={route?.facilityName}
                    onClick={async () => {
                      setZoomDisabled(true);
                      setSelectedFacility(route.facilityCode === selectedFacility ? null : route.facilityCode)
                      await handleMapFitBounds([
                        { lat: route?.facilityLongitude, lng: route?.facilityLatitude },
                        { lat: route?.labLongitude, lng: route?.labLatitude }
                      ]);
                      setZoomDisabled(false);
                    }}
                    highlighted={route.facilityCode === selectedFacility}
                    hidden={(route.facilityCode !== selectedFacility) && !!selectedFacility}
                    zoom={zoom}
                  />
                </OverlayView>
                {(route?.labLatitude && route?.facilityLatitude && selectedFacility === route.facilityCode) &&
                  <>
                    <Polyline
                      path={[
                        { lat: route?.facilityLongitude, lng: route?.facilityLatitude },
                        { lat: route?.labLongitude, lng: route?.labLatitude }
                      ]}
                      options={{
                        strokeColor: hexToRgba(theme.palette.primary.main, "0.6"),
                        strokeOpacity: 1,
                        strokeWeight: 2,
                        zIndex: 10,
                        geodesic: true,
                      }}
                      // onLoad={(polyline) => handlePolylineOnLoad(polyline)}
                    />
                    <OverlayView
                      position={{ lat: route?.labLongitude, lng: route?.labLatitude }}
                      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                    >
                      <Box sx={{
                        width: 100,
                        height: 100,
                      }}>
                        <LabIcon 
                          color={theme.palette.primary.main}
                          label={route?.labName} 
                          pulse={true} 
                        />
                      </Box>
                    </OverlayView>
                  </>
                }
              </Fragment>
            ))
          }
        </GoogleMap>
      </Map>
    </Box>
  )
}