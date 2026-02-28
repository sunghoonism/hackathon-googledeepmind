import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { MOCK_ROUTE_DATA } from "@/lib/mock-data";

// Type definition for expected output to help the AI structure its response
const responseSchema = {
    type: "object",
    properties: {
        drama: {
            type: "string",
            description: "입력된 드라마의 제목"
        },
        spots: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    name: { type: "string", description: "촬영지 장소명" },
                    lat: { type: "number", description: "장소의 위도 (Latitude)" },
                    lng: { type: "number", description: "장소의 경도 (Longitude)" },
                    description: { type: "string", description: "해당 드라마에서 어떻게 나왔는지, 어떤 장소인지에 대한 간략한 설명" },
                    imageSearchKeyword: { type: "string", description: "Google Places API에서 이 장소의 사진을 효과적으로 검색할 수 있는 키워드 (예: 장소명 + 드라마 제목 결합)" }
                },
                required: ["name", "lat", "lng", "description", "imageSearchKeyword"]
            },
            description: "주요 촬영지 3~5곳의 목록"
        },
        itinerary: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    time: { type: "string", description: "방문 시간 (예: '10:00', '13:00')" },
                    spotName: { type: "string", description: "방문할 촬영지 장소명 (spots에 있는 name과 일치해야 함)" }
                },
                required: ["time", "spotName"]
            },
            description: "당일치기 여행 동선 타임라인 (시간대별 방문 장소)"
        },
        uiTranslations: {
            type: "object",
            properties: {
                mapTitle: { type: "string", description: "번역된 텍스트: '촬영지 지도'" },
                spotCount: { type: "string", description: "번역된 텍스트: '개의 스팟'" },
                timelineTitle: { type: "string", description: "번역된 텍스트: '추천 동선'" },
                timelineSubtitle: { type: "string", description: "번역된 텍스트: '당일치기 투어 스케줄'" },
                successTitle: { type: "string", description: "번역된 텍스트: '동선 생성 완료!'" },
                successDescription: { type: "string", description: "번역된 텍스트: '주요 촬영지 동선입니다.'" }
            },
            required: ["mapTitle", "spotCount", "timelineTitle", "timelineSubtitle", "successTitle", "successDescription"],
            description: "UI 화면에 표시될 텍스트들의 다국어 번역본 데이터"
        },
        themeColor: {
            type: "string",
            description: "드라마의 전반적인 분위기와 어울리는 메인 포인트 컬러 (Hex 코드, 예: '#db2777')"
        }
    },
    required: ["drama", "spots", "itinerary", "uiTranslations", "themeColor"]
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { query } = body;

        if (!query) {
            return NextResponse.json({ error: "검색어가 필요합니다." }, { status: 400 });
        }

        if (!process.env.GEMINI_API_KEY) {
            console.warn("GEMINI_API_KEY is not defined. Falling back to mock data.");
            return NextResponse.json(MOCK_ROUTE_DATA);
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const prompt = `
당신은 K-드라마 팬들을 위한 전문 여행 가이드입니다. 
사용자가 입력한 드라마 제목을 기반으로 한국 내 주요 촬영지(3~5곳)를 찾아내고, 하루(당일치기) 동안 둘러보기 좋은 성지순례 동선을 계획해주세요.
검색 성능과 안전성을 위해 존재하는 실제 장소들의 대략적인 위도(lat)와 경도(lng)를 반드시 포함해야 합니다.

드라마 제목: "${query}"

[중요 지시사항 - 다국어 자동 지원]
사용자가 입력한 "드라마 제목"의 언어(한국어, 영어, 일본어, 중국어, 프랑스어, 베트남어, 태국어, 스페인어, 아랍어 등 **모든 언어**)를 자동으로 감지하세요.
그리고 응답하는 JSON 데이터 내의 **모든 텍스트**(장소명, 장소별 설명, 시간, 그리고 \`uiTranslations\` 객체 내의 모든 UI 텍스트 값들)를 **반드시 감지된 해당 언어로 번역해서** 작성해야 합니다.

제공된 JSON Schema 형식에 맞추어 완벽한 JSON 형식으로만 응답하세요. 다른 부가적인 텍스트는 출력하지 마세요.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            }
        });

        if (response.text) {
            const jsonResponse = JSON.parse(response.text);

            // Google Places API를 통해 사진 동적 가져오기
            const mapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
            if (mapsApiKey) {
                await Promise.all(jsonResponse.spots.map(async (spot: any) => {
                    try {
                        const searchBox = spot.imageSearchKeyword || (spot.name + ' ' + jsonResponse.drama);
                        const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchBox)}&key=${mapsApiKey}`;
                        const placeRes = await fetch(searchUrl);
                        const placeData = await placeRes.json();

                        if (placeData.results && placeData.results.length > 0) {
                            const photos = placeData.results[0].photos;
                            if (photos && photos.length > 0) {
                                spot.imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photos[0].photo_reference}&key=${mapsApiKey}`;
                            }
                        }
                    } catch (e) {
                        console.error("Place photo fetch error for", spot.name, e);
                    }
                }));
            }

            return NextResponse.json(jsonResponse);
        } else {
            throw new Error("No text response from Gemini API");
        }
    } catch (error) {
        console.error("API Error:", error);
        // 에러 발생 시 무조건 앱이 죽지 않게 Mock Data 반환 (Hackathon Rule)
        return NextResponse.json(MOCK_ROUTE_DATA);
    }
}
