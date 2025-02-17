"use client"
import React from "react";
import { useRouter } from "next/navigation";
import { Trophy, RefreshCcw, Play, ArrowRight } from "lucide-react";

export default function Home() {
  const router = useRouter();

  const resetTeams = async () => {
    await fetch("/api/indians", { method: "DELETE" });
    await fetch("/api/foreigners", { method: "DELETE" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/api/placeholder/20/20')] opacity-5" />
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-500/10 to-transparent" />
      
      <div className="relative z-10 max-w-6xl mx-auto px-4">
        <header className="pt-8 text-center">
          <div className="inline-block">
            <img 
              src="/api/placeholder/80/80" 
              alt="CodeChef Logo" 
              className="w-20 h-20 mx-auto mb-2"
            />
            <p className="text-blue-300 font-medium">CodeChef Student Chapter?</p>
          </div>
        </header>

        <main className="mt-12 flex flex-col lg:flex-row items-center justify-between gap-12 pb-12">
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-5xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-6">
              IPL Auction
              <span className="text-2xl lg:text-3xl block mt-2 text-blue-300">2024 Edition</span>
            </h1>
            
            <p className="text-lg text-gray-300 mb-8 max-w-xl">
              Experience the thrill of the IPL Auction! Build your dream team by bidding on top cricket talents from India and around the world.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={() => router.push("/auction/1")}
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg text-lg 
                         hover:from-blue-500 hover:to-blue-600 transition-all duration-300 
                         shadow-lg hover:shadow-blue-500/20"
              >
                <span className="flex items-center justify-center gap-2">
                  Begin Auction
                  <Play className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span> 
              </button>

              <button
                onClick={() => router.push("/winners")}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg text-lg 
                         hover:from-purple-500 hover:to-purple-600 transition-all duration-300
                         shadow-lg hover:shadow-purple-500/20"
              >
                <span className="flex items-center justify-center gap-2">
                  View Results
                  <Trophy className="w-5 h-5" />
                </span>
              </button>
            </div>
          </div>

          <div className="relative flex-1 flex justify-center items-center">
            <div className="relative w-full max-w-md aspect-square">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-3xl opacity-20 animate-pulse" />
              <img
                src="/api/placeholder/600/600"
                alt="event ka logo"
                className="relative z-10 w-full h-full object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </main>

        <div className="fixed bottom-6 right-6">
          <button
            onClick={resetTeams}
            className="p-3 bg-gray-800/80 backdrop-blur-sm rounded-lg text-gray-400 hover:text-white 
                     hover:bg-gray-700 transition-all duration-300 group"
            title="Reset Teams"
          >
            <RefreshCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
          </button>
        </div>

      </div>
    </div>
  );
}