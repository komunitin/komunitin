// Generic helper types not related to any particular domain.

export type Rate = {
  n: number
  d: number
}

export type AtLeast<T, K extends keyof T> = Partial<T> & Pick<T, K>

export type WithRequired<T, K extends keyof T> = T & Required<Pick<T, K>>

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;
