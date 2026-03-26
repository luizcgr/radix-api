import { validateSync } from 'class-validator';
import { IsCpf } from './cpf.validator';

class CpfDto {
  @IsCpf()
  cpf: string;
}

describe('IsCpf', () => {
  it('deve validar CPF válido com zeros à esquerda', () => {
    const dto = new CpfDto();
    dto.cpf = '00000000191';

    const errors = validateSync(dto);

    expect(errors).toHaveLength(0);
  });

  it('deve rejeitar CPF com caracteres não numéricos', () => {
    const dto = new CpfDto();
    dto.cpf = '061.260.130-34';

    const errors = validateSync(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].constraints?.isCpf).toBeDefined();
  });

  it('deve rejeitar CPF com dígitos verificadores inválidos', () => {
    const dto = new CpfDto();
    dto.cpf = '06126013035';

    const errors = validateSync(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].constraints?.isCpf).toBeDefined();
  });
});
