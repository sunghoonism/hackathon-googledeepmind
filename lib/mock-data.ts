export interface Spot {
    name: string;
    lat: number;
    lng: number;
    description: string;
}

export interface ItineraryItem {
    time: string;
    spotName: string;
}

export interface RouteResponse {
    drama: string;
    spots: Spot[];
    itinerary: ItineraryItem[];
    uiTranslations: {
        mapTitle: string;
        spotCount: string;
        timelineTitle: string;
        timelineSubtitle: string;
        successTitle: string;
        successDescription: string;
    }
}

export const MOCK_ROUTE_DATA: RouteResponse = {
    drama: "눈물의 여왕",
    spots: [
        {
            name: "용두리 마을 (가상의 마을 - 실제 촬영지: 괴산군 문광면)",
            lat: 36.7865,
            lng: 127.8175,
            description: "주인공 백현우의 고향인 용두리 마을의 배경이 된 평화로운 시골 풍경."
        },
        {
            name: "퀸즈 그룹 본사 (실제: 여의도 더현대 서울 인근 빌딩)",
            lat: 37.5255,
            lng: 126.9248,
            description: "홍해인이 대표로 있는 퀸즈 백화점 및 그룹 본사 외관."
        },
        {
            name: "별장 (실제: 양평 숲속의 집)",
            lat: 37.5140,
            lng: 127.3510,
            description: "두 사람이 시간을 보냈던 아름다운 숲속의 별장."
        }
    ],
    itinerary: [
        { time: "10:00", spotName: "퀸즈 그룹 본사 (여의도)" },
        { time: "12:30", spotName: "별장 (양평 숲속의 집) - 점심 및 산책" },
        { time: "15:00", spotName: "용두리 마을 (괴산군 문광면)" }
    ],
    uiTranslations: {
        mapTitle: "촬영지 지도",
        spotCount: "개의 스팟",
        timelineTitle: "추천 동선",
        timelineSubtitle: "당일치기 투어 스케줄",
        successTitle: "동선 생성 완료!",
        successDescription: "주요 촬영지 동선입니다."
    }
};
