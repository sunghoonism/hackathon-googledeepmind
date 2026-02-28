"use client";

import { useState } from "react";
import { useEffect } from "react";
import { Search, MapPin, Map as MapIcon, Clock, Image as ImageIcon, Share2, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { MOCK_ROUTE_DATA, type RouteResponse } from "@/lib/mock-data";
import { Skeleton } from "@/components/ui/skeleton";
import MapView from "@/components/map-view";

const RECOMMENDED_DRAMAS = [
    { title: "눈물의 여왕", desc: "Queen of Tears", image: "https://images.unsplash.com/photo-1549492423-400259a2e574?q=80&w=200&h=300&fit=crop" },
    { title: "도깨비", desc: "Goblin", image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=200&h=300&fit=crop" },
    { title: "사랑의 불시착", desc: "Crash Landing on You", image: "https://images.unsplash.com/photo-1620986701140-5bfa17c093bf?q=80&w=200&h=300&fit=crop" },
    { title: "이태원 클라쓰", desc: "Itaewon Class", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=200&h=300&fit=crop" },
    { title: "빈센조", desc: "Vincenzo", image: "https://images.unsplash.com/photo-1513622470522-26c31154c1ff?q=80&w=200&h=300&fit=crop" },
    { title: "선재 업고 튀어", desc: "Lovely Runner", image: "https://images.unsplash.com/photo-1520696954207-6baafe0cdae1?q=80&w=200&h=300&fit=crop" },
];

export default function Home() {
    const [query, setQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [routeData, setRouteData] = useState<RouteResponse | null>(null);
    const { toast } = useToast();

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
                title: "Insert Title of Drama",
                description: "Example: Queen of Tears, Goblin",
                variant: "destructive",
            });
            return;
        }

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
                                    <p className="text-white font-bold text-sm md:text-base leading-tight drop-shadow-md">{drama.title}</p>
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

            {/* Loading Skeleton */}
            {isLoading && (
                <div className="grid md:grid-cols-5 gap-6 animate-in fade-in duration-500">
                    <Card className="md:col-span-3 h-[400px] md:h-[600px] shadow-lg rounded-xl border-0 ring-1 ring-border/50">
                        <CardHeader>
                            <Skeleton className="h-8 w-[200px]" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-full w-full min-h-[300px] md:min-h-[500px] rounded-lg" />
                        </CardContent>
                    </Card>
                    <Card className="md:col-span-2 shadow-lg rounded-xl border-0 ring-1 ring-border/50">
                        <CardHeader>
                            <Skeleton className="h-8 w-[150px]" />
                            <Skeleton className="h-4 w-[250px]" />
                        </CardHeader>
                        <CardContent className="space-y-6 mt-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex gap-4">
                                    <Skeleton className="h-12 w-12 rounded-full shrink-0" />
                                    <div className="space-y-2 w-full">
                                        <Skeleton className="h-5 w-[80%]" />
                                        <Skeleton className="h-4 w-full" />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
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
                                <Share2 size={16} /> 코스 공유하기
                            </Button>
                        </div>
                        <MapView spots={routeData.spots} />
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
                                                                    길찾기
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
    );
}
