// Generic helper types not related to any particular domain.

export type Rate = {
  n: number
  d: number
}

export type AtLeast<T, K extends keyof T> = Partial<T> & Pick<T, K>