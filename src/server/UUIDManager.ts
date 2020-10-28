import faker from "faker";

/**
 * Implements UIDs as identifiers for MirageJS using faker UID generator.
 */
export default class UUIDIndetityManager {
  ids: Set<string>;

  constructor() {
    this.ids = new Set<string>();
  }

  // Returns a new unused unique identifier.
  fetch() {
    let id = faker.random.uuid();
    while (this.ids.has(id)) {
      id = faker.random.uuid();
    }

    this.ids.add(id);

    return id;
  }

  // Registers an identifier as used. Must throw if identifier is already used.
  set(id: string) {
    if (this.ids.has(id)) {
      throw new Error(`ID ${id} has already been used.`);
    }

    this.ids.add(id);
  }

  // Resets all used identifiers to unused.
  reset() {
    this.ids.clear();
  }

  // This next two functions are useless but just to avoid compiler warning.
  get() {
    return 0;
  } 
  inc() {
    return 0;
  }
}
