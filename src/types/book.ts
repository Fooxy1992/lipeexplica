export type Categoria =
  | "Aquecimento"
  | "Coordenação"
  | "Jogos"
  | "Guarda"
  | "Passagem"
  | "Disciplina"
  | "Equipe"
  | "Competição"
  | "Encerramento";

export interface Dinamica {
  id: number;
  categoria: Categoria;
  titulo: string;
  idade: string;
  tempo: string;
  objetivo: string;
  materiais: string;
  passos: string[];
  variacoes?: string;
  dica?: string;
}
