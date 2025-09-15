# iExec Confidential AI Playground (Builder Module)

A Next.js + TypeScript + Tailwind scaffold that mimics the iExec Builder dashboard styling and embeds a **Confidential AI Playground** under:
/builder/iapps/confidential-playground


## Quickstart

```bash
pnpm install   # or npm i / yarn
pnpm dev       # http://localhost:3000


Build & Run
pnpm build
pnpm start


Tech
- Next.js 14 (app router)
- TypeScript
- TailwindCSS
- Zustand (ephemeral state)
- lucide-react (icons)
- Local “shadcn-like” UI primitives in components/ui/ (no generator required)

Where things live
- Overview: app/builder/iapps/confidential-playground/page.tsx
- New Run Wizard: .../new/page.tsx
- Live Run: .../run/[id]/page.tsx
- Results: .../run/[id]/results/page.tsx
- API mocks: lib/api.ts
- Store: lib/store.ts
- Shell/Navigation: components/AppShell.tsx, SideNav.tsx, Topbar.tsx

Theming
Colors are approximations of the iExec Builder look (dark surfaces + yellow primary). Update tokens in tailwind.config.ts / app/globals.css if you have the official CSS values.

Next Steps
1) Wire real wallet + RLC credit display (wagmi/RainbowKit).
2) Replace mock API with iExec job submission, polling, and proof retrieval.
3) Implement shareable “Confidential Verified” badge page and proof JSON download.
4) Add “Export as iApp” to serialize run config to Builder’s deployment flow.

Happy building!

