import { ObjectEntries } from "./types/global";

Object.typedEntries = <T>(obj: T) => Object.entries(obj) as ObjectEntries<T>;

export function sleep(millis: number) {
  return new Promise((resolve) => setTimeout(resolve, millis));
}
