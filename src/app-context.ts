export const contextMap = new Map<string, string>;

export const addToMap = (key: string, value: any): void => {
  contextMap.set(key, value);
}

export const getValueFromMap = (key: string): any | undefined => contextMap.get(key);
