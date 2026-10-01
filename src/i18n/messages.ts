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
    desc4: string
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
    htmlPages: string
    openHtml: string
    copy: string
    copied: string
    back: string
    mindmapView: string
    markdownView: string
  }
  comments: {
    title: string
    manage: string
  }
  chat: {
    title: string
    open: string
    expand: string
    collapse: string
    placeholder: string
    send: string
    stop: string
    retry: string
    clear: string
    settings: string
    back: string
    autoSaved: string
    provider: string
    model: string
    baseURL: string
    apiKey: string
    apiKeyPlaceholder: string
    getKey: string
    temperature: string
    mode: string
    modeAuto: string
    modeServer: string
    modeDirect: string
    serverOn: string
    serverOff: string
    serverChecking: string
    recheck: string
    privacyNote: string
    clearKey: string
    sources: string
    reading: string
    greeting: string
    example1: string
    example2: string
    example3: string
    errorGeneric: string
    keyMissing: string
    serverDown: string
    goSettings: string
  }
}