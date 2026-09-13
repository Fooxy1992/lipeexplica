import Link from "next/link";
import Image from "next/image";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { BlogPost } from "@/data/blog";
import { cn } from "@/lib/utils";

/**
 * Card de artigo.
 * Só 1 dos 10 posts tem imagem, então o fallback não é um buraco cinza: é uma
 * faixa com a inicial da categoria, que fica consistente entre os cards.
 */
export function PostCard({
  post,
  className,
}: {
  post: BlogPost;
  className?: string;
}) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-border bg-card",
        "transition-[transform,border-color] duration-200 ease-[var(--ease)]",
        "hover:-translate-y-0.5 hover:border-[color-mix(in_oklab,var(--brand)_45%,transparent)]",
        className,
      )}
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-[var(--surface-2)]">
        {post.image ? (
          <Image
            src={post.image}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <span
            aria-hidden
            className="grid h-full w-full place-items-center"
            style={{
              background:
                "linear-gradient(135deg, color-mix(in oklab, var(--brand) 22%, var(--surface-2)) 0%, var(--surface-2) 70%)",
            }}
          >
            <span className="text-6xl font-black tracking-[-0.05em] text-[color-mix(in_oklab,var(--brand)_55%,transparent)]">
              {post.category.charAt(0)}
            </span>
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <span className="flex flex-wrap items-center gap-2">
          <Badge variant="brand">{post.category}</Badge>
          <span className="inline-flex items-center gap-1 text-caption text-muted-foreground">
            <Clock className="h-3 w-3" aria-hidden /> {post.readingTime}
          </span>
        </span>

        <h3 className="mt-3 text-h3 text-foreground">{post.title}</h3>

        <p className="mt-2 line-clamp-3 flex-1 text-body text-muted-foreground">
          {post.description}
        </p>

        <time
          dateTime={post.date}
          className="mt-4 text-caption text-muted-foreground"
        >
          {formatDate(post.date).split(",")[0]}
        </time>
      </div>
    </Link>
  );
}
