import { useEffect, useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.75rem',
};

const defaultCenter = {
  lat: 19.0760,
  lng: 72.8777,
};

export function MapComponent({ 
  doctors = [], 
  selectedDoctor, 
  onSelectDoctor, 
  userLocation,
  onMapLoad 
}) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });

  const [map, setMap] = useState(null);
  const [activeMarker, setActiveMarker] = useState(null);

  const onLoad = useCallback((map) => {
    setMap(map);
    if (onMapLoad) onMapLoad(map);
  }, [onMapLoad]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Center map on selected doctor
  useEffect(() => {
    if (map && selectedDoctor?.clinicLocation?.coordinates) {
      const [lng, lat] = selectedDoctor.clinicLocation.coordinates;
      map.panTo({ lat, lng });
      map.setZoom(15);
      setActiveMarker(selectedDoctor._id);
    }
  }, [map, selectedDoctor]);

  // Center on user location initially
  useEffect(() => {
    if (map && userLocation) {
      map.panTo(userLocation);
    }
  }, [map, userLocation]);

  if (loadError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-50 dark:bg-red-900/20 rounded-xl">
        <p className="text-red-600">Error loading maps. Check your API key.</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-theme-secondary rounded-xl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={userLocation || defaultCenter}
      zoom={13}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        styles: [
          // You can add custom map styles here for dark mode
        ],
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
      }}
    >
      {/* User Location Marker */}
      {userLocation && (
        <Marker
          position={userLocation}
          icon={{
            url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            scaledSize: new window.google.maps.Size(40, 40),
          }}
          title="Your Location"
        />
      )}

      {/* Doctor Markers */}
      {doctors.map((doctor, index) => {
        const [lng, lat] = doctor.clinicLocation?.coordinates || [0, 0];
        if (!lat || !lng) return null;

        return (
          <Marker
            key={doctor._id}
            position={{ lat, lng }}
            onClick={() => {
              setActiveMarker(doctor._id);
              onSelectDoctor(doctor);
            }}
            icon={{
              url: selectedDoctor?._id === doctor._id
                ? 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
                : 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
              scaledSize: new window.google.maps.Size(
                selectedDoctor?._id === doctor._id ? 45 : 35,
                selectedDoctor?._id === doctor._id ? 45 : 35
              ),
            }}
            label={{
              text: `${index + 1}`,
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
            title={`Dr. ${doctor.user?.name}`}
          >
            {activeMarker === doctor._id && (
              <InfoWindow
                position={{ lat, lng }}
                onCloseClick={() => setActiveMarker(null)}
              >
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-semibold text-gray-900">
                    Dr. {doctor.user?.name}
                  </h3>
                  <p className="text-sm text-gray-600">{doctor.specialization}</p>
                  <p className="text-sm text-primary-600 mt-1">
                    ₹{doctor.consultationFee}
                  </p>
                </div>
              </InfoWindow>
            )}
          </Marker>
        );
      })}
    </GoogleMap>
  );
}
