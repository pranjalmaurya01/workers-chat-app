# Workers Chat App

A modern, full-stack chat application built with Cloudflare Workers (backend) and Next.js (frontend). This project demonstrates real-time messaging, authentication, image sharing (images are uploaded to Cloudflare R2), chat history persistence, and a clean UI, suitable for learning, prototyping, or as a foundation for production chat apps.

## Monorepo Structure

- **back/** – Cloudflare Workers backend (TypeScript)
- **web/** – Next.js frontend (TypeScript/React)

---

## Backend (`back/`)
- **Cloudflare Workers** for scalable, serverless backend
- **WebSocket** support for real-time chat
- **TypeScript** for type safety
- **Wrangler** for deployment and local development

### Key Files
- `src/index.ts` – Main Worker entry
- `src/ws.ts` – WebSocket logic
- `wrangler.jsonc` – Worker configuration

### Setup
```sh
cd back
npm install
npm run dev
```

---

## Frontend (`web/`)
- **Next.js** for SSR and fast React UI
- **TypeScript** for type safety
- **Modern UI** with reusable components

### Key Files
- `app/` – Next.js app directory (pages, layouts)
- `components/` – UI components
- `lib/` – Utility functions

### Setup
```sh
cd web
npm install
npm run dev
```

---

## Features
- Real-time chat with WebSockets
- User authentication
- Image sharing (uploads to Cloudflare R2)
- Chat history persistence
- Responsive, modern UI
- Easy deployment (Cloudflare Workers + Vercel/Netlify/your choice)

## Getting Started
1. Clone the repo
2. Install dependencies in both `back/` and `web/`
3. Start both servers for local development

## License
MIT

---

*Made with ❤️ using Cloudflare Workers and Next.js*
