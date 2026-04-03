import { Regional } from 'src/modules/regionais/types/regional';

export type Missao = {
  id: number;
  nome: string;
  ativo: boolean;
  regional: Regional;
};
