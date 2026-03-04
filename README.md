<div align="center">

# 🌸 Bloom Together — Community Doodle Garden

**A collaborative digital garden where everyone can draw flowers and plant them on a shared world map.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=for-the-badge&logo=prisma)](https://prisma.io/)
[![Neon](https://img.shields.io/badge/Neon-PostgreSQL-00E5A7?style=for-the-badge)](https://neon.tech/)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/)

</div>

---
"WEBSITE IS NOW LIVE!!!"
https://community-doodle-garden-anlleevv9.vercel.app/
## ✨ What is Doodle Garden?

**Bloom Together** is a creative, community-driven web app where users:
1. **Draw a flower** using an in-browser canvas
2. **Plant it anywhere** on a shared interactive world map
3. **Explore the garden** — see flowers planted by people from all over the world
4. **Interact** — star, comment, and follow other artists
5. **Compete** on the leaderboard for the most-starred creations

---

## 🗺️ Feature Map

```
Doodle Garden
├── 🎨 Drawing Canvas
│   ├── Freehand brush tool
│   ├── Color picker (full palette)
│   ├── Adjustable brush size
│   ├── Eraser tool
│   └── Save / export drawing
│
├── 🌍 World Garden (Map)
│   ├── Interactive globe/map
│   ├── Click to plant a flower at any location
│   ├── See all community flowers
│   └── Filter by user / region
│
├── 👤 User Profiles
│   ├── Avatar & username
│   ├── LinkedIn / GitHub links
│   ├── View all doodles by user
│   ├── Follow / friend system
│   └── Edit profile
│
├── 🌟 Social Features
│   ├── Star doodles (like)
│   ├── Comment on doodles
│   └── View stargazers
│
├── 🏆 Leaderboard
│   └── Top flowers ranked by stars
│
└── 🔐 Authentication
    ├── Email + Password signup
    ├── 6-digit OTP verification (via Gmail)
    ├── Secure login (NextAuth)
    └── Session management
```

---

## 🔐 Authentication Flow

```mermaid
flowchart TD
    A([User visits /signup]) --> B[Fill in username, email, password]
    B --> C[POST /api/signup]
    C --> D{Email already registered?}
    D -->|Yes, verified| E[❌ Return 409 - Already exists]
    D -->|Yes, unverified| F[🗑️ Delete old record + OTP]
    D -->|No| G[Create user emailVerified=false]
    F --> G
    G --> H[Generate 6-digit OTP]
    H --> I[Store OTP in DB with 10min expiry]
    I --> J[📧 Send OTP email via Gmail SMTP]
    J --> K{Email sent OK?}
    K -->|No| L[🔄 Rollback - delete user + OTP]
    K -->|Yes| M[Redirect to /verify?email=...]
    M --> N[User enters 6-digit code]
    N --> O[POST /api/auth/verify-otp]
    O --> P{Code valid + not expired?}
    P -->|No| Q[❌ Show error]
    P -->|Yes| R[✅ Set emailVerified=true]
    R --> S[Auto sign-in via NextAuth]
    S --> T([🏠 Redirect to Home])
```

---

## 🎨 Drawing → Planting Flow

```mermaid
flowchart TD
    A([User clicks Draw]) --> B[/draw page loads]
    B --> C[DrawingCanvas component]
    C --> D[User draws with brush/eraser]
    D --> E[Save canvas as PNG/Base64]
    E --> F[PlantingModal opens]
    F --> G[User clicks location on World Map]
    G --> H[POST /api/doodles with coordinates + image]
    H --> I[Doodle stored in Neon DB]
    I --> J[Appears on /garden map]
    J --> K[Other users can see and interact]
```

---

## 🌟 Social Interactions Flow

```mermaid
flowchart LR
    A[User sees a flower] --> B{Action}
    B --> C[⭐ Star]
    B --> D[💬 Comment]
    B --> E[👤 Visit Profile]
    C --> F[POST /api/doodles/id/star]
    D --> G[POST /api/comments]
    E --> H[GET /api/user/public/id]
    F --> I[Toggle star in DB]
    G --> J[Store comment]
    H --> K[Show public profile + doodles]
```

---

## 🗄️ Database Schema

```
┌─────────────────────────────────────────────────────────────────┐
│                           USER                                  │
│  id (uuid) │ username │ email │ password │ emailVerified        │
│  avatar_url │ linkedin_url │ github_url │ createdAt            │
└──────────────────────┬──────────────────────────────────────────┘
                       │ 1:N
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│                         DOODLE                                   │
│  id (uuid) │ user_id │ image_url │ flower_name                  │
│  coord_x │ coord_y │ timestamp                                   │
└──────────────────────┬───────────────────────────────────────────┘
                       │ 1:N
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│                       INTERACTION                                │
│  id (uuid) │ doodle_id │ user_id │ type (STAR/COMMENT)          │
│  content (optional)                                              │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                          OTP                                     │
│  id (uuid) │ email │ code │ expiresAt │ createdAt               │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | [Next.js 16](https://nextjs.org/) | Full-stack React framework (App Router) |
| **Language** | [TypeScript](https://typescriptlang.org/) | Type-safe development |
| **Styling** | Vanilla CSS + CSS Variables | Custom design system, no Tailwind |
| **ORM** | [Prisma 7](https://prisma.io/) | Database schema + query builder |
| **Database** | [Neon PostgreSQL](https://neon.tech/) | Serverless cloud PostgreSQL |
| **Auth** | [NextAuth.js](https://next-auth.js.org/) | Session management + credentials |
| **Email** | [Nodemailer](https://nodemailer.com/) + Gmail SMTP | OTP delivery |
| **Drawing** | HTML5 Canvas API | Freehand drawing engine |
| **Animations** | [GSAP](https://gsap.com/) | Page transitions, shutter effects |
| **Fonts** | Google Fonts (Nunito, Outfit) | Typography |
| **Deployment** | [Vercel](https://vercel.com/) | Hosting + serverless functions |
| **DB Hosting** | [Neon](https://neon.tech/) | Managed PostgreSQL |

---

## 📁 Project Structure

```
community-doodle-garden/
├── prisma/
│   └── schema.prisma          # DB models (User, Doodle, Interaction, Otp)
├── prisma.config.ts           # Prisma 7 runtime config (DIRECT_URL)
├── src/
│   ├── app/
│   │   ├── page.tsx           # 🏠 Homepage / Landing
│   │   ├── draw/              # 🎨 Drawing canvas page
│   │   ├── garden/            # 🌍 World garden map
│   │   ├── profile/           # 👤 User profile (own + public)
│   │   ├── signup/            # 📝 Registration form
│   │   ├── login/             # 🔑 Login form
│   │   ├── verify/            # 📬 OTP verification
│   │   ├── about/             # ℹ️ About page
│   │   ├── author/            # 👨‍💻 Creator page
│   │   └── api/
│   │       ├── signup/        # POST - Create account + send OTP
│   │       ├── auth/
│   │       │   ├── [...nextauth]/  # NextAuth session handler
│   │       │   ├── send-otp/       # POST - Resend OTP email
│   │       │   └── verify-otp/     # POST - Verify OTP code
│   │       ├── doodles/
│   │       │   ├── route.ts        # GET all, POST create
│   │       │   └── [id]/
│   │       │       ├── route.ts    # GET, DELETE single doodle
│   │       │       ├── star/       # POST - Toggle star
│   │       │       ├── comment/    # POST - Add comment
│   │       │       └── relocate/   # PATCH - Move flower on map
│   │       ├── comments/[id]/      # DELETE comment
│   │       ├── leaderboard/        # GET - Top starred doodles
│   │       └── user/
│   │           ├── profile/        # GET/PATCH - Own profile
│   │           ├── public/[id]/    # GET - Public profile
│   │           └── friends/        # GET/POST - Friend system
│   ├── components/
│   │   ├── DrawingCanvas.tsx   # Canvas drawing tool
│   │   ├── Navigation.tsx      # Top navigation bar
│   │   ├── PlantingModal.tsx   # Map + plant flow
│   │   ├── GlobalShutter.tsx   # Page transition animation
│   │   ├── PetalRain.tsx       # Decorative petal animation
│   │   ├── SoundProvider.tsx   # Ambient sounds
│   │   ├── TransitionLink.tsx  # Animated page links
│   │   ├── Footer.tsx          # Site footer
│   │   └── AuthProvider.tsx    # NextAuth session wrapper
│   └── lib/
│       ├── prisma.ts           # Prisma client singleton
│       ├── email.ts            # Nodemailer Gmail sender
│       └── sounds.ts           # Sound effects config
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [Neon](https://neon.tech/) PostgreSQL database
- A Gmail account with 2FA + App Password

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/TheAyushTandon/community-doodle-garden.git
cd community-doodle-garden

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Fill in your values (see below)

# 4. Generate Prisma client
npx prisma generate

# 5. Push schema to database
npx prisma db push

# 6. Start development server
npm run dev
```

### Environment Variables

Create a `.env` file in the root:

```env
# Neon PostgreSQL (pooled - for app runtime)
DATABASE_URL="postgresql://user:pass@host-pooler.region.aws.neon.tech/dbname?sslmode=require"

# Neon PostgreSQL (direct - for Prisma CLI)
DIRECT_URL="postgresql://user:pass@host.region.aws.neon.tech/dbname?sslmode=require"

# NextAuth
NEXTAUTH_SECRET="your-random-44-char-secret"
NEXTAUTH_URL="http://localhost:3000"

# Gmail OTP Sender
GMAIL_USER="your-sender@gmail.com"
GMAIL_APP_PASSWORD="xxxx xxxx xxxx xxxx"
```

---

## 🌐 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/signup` | ❌ | Create account + send OTP |
| `POST` | `/api/auth/send-otp` | ❌ | Resend OTP email |
| `POST` | `/api/auth/verify-otp` | ❌ | Verify OTP code |
| `GET` | `/api/doodles` | ❌ | Get all doodles |
| `POST` | `/api/doodles` | ✅ | Plant a new doodle |
| `GET` | `/api/doodles/[id]` | ❌ | Get single doodle |
| `DELETE` | `/api/doodles/[id]` | ✅ | Delete your doodle |
| `POST` | `/api/doodles/[id]/star` | ✅ | Toggle star |
| `POST` | `/api/doodles/[id]/comment` | ✅ | Add comment |
| `PATCH` | `/api/doodles/[id]/relocate` | ✅ | Move doodle on map |
| `GET` | `/api/leaderboard` | ❌ | Top ranked doodles |
| `GET` | `/api/user/profile` | ✅ | Get own profile |
| `PATCH` | `/api/user/profile` | ✅ | Update own profile |
| `GET` | `/api/user/public/[id]` | ❌ | Get public profile |
| `GET/POST` | `/api/user/friends` | ✅ | Friend system |

---

## 🎨 Design System

The app uses a custom CSS design system with:

| Token | Value | Use |
|-------|-------|-----|
| `--primary` | Purple/Violet | Main CTA, accents |
| `--secondary` | Blue | Secondary actions |
| `--tertiary` | Yellow/Gold | Signup page bg |
| `--bg-login` | Coral/Pink | Login page bg |
| Border style | `4px solid #111827` | Sticker aesthetic |
| Shadow | `6-8px solid #111827` | Lifted card effect |
| Font | `Nunito` + `Outfit` | Display + body |

---

## 📸 Screenshots

> Coming soon — deploy to Vercel and add live screenshots here!

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit: `git commit -m 'add: my feature'`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 👨‍💻 Author

**Ayush Tandon**
- GitHub: [@TheAyushTandon](https://github.com/TheAyushTandon)

---

## 📄 License

MIT License — feel free to use, fork, and build upon this project.

---

<div align="center">
  Made with 🌸 and a lot of doodles
</div>
