export interface Pet {
  id: number;
  nome: string;
  especie: string;
  porte: string;
  idade: number;
  descricao: string;
  imagem_url: string;
  disponivel_adocao: boolean;
  usuario_id: number;
}

export interface Vacina {
  id: number;
  pet_id: number;
  nome: string;
  data_aplicacao: string;
  proxima_dose: string | null;
}
