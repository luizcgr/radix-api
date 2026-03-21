import { map, OperatorFunction } from 'rxjs';

export abstract class ModelMapper<M, E> {
  abstract map(model: M): E | null;

  mapList(models: M[]): E[] {
    if (!models || !Array.isArray(models)) return [];
    return models
      .map((model) => this.map(model))
      .filter((model) => model !== null) as E[];
  }

  mapEntity(): OperatorFunction<M, E | null> {
    return map((model: M) => {
      return this.map(model);
    });
  }

  mapEntityNotNull(): OperatorFunction<M, E> {
    return map((model: M) => {
      return this.map(model)!;
    });
  }

  mapEntityList(): OperatorFunction<M[], E[]> {
    return map((json: M[]) => {
      return this.mapList(json);
    });
  }

  mapFirstEntity(): OperatorFunction<M, E | null> {
    return map((model: M) => {
      return this.map(model);
    });
  }

  mapFirstNotNullEntity(): OperatorFunction<M, E> {
    return map((json: M) => {
      return this.map(json)!;
    });
  }
}
