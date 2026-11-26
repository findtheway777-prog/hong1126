/// <reference types="google.maps" />
import { useEffect, useState } from 'react';
import {
  APIProvider,
  APILoadingStatus,
  AdvancedMarker,
  InfoWindow,
  Map as GoogleMap,
  Pin,
  useAdvancedMarkerRef,
  useApiLoadingStatus,
} from '@vis.gl/react-google-maps';
import { ExternalLink, MapPin, Navigation } from 'lucide-react';
import { MUSEUM_INFO } from '../data/rentalFees';

function MuseumMapCanvas() {
  const status = useApiLoadingStatus();
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [infoOpen, setInfoOpen] = useState(true);

  if (
    status === APILoadingStatus.FAILED ||
    status === APILoadingStatus.AUTH_FAILURE
  ) {
    return (
      <div className="h-[340px] sm:h-[380px] w-full rounded-xl border border-white/15 bg-[#12141B] flex flex-col items-center justify-center p-6 text-center">
        <MapPin className="w-10 h-10 text-[#E5B842] mb-3" aria-hidden="true" />
        <p className="text-lg font-bold text-white">{MUSEUM_INFO.name}</p>
        <p className="mt-1 text-base text-slate-300">{MUSEUM_INFO.address}</p>
        <a
          href={MUSEUM_INFO.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-lg bg-[#E5B842] text-[#090A0D] hover:bg-[#F2C95C] text-base font-bold transition-colors"
        >
          <span>Google 지도 앱에서 보기</span>
          <ExternalLink className="w-4 h-4" aria-hidden="true" />
        </a>
      </div>
    );
  }

  const museumPos = {
    lat: MUSEUM_INFO.coordinates.latitude,
    lng: MUSEUM_INFO.coordinates.longitude,
  };

  return (
    <div className="h-[340px] sm:h-[380px] w-full rounded-xl overflow-hidden border border-white/15 bg-[#12141B]">
      <GoogleMap
        defaultCenter={museumPos}
        defaultZoom={16}
        mapId="DEMO_MAP_ID"
        gestureHandling="cooperative"
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        style={{ width: '100%', height: '100%' }}
      >
        <AdvancedMarker
          ref={markerRef}
          position={museumPos}
          title={MUSEUM_INFO.name}
          onClick={() => setInfoOpen(true)}
        >
          <Pin
            background="#E5B842"
            borderColor="#090A0D"
            glyphColor="#090A0D"
            scale={1.2}
          />
        </AdvancedMarker>

        {infoOpen && marker && (
          <InfoWindow
            anchor={marker}
            maxWidth={280}
            onCloseClick={() => setInfoOpen(false)}
          >
            <div className="text-[#090A0D] p-1">
              <p className="font-bold text-base">{MUSEUM_INFO.name}</p>
              <p className="text-sm text-slate-700 mt-0.5">
                {MUSEUM_INFO.address}
              </p>
              <a
                href={MUSEUM_INFO.googleMapsDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-[#102A56] hover:underline"
              >
                <span>Google 지도 앱 길찾기</span>
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}

export function MuseumGoogleMap() {
  const envKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  const [apiKey, setApiKey] = useState<string>(envKey || '');
  const [keyChecked, setKeyChecked] = useState<boolean>(Boolean(envKey));

  useEffect(() => {
    if (envKey) return;
    let active = true;
    fetch('/api/maps-config')
      .then((res) => res.json())
      .then((data: { apiKey?: string }) => {
        if (active && data.apiKey) {
          setApiKey(data.apiKey);
        }
      })
      .catch(() => {
        // Fallback link UI handles missing key gracefully
      })
      .finally(() => {
        if (active) setKeyChecked(true);
      });
    return () => {
      active = false;
    };
  }, [envKey]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <a
          href={MUSEUM_INFO.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 min-h-[46px] px-5 py-2.5 rounded-lg bg-[#E5B842] text-[#090A0D] hover:bg-[#F2C95C] text-base font-bold transition-colors whitespace-nowrap"
        >
          <MapPin className="w-5 h-5" aria-hidden="true" />
          <span>Google 지도 앱으로 열기</span>
          <ExternalLink className="w-4 h-4" aria-hidden="true" />
        </a>
        <a
          href={MUSEUM_INFO.googleMapsDirectionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 min-h-[46px] px-5 py-2.5 rounded-lg bg-[#1D202B] text-white border border-white/15 hover:border-[#E5B842] text-base font-semibold transition-colors whitespace-nowrap"
        >
          <Navigation className="w-4 h-4 text-[#E5B842]" aria-hidden="true" />
          <span>Google 지도 길찾기</span>
          <ExternalLink className="w-4 h-4" aria-hidden="true" />
        </a>
      </div>

      {apiKey ? (
        <APIProvider
          apiKey={apiKey}
          language="ko"
          region="KR"
          libraries={['marker']}
        >
          <MuseumMapCanvas />
        </APIProvider>
      ) : keyChecked ? (
        <div className="h-[240px] w-full rounded-xl border border-white/15 bg-[#12141B] flex flex-col items-center justify-center p-6 text-center">
          <MapPin className="w-9 h-9 text-[#E5B842] mb-2" aria-hidden="true" />
          <p className="text-lg font-bold text-white">{MUSEUM_INFO.name}</p>
          <p className="mt-1 text-base text-slate-300">{MUSEUM_INFO.address}</p>
          <p className="mt-2 text-sm text-slate-400">
            위 버튼을 누르면 Google 지도 앱에서 천안박물관 위치와 길찾기를 바로
            실행할 수 있습니다.
          </p>
        </div>
      ) : (
        <div className="h-[340px] sm:h-[380px] w-full rounded-xl border border-white/15 bg-[#12141B] flex items-center justify-center text-slate-300 text-base">
          Google 지도를 불러오는 중입니다...
        </div>
      )}
    </div>
  );
}
