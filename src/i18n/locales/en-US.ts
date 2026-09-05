import type { MessageSchema } from '../messages'

const messages: MessageSchema = {
  nav: {
    labs: 'Labs',
    studio: 'Studio',
    openings: 'Openings',
    shop: 'Shop',
    contact: 'Get in touch',
  },
  intro: {
    line1: 'Hey there, meet A.R.I.A,',
    line2: "Goto's Adaptive Response Interface Agent",
  },
  typewriter:
    'Glad you stopped in. Good taste tends to find us. Now, what are we building?',
  pills: {
    pitch: 'Pitch us an idea',
    work: 'Come work here',
    hello: 'Send a brief hello',
    operate: 'See how we operate',
    reach: 'Reach us:',
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
    badge: 'Personal blog',
    title: 'Think in writing, build by recording',
    subtitle: 'A personal blog on full-stack development, design, and engineering.',
    viewBlog: 'Browse all posts',
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