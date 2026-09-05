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
  hero: {
    introLine1: string
    introLine2: string
    typewriter: string
    reach: string
  }
  blogNav: {
    home: string
    blog: string
    tags: string
    archive: string
    about: string
  }
  footer: {
    tagline: string
  }
  home: {
    badge: string
    title: string
    subtitle: string
    viewBlog: string
    featured: string
    all: string
  }
  post: {
    readTime: string
    countSuffix: string
    empty: string
    emptyHint: string
    prev: string
    next: string
    notFound: string
    backToBlog: string
  }
  tags: {
    title: string
    subtitle: string
    label: string
  }
  archive: {
    subtitle: string
  }
}