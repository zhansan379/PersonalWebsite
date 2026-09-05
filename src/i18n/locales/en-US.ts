import type { MessageSchema } from '../messages'

const messages: MessageSchema = {
  nav: {
    github: 'GitHub',
  },
  hero: {
    introLine1: "Hi, I'm Goto —",
    introLine2: 'a full-stack developer and designer.',
    typewriter: 'Welcome to my blog. Where I write about thinking, building, and design.',
    reach: 'Reach me:',
  },
  blogNav: {
    home: 'Home',
    tags: 'Tags',
    archive: 'Archive',
    about: 'About',
    vault: 'Wiki',
  },
  footer: {
    tagline: 'Think, write, build.',
  },
  home: {
    featured: 'Featured posts',
    all: 'All',
  },
  post: {
    readTime: '{minutes} min read',
    countSuffix: 'notes',
    empty: 'No notes yet',
    emptyHint: 'Content is on the way — stay tuned.',
  },
  tags: {
    title: 'Tags',
    subtitle: 'Browse all notes by tag, most used first.',
    label: 'All tags',
    search: 'Search tags…',
    none: 'No matching tags',
  },
  archive: {
    subtitle: 'All posts, grouped by time.',
    undated: 'Undated',
  },
  vault: {
    title: 'Knowledge Base',
    subtitle: 'A structured personal knowledge base curated in Obsidian, kept in sync with the notes.',
    directory: 'Directory',
    onThisPage: 'On this page',
    search: 'Search title, path or tags…',
    noResults: 'No notes match “{query}”',
    emptyTitle: 'The knowledge base is empty',
    emptyHint: 'Run `npm run sync:vault` to sync the Obsidian wiki in, or add Markdown notes directly under src/content/vault.',
    notes: 'notes',
    canvases: 'canvases',
    missingHint: 'Target not created yet',
    notFound: 'This note was not found',
    backToIndex: 'Back to directory',
    created: 'Created',
    updated: 'Updated',
    openCanvas: 'Canvas',
    copy: 'Copy',
    copied: 'Copied',
    back: 'Back',
  },
}

export default messages