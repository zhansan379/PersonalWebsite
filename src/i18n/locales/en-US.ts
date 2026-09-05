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
    blog: 'Blog',
    tags: 'Tags',
    archive: 'Archive',
    about: 'About',
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
    countSuffix: 'posts',
    empty: 'No posts yet',
    emptyHint: 'Content is on the way — stay tuned.',
    prev: 'Next',
    next: 'Previous',
    notFound: 'This post does not exist',
    backToBlog: 'Back to blog',
  },
  tags: {
    title: 'Tags',
    subtitle: 'Browse all posts by tag.',
    label: 'All tags',
  },
  archive: {
    subtitle: 'All posts, grouped by time.',
  },
}

export default messages