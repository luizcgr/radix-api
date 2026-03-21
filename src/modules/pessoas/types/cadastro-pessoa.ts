export type CadastroPessoa = {
  id?: number;
  nome: string;
  cpf: string;
  email: string;
  celulaId: number;
  permissoes: {
    missao: boolean;
    setor: boolean;
    celula: boolean;
    admin: boolean;
  };
};
