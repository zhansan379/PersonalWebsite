/**
 * Shape of the translation resources. Used as the `MessageSchema` so
 * `t()` resolves keys and their (string) value types statically.
 */
export interface MessageSchema {
  nav: {
    labs: string
    studio: string
    openings: string
    shop: string
    contact: string
  }
  intro: {
    line1: string
    line2: string
  }
  typewriter: string
  pills: {
    pitch: string
    work: string
    hello: string
    operate: string
    reach: string
  }
}