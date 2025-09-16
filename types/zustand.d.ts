declare module 'zustand' {
  export type SetState<T> = (
    partial: Partial<T> | ((state: T) => Partial<T>),
    replace?: boolean
  ) => void;
  export type GetState<T> = () => T;
  export type StateCreator<T> = (
    set: SetState<T>,
    get: GetState<T>,
    api: any
  ) => T;

  export function create<T>(initializer: StateCreator<T>): {
    (selector: (state: T) => any): any;
    getState: GetState<T>;
    setState: SetState<T>;
    subscribe: (listener: (state: T, prevState: T) => void) => () => void;
  };
}

