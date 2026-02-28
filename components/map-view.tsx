"use client";

import { useMemo } from "react";
import { GoogleMap, useLoadScript, MarkerF } from "@react-google-maps/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Map as MapIcon } from "lucide-react";
import type { Spot } from "@/lib/mock-data";

interface MapViewProps {
    spots: Spot[];
    languageCode?: string;
}

const mapContainerStyle = {
    width: "100%",
    height: "100%",
};

export default function MapView({ spots, languageCode }: MapViewProps) {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
        language: languageCode || "ko",
    });

    const center = useMemo(() => {
        if (spots.length === 0) return { lat: 37.5665, lng: 126.9780 }; // Default: Seoul

        // Calculate bounds or simple average center
        const avgLat = spots.reduce((sum, spot) => sum + spot.lat, 0) / spots.length;
        const avgLng = spots.reduce((sum, spot) => sum + spot.lng, 0) / spots.length;
        return { lat: avgLat, lng: avgLng };
    }, [spots]);

    if (loadError) {
        return (
            <div className="flex-1 bg-slate-100 flex items-center justify-center flex-col gap-4 text-destructive p-4 text-center">
                <MapIcon size={48} className="text-destructive/50 mb-2" />
                <p className="font-bold">Google Maps를 불러오는 데 실패했습니다.</p>
                <p className="text-sm">API 키 또는 네트워크 상태를 확인해주세요.</p>
            </div>
        );
    }

    if (!isLoaded) {
        return <Skeleton className="w-full h-full min-h-[400px]" />;
    }

    return (
        <div className="relative w-full h-full flex-1">
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                zoom={10}
                center={center}
                options={{
                    disableDefaultUI: false,
                    zoomControl: true,
                    mapTypeControl: false,
                    streetViewControl: false,
                }}
            >
                {spots.map((spot, index) => (
                    <MarkerF
                        key={`${spot.lat}-${spot.lng}-${index}`}
                        position={{ lat: spot.lat, lng: spot.lng }}
                        label={{
                            text: `${index + 1}`,
                            color: "white",
                            fontWeight: "bold",
                        }}
                    />
                ))}
            </GoogleMap>
        </div>
    );
}
