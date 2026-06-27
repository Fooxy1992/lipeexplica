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
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-gray-900">Vídeos</h1>
          <p className="text-gray-500 mt-2">Explore nossos shorts por categoria</p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === null
                ? "bg-brand-red text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-brand-red text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filtered.map((video) => (
            <VideoCard key={video.id} {...video} />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-gray-400 mt-12">
            Nenhum vídeo nesta categoria ainda.
          </p>
        )}
      </div>
    </section>
  );
}
