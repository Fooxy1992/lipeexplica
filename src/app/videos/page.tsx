"use client";

import { useState } from "react";
import VideoCard from "@/components/VideoCard";
import { videos, categories } from "@/data/videos";

export default function VideosPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = activeCategory
    ? videos.filter((v) => v.category === activeCategory)
    : videos;

  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14 animate-fade-in-up">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-red mb-3">
            Biblioteca
          </p>
          <h1 className="text-4xl sm:text-5xl font-black text-[#fafafa]">Vídeos</h1>
          <p className="text-[#71717a] mt-3 text-lg">
            Explore nossos shorts por categoria
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <button
            id="filter-all"
            onClick={() => setActiveCategory(null)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
              activeCategory === null
                ? "bg-brand-red text-white shadow-lg shadow-brand-red/25"
                : "bg-white/5 border border-white/10 text-[#a1a1aa] hover:text-[#fafafa] hover:border-white/20"
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              id={`filter-${cat.toLowerCase()}`}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                activeCategory === cat
                  ? "bg-brand-red text-white shadow-lg shadow-brand-red/25"
                  : "bg-white/5 border border-white/10 text-[#a1a1aa] hover:text-[#fafafa] hover:border-white/20"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Count */}
        <p className="text-center text-[#52525b] text-sm mb-8 animate-fade-in" style={{ animationDelay: "0.15s" }}>
          {filtered.length} {filtered.length === 1 ? "vídeo" : "vídeos"}{" "}
          {activeCategory ? `em ${activeCategory}` : "no total"}
        </p>

        {/* Video Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {filtered.map((video, i) => (
            <div
              key={video.id}
              className="animate-scale-in"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <VideoCard {...video} />
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">🎬</div>
            <p className="text-[#52525b] font-medium">
              Nenhum vídeo nesta categoria ainda.
            </p>
            <button
              onClick={() => setActiveCategory(null)}
              className="mt-4 text-sm text-brand-red hover:text-brand-red-light transition-colors"
            >
              Ver todos os vídeos →
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
