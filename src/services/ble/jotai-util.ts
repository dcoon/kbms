import { WritableAtom, atom } from 'jotai';
import { loadable } from 'jotai/utils';


/**
 * Creates a writable atom that wraps a loadable version of the provided async atom.
 * This allows components to use the loadable state (loading, hasData, hasError)
 * while still being able to trigger updates via the setter.
 */
export function loadableWithSetter<Value, Args extends any[], Result>(
  anAtom: WritableAtom<Value, Args, Result>) {
  const lAtom = loadable(anAtom);
  return atom(
    (get) => get(lAtom),
    (_get, set, ...args: Args) => set(anAtom, ...args)
  );
}
