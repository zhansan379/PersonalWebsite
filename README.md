# PersonalWebsite

Goto® — a full-screen creative agency hero landing page, extended with a bilingual blog.

Built with Vue 3 + TypeScript + Vite + Tailwind CSS + Vue Router + vue-i18n.

> 页面截图
>
> <img width="2549" height="1191" alt="image" src="https://github.com/user-attachments/assets/2f40ce1a-dee4-4525-90d4-e6158f13ee52" />
>
> <img width="2549" height="1191" alt="image" src="https://github.com/user-attachments/assets/4f2070ea-8298-4ece-bab2-7bd307ceef0c" />
> 
> <img width="2549" height="1191" alt="image" src="https://github.com/user-attachments/assets/b676447f-9a58-4317-8a90-83713c1b9754" />
> 


## Features

- Full-screen background video scrubbed by horizontal mouse movement
- Typewriter headline with blinking caret
- Chinese (简体) / English i18n, switchable from the navbar (default Chinese)
- Local, self-hosted fonts (Latin + 思源宋体 Noto Serif SC in Chinese mode)
- Mobile menu, copy-to-clipboard contact pill
- Blog with Markdown content, reading-time estimate, tag + archive views
- Light / dark theme toggle
- Knowledge-base AI assistant (floating chat widget) — agentic tool-calling over vault notes, bring-your-own-key (browser localStorage only) or optional server-side proxy

## AI assistant

A floating chat widget answers questions about the vault notes. The model picks which notes to read via a `read_note` tool call (agentic loop, ≤5 rounds), so no embeddings or search index are needed. Source links under each answer are the notes actually read — never model-generated.

Two connection modes (auto-detected, server first):

1. **Browser direct** — visitors configure their own provider/model/API key in the widget's settings. The key is stored only in the browser's `localStorage` and sent exclusively to the configured LLM endpoint (OpenAI-compatible or Anthropic). It never touches this site's server.
2. **Server proxy (optional)** — `api/chat.ts` (Vercel Edge function) forwards requests with a key held in server env vars, so visitors can chat without configuring anything. Copy `.env.example` and set:

   | Variable | Description |
   | --- | --- |
   | `LLM_PROVIDER` | `openai` (any OpenAI-compatible endpoint: DeepSeek, Qwen, OpenRouter…) or `anthropic` |
   | `LLM_API_KEY` | The provider API key (server-side only, never shipped to browsers) |
   | `LLM_BASE_URL` | Optional custom upstream endpoint |
   | `LLM_MODEL` | Optional model override |
   | `CHAT_MAX_TOKENS` | Optional server-side `max_tokens` clamp (default 2048) |

   **Never** prefix these with `VITE_` — that would embed the key into the client bundle.

Notes:

- Local dev of the server proxy requires `vercel dev` (plain `vite dev` doesn't serve `api/`); without it the widget detects the missing endpoint and falls back to browser-direct mode.
- The proxy endpoint is public — set a hard monthly spend limit on your provider console as the last line of defense (the function already clamps message size / `max_tokens`; for real rate limiting add Upstash or Vercel WAF).
- Some providers don't allow browser CORS (e.g. DashScope) — use OpenRouter or the server proxy mode in that case.

## Routes

| Path | Description |
| --- | --- |
| `/` | Home (featured notes) |
| `/tags` | Tags (count-desc, searchable) |
| `/tags/:tag` | Notes by tag |
| `/archive` | Archive grouped by time |
| `/vault` | Vault / knowledge-base directory (searchable) |
| `/vault/:pathMatch(.*)*` | A single note / canvas |
| `/about` | About |

## Content

Blog / vault notes are one Chinese-language corpus synced in from an Obsidian knowledge base into `src/content/vault/`. About pages are in `src/content/about/`.

## Vault sync (GitHub workflow)

The `/vault` pages are driven by the Obsidian knowledge base. To have notes auto-pushed from your knowledge-base repo into this one on every commit, follow [`docs/workflow-tutorial.md`](docs/workflow-tutorial.md) — a plain-language guide covering:

- the GitHub Actions workflow (`paths` trigger + `VAULT_WIKI`/`VAULT_DEST` env config),
- the `BLOG_PAT` / `BLOG_REPO` secrets,
- optional push-to-a-branch and switching sync directories.

For local use you can run `npm run sync:vault` to copy the wiki into `src/content/vault/` without a workflow.

## Development

```bash
npm install
npm run dev      # start dev server
npm run build    # type-check + production build
npm run preview  # preview the production build
```
