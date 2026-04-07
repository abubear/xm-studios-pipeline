# PROJECT: XM Studios AI Production Pipeline

An internal tool for a Singapore-based premium collectibles manufacturer.
Hand-crafted polystone statues at 1:4 scale ($800-$1,200 retail).
Compresses production from 14-18 months to 3-5 weeks.

## TECH STACK

- Next.js 14 (App Router), TypeScript, Tailwind CSS
- Supabase (PostgreSQL, Auth, Storage, Realtime) — running locally via Docker
- Qdrant vector search — running locally via Docker
- ViewComfy for ComfyUI API integration
- Anthropic Claude API (style guide checking, prompt generation)
- Three.js (3D model preview in browser)
- ComicVine API (comic reference images)
- Sketchfab API (3D model hosting for IP Gate 2)
- Pollinations API (Flux image generation)
- SV3D (360° turntable video generation)
- Wan2.1 (image-to-video for animated scene GIFs)
- ComfyUI 3D Pack (multi-angle renders from 3D models)

## FIVE WEB APPS (shared database and auth)

1. **XM Scene Composer** — research + reference gathering
2. **XM Jury** — team voting (1,000 images → 20 finalists)
3. **Imagination Studio** — ad-hoc concept generation with Claude prompt builder
4. **Character Library** — searchable 3D model archive with similarity search
5. **XM Store Content Generator** — auto-creates marketing content:
   360° turntable videos, multi-angle hero shots, detail closeups,
   animated scene GIFs, pre-order posters, full content packages

## DESIGN

- Dark theme (team works with images all day)
- Background: zinc-950/zinc-900, Cards: zinc-800, Accent: amber-500 (XM gold)
- Fonts: "Inter" body, "Plus Jakarta Sans" headings (via next/font/google)
- Keyboard shortcuts critical for Jury app (A=approve, R=reject, Space=next)
- Real-time collaboration via Supabase Realtime
- Use framer-motion for animations, lucide-react for icons, sonner for toasts

## USER ROLES

admin, creative_director, sculptor, reviewer, licensing, factory_coordinator

## DATABASE TABLES

ip_roster, sessions, reference_images, generated_images,
votes, finalists, ip_submissions, models_3d, character_library,
style_guide_rules, factory_packages, store_content, store_content_packages, profiles

## COMFYUI WORKFLOWS (7 total, connected via ViewComfy)

1. Jake's QWen ModelSheet (Stage 03: mass generation)
2. Jake's QWen ModelSheet Advanced (Stage 08: multi-angle turnarounds)
3. Pixel Artistry Trellis 2 + UniRig (Stages 09-10: 3D gen + rigging)
4. SV3D Turntable (Store Content: 360° video)
5. ComfyUI 3D Pack multi-angle (Store Content: renders from 3D model)
6. Wan2.1 Image-to-Video (Store Content: animated scene GIFs)
7. QWen poster composition (Store Content: pre-order posters)

## LOCAL DEVELOPMENT

- Supabase runs locally via Docker (localhost:54321)
- Qdrant runs locally via Docker (localhost:6333)
- Next.js dev server at localhost:3000
- ComfyUI at localhost:8188 (if you have a GPU) or via RunPod
- No cloud hosting needed during development
