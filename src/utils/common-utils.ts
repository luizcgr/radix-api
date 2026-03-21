export const removeIfEmpty = <T extends object>(
  obj: T,
  removeEmptyStrings: boolean = false,
  removeNull: boolean = false,
): T => {
  const copy: T = { ...obj };
  for (const key of Object.keys(copy)) {
    const value = copy[key as keyof T];

    if (value === undefined) {
      delete copy[key as keyof T];
      continue;
    }

    if (removeNull && value === null) {
      delete copy[key as keyof T];
      continue;
    }

    if (
      removeEmptyStrings &&
      typeof value === 'string' &&
      value.trim().length === 0
    ) {
      delete copy[key as keyof T];
    }
  }
  return copy;
};
