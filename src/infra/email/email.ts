import { AnexoEmail } from './anexo-email';

export type Email = {
  assunto: string;
  endereco: string;
  texto: string;
  anexos?: AnexoEmail[];
};
