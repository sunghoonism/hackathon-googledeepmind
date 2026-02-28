"use client";

import { useState, useEffect, useRef } from "react";
import { Search, MapPin, Map as MapIcon, Clock, Image as ImageIcon, Share2, ExternalLink, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { MOCK_ROUTE_DATA, type RouteResponse } from "@/lib/mock-data";
import { Skeleton } from "@/components/ui/skeleton";
import MapView from "@/components/map-view";

const RECOMMENDED_DRAMAS = [
    { title: "눈물의 여왕", desc: "Queen of Tears", image: "https://upload.wikimedia.org/wikipedia/en/thumb/e/e2/Queen_of_Tears_poster.png/250px-Queen_of_Tears_poster.png" },
    { title: "도깨비", desc: "Goblin", image: "https://upload.wikimedia.org/wikipedia/en/thumb/6/68/Goblin_Poster.jpg/250px-Goblin_Poster.jpg" },
    { title: "사랑의 불시착", desc: "Crash Landing on You", image: "https://upload.wikimedia.org/wikipedia/en/6/64/Crash_Landing_on_You_main_poster.jpg" },
    { title: "이태원 클라쓰", desc: "Itaewon Class", image: "https://upload.wikimedia.org/wikipedia/en/thumb/9/99/Itaewon_Class.jpg/250px-Itaewon_Class.jpg" },
    { title: "빈센조", desc: "Vincenzo", image: "https://upload.wikimedia.org/wikipedia/en/thumb/5/5b/Vincenzo_TV_series.jpg/250px-Vincenzo_TV_series.jpg" },
    { title: "선재 업고 튀어", desc: "Lovely Runner", image: "https://upload.wikimedia.org/wikipedia/en/thumb/6/67/Lovely_Runner.png/250px-Lovely_Runner.png" },
];

export default function Home() {
    const [query, setQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState(0);
    const [loadingLang, setLoadingLang] = useState<"ko" | "en" | "ja" | "zh" | "vi" | "fr" | "es" | "th">("ko");
    const [routeData, setRouteData] = useState<RouteResponse | null>(null);
    const resultRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    // Multilingual loading texts
    const LOADING_TEXTS = {
        ko: [
            "드라마 정보를 분석하고 있습니다...",
            "주요 촬영지를 탐색하는 중...",
            "최적의 당일치기 동선을 계산하고 있습니다...",
            "여행 스케줄을 정리하는 중...",
            "거의 다 완료되었습니다! 🚀"
        ],
        en: [
            "Analyzing drama information...",
            "Exploring major filming locations...",
            "Calculating the optimal day trip route...",
            "Organizing the travel itinerary...",
            "Almost done! 🚀"
        ],
        ja: [
            "ドラマの情報を分析しています...",
            "主要なロケ地を探索中...",
            "最適な日帰りルートを計算しています...",
            "旅行のスケジュールを整理中...",
            "もうすぐ完了します！ 🚀"
        ],
        zh: [
            "正在分析韩剧信息...",
            "正在探索主要拍摄地...",
            "正在计算最佳一日游路线...",
            "正在整理旅行日程...",
            "马上就好！ 🚀"
        ],
        vi: [
            "Đang phân tích thông tin phim...",
            "Đang khám phá các địa điểm quay phim...",
            "Đang tính toán tuyến đường tốt nhất...",
            "Đang sắp xếp lịch trình...",
            "Sắp hoàn thành! 🚀"
        ],
        fr: [
            "Analyse des informations sur le drama...",
            "Exploration des lieux de tournage...",
            "Calcul du meilleur itinéraire...",
            "Organisation du programme...",
            "Presque terminé ! 🚀"
        ],
        es: [
            "Analizando la información del drama...",
            "Explorando los lugares de grabación...",
            "Calculando la mejor ruta...",
            "Organizando el itinerario...",
            "¡Casi listo! 🚀"
        ],
        th: [
            "กำลังวิเคราะห์ข้อมูลละคร...",
            "กำลังสำรวจสถานที่ถ่ายทำ...",
            "กำลังคำนวณเส้นทางที่ดีที่สุด...",
            "กำลังจัดเตรียมตารางการเดินทาง...",
            "เกือบเสร็จแล้ว! 🚀"
        ]
    };

    // Quick regex-based language detection
    const detectLanguageFallback = (text: string): "ko" | "en" | "ja" | "zh" | "vi" | "fr" | "es" | "th" => {
        if (/[가-힣]/.test(text)) return "ko";
        if (/[\u3040-\u30ff]/.test(text)) return "ja"; // Hiragana/Katakana
        if (/[\u4e00-\u9fa5]/.test(text)) return "zh"; // CJK Unified Ideographs (Kanji/Hanzi)
        if (/[\u0E00-\u0E7F]/.test(text)) return "th"; // Thai
        // Vietnamese has very specific diacritics
        if (/[àáảãạăằắẳẵặâầấẩẫậđèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ]/i.test(text)) return "vi";
        // French-specific or Spanish-specific chars check
        if (/[ñ¿¡]/i.test(text) || (/[áéíóú]/i.test(text) && !/[àâçèêëîïôœùû]/i.test(text))) return "es";
        if (/[àâæçéèêëîïôœùûüÿ]/i.test(text)) return "fr";
        return "en"; // Default fallback
    };

    // Cycle through loading steps
    useEffect(() => {
        if (!isLoading) {
            setLoadingStep(0);
            return;
        }

        // Auto scroll to loading view when search starts
        setTimeout(() => {
            resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);

        const interval = setInterval(() => {
            setLoadingStep((prev) => (prev < LOADING_TEXTS[loadingLang].length - 1 ? prev + 1 : prev));
        }, 3000); // Change step every 2 seconds

        return () => clearInterval(interval);
    }, [isLoading, loadingLang]);

    // Auto scroll when results arrive
    useEffect(() => {
        if (routeData && !isLoading) {
            setTimeout(() => {
                resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }, [routeData, isLoading]);

    // Check URL parameters for shared data
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const sharedData = params.get('data');
        if (sharedData) {
            try {
                const decodedStr = decodeURIComponent(atob(sharedData));
                const parsedData = JSON.parse(decodedStr);
                setRouteData(parsedData);
            } catch (error) {
                console.error("Failed to parse shared data", error);
            }
        }
    }, []);

    const handleShare = () => {
        if (!routeData) return;
        try {
            const jsonStr = JSON.stringify(routeData);
            const encodedData = btoa(encodeURIComponent(jsonStr));
            const shareUrl = `${window.location.origin}${window.location.pathname}?data=${encodedData}`;
            navigator.clipboard.writeText(shareUrl);
            toast({
                title: "링크 복사 완료!",
                description: "코스 링크가 클립보드에 복사되었습니다. 친구에게 공유해보세요!",
            });
        } catch (error) {
            console.error("Failed to generate share link", error);
            toast({
                title: "공유 실패",
                description: "링크 생성 중 오류가 발생했습니다.",
                variant: "destructive"
            });
        }
    };

    const handleSearch = async (e?: React.FormEvent, directQuery?: string) => {
        if (e) e.preventDefault();

        const searchQuery = directQuery || query;

        if (!searchQuery.trim()) {
            toast({
                title: "Insert the title of K-Drama",
                description: "Example: Queen of Tears, Goblin",
                variant: "destructive",
            });
            return;
        }

        const detectedLang = detectLanguageFallback(searchQuery);
        setLoadingLang(detectedLang);
        setIsLoading(true);
        setRouteData(null); // Clear previous results

        try {
            const res = await fetch("/api/generate-route", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: searchQuery })
            });
            const data = await res.json();

            // Check if backend returned the mock data as a fallback (it has "용두리 마을" typically) or a real one.
            setRouteData(data);

            toast({
                title: data.uiTranslations?.successTitle || "동선 생성 완료!",
                description: data.uiTranslations?.successDescription || `'${data.drama || searchQuery}'의 주요 촬영지 동선입니다.`,
            });
        } catch (error) {
            console.error(error);
            setRouteData(MOCK_ROUTE_DATA);
            toast({
                title: "API 요청 실패",
                description: "기본 예제 데이터로 대체합니다.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Apply dynamic theme color if available
    const themeStyle = routeData?.themeColor ? { '--primary-color': routeData.themeColor } as React.CSSProperties : {};

    return (
        <div className="flex flex-col gap-8 w-full" style={themeStyle}>
            {/* Hero Search Section */}
            <section className="flex flex-col items-center justify-center space-y-6 py-12 md:py-24 text-center">
                <div className="space-y-4">
                    <h1
                        className="text-4xl md:text-6xl font-extrabold tracking-tighter bg-clip-text text-transparent transition-colors duration-500"
                        style={{ backgroundImage: routeData?.themeColor ? `linear-gradient(to right, ${routeData.themeColor}, #f472b6)` : 'linear-gradient(to right, #9333ea, #ec4899)' }}
                    >
                        K-Pilgrimage Assistant
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground font-medium">
                        K-드라마 성지순례 도우미
                    </p>
                </div>

                {/* Recommended Dramas Marquee Slider */}
                <div className="w-full max-w-5xl overflow-hidden py-4 -mx-4 md:mx-0 relative [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
                    <div className="flex w-max gap-4 animate-marquee hover:[animation-play-state:paused] px-4">
                        {[...RECOMMENDED_DRAMAS, ...RECOMMENDED_DRAMAS].map((drama, idx) => (
                            <div
                                key={idx}
                                className="group relative w-32 h-44 md:w-40 md:h-56 rounded-xl overflow-hidden shrink-0 cursor-pointer transition-transform hover:scale-105"
                                onClick={() => {
                                    setQuery(drama.title);
                                    handleSearch(undefined, drama.title);
                                }}
                            >
                                <img src={drama.image} alt={drama.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                                    <p className="text-white/80 text-xs truncate drop-shadow-md">{drama.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row w-full max-w-2xl gap-3 px-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Insert Title of Drama"
                            className="pl-10 h-14 text-lg rounded-xl shadow-sm border-2 focus-visible:ring-primary/20"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                    <Button
                        type="submit"
                        size="lg"
                        className="h-14 px-8 rounded-xl font-bold text-lg w-full sm:w-auto shadow-md text-white transition-colors duration-500"
                        disabled={isLoading}
                        style={{ backgroundColor: routeData?.themeColor || 'hsl(var(--primary))' }}
                    >
                        {isLoading ? "Searching..." : "Generate Route"}
                    </Button>
                </form>
            </section>

            <div ref={resultRef} className="w-full flex flex-col items-center scroll-mt-6">
                {/* Loading State */}
                {isLoading && (
                    <div className="w-full flex flex-col items-center justify-center py-20 px-4 animate-in fade-in duration-500">
                        <div className="relative flex items-center justify-center w-24 h-24 mb-8">
                            <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-pulse"></div>
                            <Loader2 className="w-12 h-12 text-primary animate-spin" style={{ color: routeData?.themeColor || 'hsl(var(--primary))' }} />
                        </div>
                        <h3 className="text-2xl font-bold mb-3 text-center transition-all duration-300 ease-in-out">
                            {LOADING_TEXTS[loadingLang][loadingStep]}
                        </h3>
                        <p className="text-muted-foreground text-center max-w-md">
                            {loadingLang === "ko" && "AI가 수많은 데이터를 분석하여 최고의 여행 코스를 만들고 있습니다. 잠시만 기다려주세요!"}
                            {loadingLang === "en" && "AI is analyzing vast amounts of data to create the best travel route. Please wait a moment!"}
                            {loadingLang === "ja" && "AIが膨大なデータを分析し、最高の旅行ルートを作成しています。少々お待ちください！"}
                            {loadingLang === "zh" && "AI正在分析海量数据，为您打造最佳旅行路线。请稍候！"}
                            {loadingLang === "vi" && "AI đang phân tích lượng dữ liệu để tạo ra tuyến đường tốt nhất. Vui lòng đợi!"}
                            {loadingLang === "fr" && "L'IA analyse les données pour créer le meilleur itinéraire. Veuillez patienter !"}
                            {loadingLang === "es" && "La IA está analizando los datos para crear la mejor ruta. ¡Espera un momento!"}
                            {loadingLang === "th" && "AI กำลังวิเคราะห์ข้อมูลเพื่อสร้างเส้นทางที่ดีที่สุด โปรดรอสักครู่!"}
                        </p>

                        {/* Stepper Dots */}
                        <div className="flex gap-2 mt-8">
                            {LOADING_TEXTS[loadingLang].map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`h-2 rounded-full transition-all duration-500 ${idx === loadingStep ? 'w-8 bg-primary' : idx < loadingStep ? 'w-2 bg-primary/50' : 'w-2 bg-slate-200'}`}
                                    style={idx <= loadingStep ? { backgroundColor: routeData?.themeColor || 'hsl(var(--primary))' } : {}}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Result Dashboard */}
                {routeData && !isLoading && (
                    <div className="flex flex-col gap-8 w-full max-w-5xl animate-in slide-in-from-bottom-8 duration-700 px-4">

                        {/* Map View */}
                        <Card className="w-full h-[400px] md:h-[600px] shadow-xl border-0 overflow-hidden flex flex-col relative transition-shadow duration-500 hover:shadow-2xl">
                            <div className="absolute top-4 left-4 z-10 bg-background/90 backdrop-blur-sm p-3 rounded-lg shadow-sm border pointer-events-none">
                                <h3 className="font-bold flex items-center gap-2"><MapIcon size={18} style={{ color: routeData?.themeColor || 'hsl(var(--primary))' }} /> {routeData.uiTranslations?.mapTitle || "촬영지 지도"}</h3>
                                <p className="text-sm text-muted-foreground">{routeData.spots.length} {routeData.uiTranslations?.spotCount || "개의 스팟"}</p>
                            </div>
                            <div className="absolute top-4 right-4 z-10">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="shadow-md bg-white hover:bg-slate-100 text-slate-700 font-semibold flex gap-2"
                                    onClick={handleShare}
                                >
                                    <Share2 size={16} /> {routeData.uiTranslations?.shareButton || "코스 공유하기"}
                                </Button>
                            </div>
                            <MapView spots={routeData.spots} languageCode={routeData.languageCode} />
                        </Card>

                        {/* Timeline View */}
                        <Card className="w-full shadow-xl border-0 flex flex-col mb-8 transition-shadow duration-500 hover:shadow-2xl">
                            <CardHeader className="border-b pb-6" style={{ backgroundColor: routeData?.themeColor ? `${routeData.themeColor}15` : 'hsl(var(--primary)/0.05)' }}>
                                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                                    <Clock style={{ color: routeData?.themeColor || 'hsl(var(--primary))' }} /> {routeData.uiTranslations?.timelineTitle || "추천 동선"}
                                </CardTitle>
                                <CardDescription className="text-base text-slate-600">
                                    <span className="font-semibold text-primary">{routeData.drama}</span> {routeData.uiTranslations?.timelineSubtitle || "당일치기 투어 스케줄"}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="flex-1 overflow-y-auto pt-6 px-6">
                                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">

                                    {routeData.itinerary.map((item, index) => {
                                        const spotDetails = routeData.spots.find(s => item.spotName.includes(s.name.split(" ")[0]));

                                        return (
                                            <div key={index} className="relative flex items-start justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                                {/* Timeline Icon */}
                                                <div
                                                    className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-slate-200 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10 transition-colors duration-500"
                                                    style={{ backgroundColor: routeData?.themeColor || 'hsl(var(--primary))' }}
                                                >
                                                    <span className="text-xs font-bold">{index + 1}</span>
                                                </div>

                                                {/* Timeline Content */}
                                                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] pl-4 md:pl-0 md:group-odd:pr-6 md:group-even:pl-6 pb-2">
                                                    <div className="flex flex-col mb-1 group-[.is-active]:text-foreground">
                                                        <time
                                                            className="text-sm font-semibold mb-1"
                                                            style={{ color: routeData?.themeColor || 'hsl(var(--primary))' }}
                                                        >
                                                            {item.time}
                                                        </time>
                                                        <h4 className="font-bold text-lg leading-tight mb-2">{item.spotName}</h4>
                                                        {spotDetails && (
                                                            <div className="flex flex-col gap-3">
                                                                <p className="text-sm text-muted-foreground line-clamp-2 md:line-clamp-none bg-muted/50 p-3 rounded-lg border border-border/50">
                                                                    {spotDetails.description}
                                                                </p>
                                                                {spotDetails.imageUrl ? (
                                                                    <div className="w-full h-48 md:h-64 rounded-xl overflow-hidden shadow-sm relative group/img">
                                                                        <img src={spotDetails.imageUrl} alt={item.spotName} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                                                                    </div>
                                                                ) : (
                                                                    <div className="w-full h-48 md:h-64 rounded-xl overflow-hidden shadow-sm bg-slate-100 flex flex-col items-center justify-center text-muted-foreground/50 border border-slate-200">
                                                                        <ImageIcon className="h-10 w-10 mb-2" />
                                                                        <span className="text-xs">No image available</span>
                                                                    </div>
                                                                )}
                                                                <div className="flex justify-end mt-2">
                                                                    <a
                                                                        href={`https://map.kakao.com/link/to/${spotDetails.name.split(' (')[0]},${spotDetails.lat},${spotDetails.lng}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 rounded-md px-4 gap-2 text-white shadow"
                                                                        style={{ backgroundColor: routeData?.themeColor || 'hsl(var(--primary))' }}
                                                                    >
                                                                        <ExternalLink size={14} />
                                                                        {routeData.uiTranslations?.directionsButton || "길찾기"}
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}

                                </div>
                            </CardContent>
                        </Card>

                    </div>
                )}
            </div>
        </div>
    );
}
