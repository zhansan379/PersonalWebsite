/**
 * Shape of the translation resources. Used as the `MessageSchema` so
 * `t()` resolves keys and their (string) value types statically.
 */
export interface MessageSchema {
  nav: {
    github: string
  }
  hero: {
    introLine1: string
    introLine2: string
    typewriter: string
    reach: string
  }
  blogNav: {
    home: string
    tags: string
    archive: string
    about: string
    vault: string
    projects: string
  }
  projects: {
    heading: string
    live: string
    os: string
    desc1: string
    desc2: string
    desc3: string
  }
  footer: {
    tagline: string
  }
  home: {
    featured: string
    all: string
  }
  post: {
    readTime: string
    countSuffix: string
    empty: string
    emptyHint: string
  }
  tags: {
    title: string
    subtitle: string
    label: string
    search: string
    none: string
  }
  archive: {
    subtitle: string
    undated: string
  }
  vault: {
    title: string
    subtitle: string
    directory: string
    onThisPage: string
    tabs: {
      directory: string
      timeline: string
      tags: string
    }
    notes: string
    canvases: string
    search: string
    noResults: string
    emptyTitle: string
    emptyHint: string
    missingHint: string
    notFound: string
    backToIndex: string
    created: string
    updated: string
    openCanvas: string
    copy: string
    copied: string
    back: string
  }
}