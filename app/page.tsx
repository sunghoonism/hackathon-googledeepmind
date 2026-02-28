"use client";

import { useState } from "react";
import { Search, MapPin, Map as MapIcon, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { MOCK_ROUTE_DATA, type RouteResponse } from "@/lib/mock-data";
import { Skeleton } from "@/components/ui/skeleton";
import MapView from "@/components/map-view";

export default function Home() {
    const [query, setQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [routeData, setRouteData] = useState<RouteResponse | null>(null);
    const { toast } = useToast();

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) {
            toast({
                title: "드라마 제목을 입력해주세요",
                description: "예: 눈물의 여왕, 도깨비 등",
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
                body: JSON.stringify({ query })
            });
            const data = await res.json();

            // Check if backend returned the mock data as a fallback (it has "용두리 마을" typically) or a real one.
            setRouteData(data);

            toast({
                title: "동선 생성 완료!",
                description: `'${data.drama || query}'의 주요 촬영지 동선입니다.`,
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

    return (
        <div className="flex flex-col gap-8 w-full">
            {/* Hero Search Section */}
            <section className="flex flex-col items-center justify-center space-y-6 py-12 md:py-24 text-center">
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                        K-Pilgrimage Assistant
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-[600px] mx-auto">
                        당신의 최애 K-드라마 성지순례를 완벽하게.
                        <br className="hidden md:block" />
                        AI가 추천하는 1일 당일치기 동선을 확인해보세요.
                    </p>
                </div>

                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row w-full max-w-2xl gap-3 px-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="드라마 제목을 입력하세요 (예: 눈물의 여왕)"
                            className="pl-10 h-14 text-lg rounded-xl shadow-sm border-2 focus-visible:ring-primary/20"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                    <Button type="submit" size="lg" className="h-14 px-8 rounded-xl font-bold text-lg w-full sm:w-auto shadow-md" disabled={isLoading}>
                        {isLoading ? "탐색 중..." : "동선 생성하기"}
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
                <div className="grid md:grid-cols-5 gap-6 animate-in slide-in-from-bottom-8 duration-700">

                    {/* Map View */}
                    <Card className="md:col-span-3 h-[500px] md:h-[700px] shadow-xl border-0 overflow-hidden flex flex-col relative">
                        <div className="absolute top-4 left-4 z-10 bg-background/90 backdrop-blur-sm p-3 rounded-lg shadow-sm border pointer-events-none">
                            <h3 className="font-bold flex items-center gap-2"><MapIcon size={18} className="text-primary" /> 촬영지 지도</h3>
                            <p className="text-sm text-muted-foreground">{routeData.spots.length}개의 스팟</p>
                        </div>
                        <MapView spots={routeData.spots} />
                    </Card>

                    {/* Timeline View */}
                    <Card className="md:col-span-2 shadow-xl border-0 flex flex-col h-[500px] md:h-[700px]">
                        <CardHeader className="bg-primary/5 border-b pb-6">
                            <CardTitle className="text-2xl font-bold flex items-center gap-2">
                                <Clock className="text-primary" /> 추천 동선
                            </CardTitle>
                            <CardDescription className="text-base text-slate-600">
                                <span className="font-semibold text-primary">{routeData.drama}</span> 당일치기 투어 스케줄
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="flex-1 overflow-y-auto pt-6 px-6">
                            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">

                                {routeData.itinerary.map((item, index) => {
                                    const spotDetails = routeData.spots.find(s => item.spotName.includes(s.name.split(" ")[0]));

                                    return (
                                        <div key={index} className="relative flex items-start justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                            {/* Timeline Icon */}
                                            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-slate-200 group-[.is-active]:bg-primary group-[.is-active]:text-primary-foreground text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10 transition-colors">
                                                <span className="text-xs font-bold">{index + 1}</span>
                                            </div>

                                            {/* Timeline Content */}
                                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] pl-4 md:pl-0 md:group-odd:pr-6 md:group-even:pl-6 pb-2">
                                                <div className="flex flex-col mb-1 group-[.is-active]:text-foreground">
                                                    <time className="text-sm font-semibold text-primary/80 mb-1">{item.time}</time>
                                                    <h4 className="font-bold text-lg leading-tight mb-2">{item.spotName}</h4>
                                                    {spotDetails && (
                                                        <p className="text-sm text-muted-foreground line-clamp-2 md:line-clamp-none bg-muted/50 p-3 rounded-lg border border-border/50">
                                                            {spotDetails.description}
                                                        </p>
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
