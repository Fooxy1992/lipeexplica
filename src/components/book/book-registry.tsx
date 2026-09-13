import type { ComponentType } from "react";
import type { InitialProgress } from "@/hooks/use-reading-progress";
import { BookApp } from "./BookApp";
import { MentalApp } from "./MentalApp";

export interface BookReaderProps {
  productId: string;
  initialProgress: InitialProgress | null;
  accessLevel: 'full' | 'preview';
  previewPageIndices: number[];
}

/**
 * Registry: product slug → interactive reader component.
 * Adding a new ebook = add its reader here. Nothing else in the platform
 * is hardcoded to a single book.
 */
const registry: Record<string, ComponentType<BookReaderProps>> = {
  "dinamicas-jiu-jitsu-infantil": BookApp,
  "mental-do-tatame": MentalApp,
};

export function getBookReader(
  slug: string,
): ComponentType<BookReaderProps> | null {
  return registry[slug] ?? null;
}
