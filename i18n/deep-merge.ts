type JsonObject = Record<string, unknown>;

const isObject = (value: unknown): value is JsonObject =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

export const deepMergeMessages = <T extends JsonObject>(
  base: T,
  overlay: JsonObject,
): T => {
  const output: JsonObject = { ...base };
  for (const [key, value] of Object.entries(overlay)) {
    const current = output[key];
    if (isObject(current) && isObject(value)) {
      output[key] = deepMergeMessages(current, value);
    } else if (value !== undefined) {
      output[key] = value;
    }
  }
  return output as T;
};
