import { map, OperatorFunction } from 'rxjs';

export abstract class ModelAdapter<M, E> {
  abstract adapt(model: M): E | null;

  adaptList(models: M[]): E[] {
    if (!models || !Array.isArray(models)) return [];
    return models
      .map((model) => this.adapt(model))
      .filter((model) => model !== null) as E[];
  }

  mapEntity(): OperatorFunction<M, E | null> {
    return map((model: M) => {
      return this.adapt(model);
    });
  }

  mapEntityNotNull(): OperatorFunction<M, E> {
    return map((model: M) => {
      return this.adapt(model)!;
    });
  }

  mapEntityList(): OperatorFunction<M[], E[]> {
    return map((json: M[]) => {
      return this.adaptList(json);
    });
  }

  mapFirstEntity(): OperatorFunction<M, E | null> {
    return map((model: M) => {
      return this.adapt(model);
    });
  }

  mapFirstNotNullEntity(): OperatorFunction<M, E> {
    return map((json: M) => {
      return this.adapt(json)!;
    });
  }
}
