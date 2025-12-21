# Project Handbook: Next.js Blog Platform

This comprehensive guide is designed to take you from a fresh clone of the repository to understanding its deepest architectural decisions. It serves as both an onboarding manual for new developers and a reference for the existing team.

---

## 1. Project Overview

### **What is this project?**

This is a modern, real-time blogging platform. It allows users to view blog posts, interact with them through comments, and see real-time presence indicators (who else is viewing the post). It also includes a content management flow for authenticated authors to create posts with images.

### **Why was it built?**

The project serves as a robust example (and potentially a production starter) for a modern "full-stack" application that moves away from traditional REST APIs and SQL databases in favor of a real-time, reactive backend-as-a-service architecture.

### **Main Features**

- **Real-time Data**: Posts and comments update instantly without page reloads.
- **Live Presence**: See how many other people are reading a post in real-time.
- **Authentication**: Secure sign-up and login flow.
- **Image Handling**: Secure image uploads for blog posts.
- **Dark Mode**: Fully responsive UI with light/dark theme toggle.

### **Tech Stack**

- **Frontend**: Next.js 16 (App Router), React 19
- **Backend/Database**: Convex (Real-time database & functions)
- **Styling**: Tailwind CSS v4, Shadcn/UI (Radix Primitives)
- **Language**: TypeScript
- **Auth**: Better Auth (integrated with Convex)
- **Forms**: React Hook Form + Zod

---

## 2. Project Setup & Initialization

### **Environment Requirements**

- **Node.js**: Version 18+ (Recommended: LTS)
- **Package Manager**: npm (or pnpm/yarn)

### **Installation**

1.  **Clone the repository**:

    ```bash
    git clone <repository-url>
    cd blog
    ```

2.  **Install dependencies**:

    ```bash
    npm install
    ```

    _Why?_ This reads `package.json` and installs all the libraries needed for the project to run.

3.  **Initialize the Backend (Convex)**:

    ```bash
    npx convex dev
    ```

    _Why?_ This command logs you into Convex, sets up your project in the cloud, and pushes your schema. It keeps a live sync running during development.

4.  **Start the Frontend Dev Server** (in a new terminal):
    ```bash
    npm run dev
    ```
    _Why?_ This starts the Next.js development server at `http://localhost:3000`.

### **Folder Structure**

```text
├── convex/             # Backend logic
│   ├── schema.ts       # Database schema definition
│   ├── auth.ts         # Authentication configuration
│   └── *.ts            # Backend functions (queries/mutations)
├── src/
│   ├── app/            # Next.js App Router (Pages & Layouts)
│   ├── components/     # UI Components
│   │   ├── ui/         # Generic/Reusable components (shadcn)
│   │   └── web/        # App-specific components (e.g. Navbar)
│   ├── lib/            # Utility functions
│   └── styles/         # (If applicable, or usually globals.css in app)
├── public/             # Static assets (images, favicon)
└── package.json        # Dependencies and scripts
```

---

## 3. Configuration

### **Key Configuration Files**

**`convex.json` / `convex.config.ts`** (if applicable)
Configures the Convex project connection. Usually managed automatically by `npx convex dev`.

**`next.config.ts`**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "calm-alpaca-98.convex.cloud", // ALLOWS IMAGES FROM CONVEX
        port: "",
      },
    ],
  },
};

export default nextConfig;
```

_Why?_ Next.js optimizes images. For security, it blocks external image sources by default. We explicitly allow the Convex storage domain so specific images can be rendered.

**`tsconfig.json`**
Configures TypeScript. Specifically sets up `@/*` path aliases to point to `./src/*`.
_Why?_ Allows you to import files like `import Button from "@/components/ui/button"` instead of `../../components/ui/button`.

**`globals.css`** (Tailwind v4)

```css
@import "tailwindcss";
@import "tw-animate-css";
/* ...theme variables... */
```

_Why?_ Defines the global styles and configures Tailwind. In v4, the configuration (like theme colors) is often done directly in CSS variables (OKLCH color space) rather than a JS config file.

---

## 4. Application Architecture

### **App Structure (Routing)**

We use the **Next.js App Router**. Filespace routing means the folder structure defines the URLs.

- `src/app/page.tsx` -> Home page (`/`)
- `src/app/blog/page.tsx` -> Blog list (`/blog`)
- `src/app/layout.tsx` -> Global wrapper (Applies to ALL pages)

**Providers Pattern**
In `layout.tsx`, we wrap the app with providers:

```tsx
<ConvexClientProvider>
  <ThemeProvider ...>
    {children}
  </ThemeProvider>
</ConvexClientProvider>
```

_Why?_

- `ConvexClientProvider`: Initializes the WebSocket connection to the backend. It must be a Client Component (`use client`) so it can use React hooks.
- `ThemeProvider`: Handles light/dark mode switching.

### **Server vs. Client Components**

- **Server Components** (Default in `app/`): Used for fetching initial data, metadata (SEO), and layout structure. They render on the server and send HTML to the browser.
- **Client Components** (`"use client"`): Used for interactivity (forms, buttons) and real-time data subscriptions (Convex hooks like `useQuery`).

---

## 5. Core Implementation

### **Feature: Real-time Blog Posts**

**Goal**: Display lists of posts that update instantly when a new one is added.

**Backend (`convex/posts.ts`)**:

```typescript
import { query } from "./_generated/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("posts").collect();
  },
});
```

_Explanation_: exposing a public function `get` that fetches all documents from the `posts` table.

**Frontend (`src/components/web/PostList.tsx`)** (Conceptual):

```tsx
"use client";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function PostList() {
  const posts = useQuery(api.posts.get); // Real-time subscription!

  if (!posts) return <div>Loading...</div>;

  return (
    <div>
      {posts.map((post) => (
        <div key={post._id}>{post.title}</div>
      ))}
    </div>
  );
}
```

_Why?_ `useQuery` sets up a WebSocket listener. If specific data changes in the database, Convex pushes the new data to the client, and React re-renders automatically.

### **Feature: Creating a Post (Server Action + Mutation)**

**Goal**: Securely upload an image and create a post.

**Action (`src/app/actions.ts`)**:

```typescript
"use server";
// ... imports

export const createBlogPost = async function (
  data: z.infer<typeof postSchema>
) {
  // 1. Validate Input
  const parsedData = postSchema.parse(data);

  // 2. Auth Check
  const token = await getToken();
  if (!token) throw new Error("Not authenticated");

  // 3. Get Upload URL
  const imageUrl = await fetchMutation(
    api.posts.generateUploadUrl,
    {},
    { token }
  );

  // 4. Upload to Storage
  const uploadResult = await fetch(imageUrl, {
    method: "POST",
    body: parsedData.image,
  });
  const { storageId } = await uploadResult.json();

  // 5. Save Post Metadata
  await fetchMutation(
    api.posts.createPost,
    {
      title: parsedData.title,
      content: parsedData.content,
      imageStorageId: storageId,
    },
    { token }
  );

  // 6. Refresh Cache & Redirect
  revalidatePath("/blog");
  return redirect("/blog");
};
```

_Explanation_:

- **Validation**: Ensures data is correct before processing.
- **Hybrid Approach**: We use a Next.js Server Action to coordinate multiple steps (Authentication -> Get URL -> Upload -> Save DB). This keeps complex logic off the client.

---

## 6. Styling & UI

### **Approach: Utility-First + Components**

We use **Tailwind CSS** for low-level styling and **Shadcn/UI** for pre-built accessible components.

**Design System Patterns**

- **Colors**: Defined in `globals.css` using CSS Variables (`--primary`, `--background`). This makes theming (Dark Mode) automatic.
- **Typography**: Configured via `next/font/google` in `layout.tsx` (Poppins & Geist Mono), ensuring zero layout shift.

**Example: A styled button**

```tsx
import { Button } from "@/components/ui/button";

<Button variant="default" size="lg">
  Click Me
</Button>;
```

_Why?_ Instead of writing CSS classes every time (`bg-blue-500 rounded p-2...`), we reuse the `Button` component which encapsulates those styles and ensures consistency.

---

## 7. Data Handling

### **Data Fetching Strategy**

- **Read (GET)**: Primarily done via `useQuery` (Convex) on the client for real-time capabilities.
- **Write (POST/PUT)**: Done via `useMutation` (Convex) or Server Actions (Next.js) when we need server-side coordination (like file uploads).

### **Error Handling**

- **Validation**: Schema validation helps catch data errors early using `zod`.
- **UI Feedback**: We use `sonner` (Toast notifications) to show success/error messages to users.
  ```tsx
  toast.error("Failed to upload image");
  ```

---

## 8. Optimization & Performance

### **Image Optimization**

We use the `next/image` component:

```tsx
<Image src={url} width={500} height={300} alt="Blog post" />
```

_Why?_ Next.js automatically resizes, optimizes, and serves images in modern formats (like WebP) to prevent CLS (Cumulative Layout Shift) and speed up loading.

### **Code Splitting**

Next.js automatically code-splits per page. Importing a heavy library in `/blog` won't slow down `/home`.

---

## 9. Testing & Debugging

### **Testing Strategy**

- **Unit Tests**: Logic functions (like simple input parsing) can be tested with Jest/Vitest.
- **E2E Tests**: (Recommended) Playwright or Cypress to test critical flows like "User logs in and posts a blog."

### **Common Issues & Fixes**

- **Issue**: "Client Component only" error.
  - _Fix_: You tried to use a Hook (`useState`, `useQuery`) in a file without `"use client"` at the top.
- **Issue**: Images not loading.
  - _Fix_: Check `next.config.ts`. You likely need to add the hostname to `remotePatterns`.

---

## 10. Build & Deployment

### **Build Process**

1.  **Type Check**: TypeScript ensures no type errors exist.
2.  **Linting**: ESLint checks for code quality issues.
3.  **Compilation**: Next.js compiles React code into static HTML (where possible) and JS bundles.

### **Deployment (Vercel/Netlify)**

1.  **Environment Variables**: You MUST set `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL` in your deployment platform's settings.
2.**Command**: The default build command is `npm run build`.
3.**Production Mode**: ensure you deploy the Convex backend to production (`npx convex deploy`) so your live app doesn't use the dev database.

---

## 11. Final Notes

### **Key Lessons**

- **Real-time is strict**: Convex forces a shift in thinking. You don't "fetch" data once; you "subscribe" to it.
- **Type Safety is King**: Sharing types between Backend (Convex) and Frontend (Next.js) prevents 90% of bugs.

### **Scaling Recommendations**

- As the blog grows, implement **Pagination** in the Convex queries (`.paginate()`) to avoid fetching 1000s of posts at once.
- Add **Caching** policies if you move heavily to Server Components for reading data.

_Documentation maintained by the Engineering Team. Created: 2025._
