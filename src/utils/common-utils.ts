export const removerUndefined = <T extends object>(obj: T): T => {
  const copy: T = { ...obj };
  for (const key of Object.keys(copy)) {
    if (copy[key as keyof T] === undefined) {
      delete copy[key as keyof T];
    }
  }
  return copy;
};
