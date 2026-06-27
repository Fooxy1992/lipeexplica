import Image from "next/image";

interface VideoCardProps {
  title: string;
  thumbnail: string;
  category: string;
  youtubeUrl: string;
}

const categoryColors: Record<string, string> = {
  "Ciência": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Psicologia": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "Curiosidades": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "História": "bg-green-500/10 text-green-400 border-green-500/20",
};

export default function VideoCard({ title, thumbnail, category, youtubeUrl }: VideoCardProps) {
  const colorClass = categoryColors[category] ?? "bg-red-500/10 text-red-400 border-red-500/20";

  return (
    <a
      href={youtubeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-2xl overflow-hidden gradient-card hover:shadow-2xl hover:shadow-black/40 transition-all duration-400 hover:-translate-y-2"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[9/16] bg-[#18181b] overflow-hidden">
        <Image
          src={thumbnail}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="video-play-btn">
            <svg className="w-6 h-6 text-white translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* Category badge on image */}
        <div className="absolute top-3 left-3">
          <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border ${colorClass} backdrop-blur-sm`}>
            {category}
          </span>
        </div>

        {/* YouTube icon */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-[#e4e4e7] leading-snug line-clamp-2 group-hover:text-white transition-colors duration-200">
          {title}
        </h3>
        <p className="mt-2 text-xs text-[#52525b] flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
          YouTube Shorts
        </p>
      </div>
    </a>
  );
}
