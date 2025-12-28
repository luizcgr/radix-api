import * as bcrypt from 'bcrypt';

export class HashSenha {
  readonly value: string;

  constructor(senha: string) {
    this.value = bcrypt.hashSync(senha, 11);
  }

  static comparar(senhaEmBranco: string, senhaCriptografada: string): boolean {
    return bcrypt.compareSync(senhaEmBranco, senhaCriptografada);
  }
}
