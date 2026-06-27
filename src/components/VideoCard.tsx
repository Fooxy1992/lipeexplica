import Image from "next/image";

interface VideoCardProps {
  title: string;
  thumbnail: string;
  category: string;
  youtubeUrl: string;
}

export default function VideoCard({ title, thumbnail, category, youtubeUrl }: VideoCardProps) {
  return (
    <a
      href={youtubeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-2xl overflow-hidden bg-white border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative aspect-[9/16] bg-gray-100">
        <Image
          src={thumbnail}
          alt={title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <svg
            className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
      <div className="p-4">
        <span className="inline-block text-xs font-semibold text-brand-red uppercase tracking-wider mb-1">
          {category}
        </span>
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-brand-red transition-colors">
          {title}
        </h3>
      </div>
    </a>
  );
}
