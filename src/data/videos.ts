export interface Video {
  id: string;
  title: string;
  thumbnail: string;
  category: string;
  youtubeUrl: string;
}

export const videos: Video[] = [
  {
    id: "sleep-with-fire",
    title: "Por que nossos ancestrais dormiam perto do fogo?",
    thumbnail: "/thumbnails/sleep-with-fire.png",
    category: "Ciência",
    youtubeUrl: "https://youtube.com/@lipeexplica",
  },
  {
    id: "falling-asleep",
    title: "Por que você sente que está caindo ao dormir?",
    thumbnail: "/thumbnails/falling-asleep.png",
    category: "Ciência",
    youtubeUrl: "https://youtube.com/@lipeexplica",
  },
  {
    id: "fake-memories",
    title: "Suas memórias podem ser falsas",
    thumbnail: "/thumbnails/fake-memories.png",
    category: "Psicologia",
    youtubeUrl: "https://youtube.com/@lipeexplica",
  },
  {
    id: "time-perception",
    title: "Por que o tempo passa mais rápido quando envelhecemos?",
    thumbnail: "/thumbnails/time-perception.png",
    category: "Ciência",
    youtubeUrl: "https://youtube.com/@lipeexplica",
  },
  {
    id: "deja-vu",
    title: "O que realmente causa o Déjà Vu?",
    thumbnail: "/thumbnails/deja-vu.png",
    category: "Psicologia",
    youtubeUrl: "https://youtube.com/@lipeexplica",
  },
  {
    id: "yawning",
    title: "Por que bocejar é contagioso?",
    thumbnail: "/thumbnails/yawning.png",
    category: "Curiosidades",
    youtubeUrl: "https://youtube.com/@lipeexplica",
  },
];

export const categories = [...new Set(videos.map((v) => v.category))];
