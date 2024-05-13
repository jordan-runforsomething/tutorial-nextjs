- Create new projects using `create-next-app` to avoid manual config
- They recommend Prisma to automatically generate types based on DB schema

## Structure, Routing and Layout Pages
- Folders represent URL segments/paths. Only page.tsx files in folders are read as accessible pages, allowing for co-locating other logic (i.e. tests) within these folders
- **To create a new page**: Create a new folder in `/app` and then add a `page.tsx` file to it (that returns a React component)
- `layout.tsx` in root directory defines global layout. `page.tsx` in `/app` is homepage. Root layout is required, and is used in addition to layouts in subfolders.
  - Page components accept a `searchParams` prop. This is for Server Components only; for client components we still need to use `useSearchParams` hook.
- Generally, **layouts** define UI that is shared between multiple pages. Layout is component that takes `children` prop. When layout is in a directory, page in that directory automatically use it.
- Next.js uses partial rendering so that on navigation the page components update but the layout doesn't re-render.
- Use **Route Groups** with `/(overview)` on a route directory. In overview, but `page.tsx` and `loading.tsx` to prevent `loading.tsx` from applying to sub-routes. Can also use this to separate app into sections.
- Create **Dynamic Route Segments** to match an ID or other data in a URL. Do this with `/invoices/[id]/edit/page.tsx` type route.

## Navigation
- We navigate using `<Link>` element, which optimizes or client-side navigation and prevents doing full page refreshes.
- **Navigation in Next** is optimized because:
    - Routes are split into separate client bundles. One cool thing vs SPA is that NextJS is tolerant of errors on a specific page. They won't bring down the whole app like an SPA.
    - Code for a route is pre-fetched with a `<Link>` enters viewport

### Search and Pagination Pattern
- Use query param for search; search input is obviously client component, but results (i.e. Table) can be server component wrapped in Suspense. Debounce client-side navigation every time query string changes.

## Database
- Vercel's Postgres includes a data explorer and way to run queries in their UI. Lower hobby limits than Retool.
- See project for example of seed script. Which is quite verbose compared to Django dixtures

## Styling
- Create global CSS file (literally `/app/ui/global.css`) that gets loaded **in app root** like `layout.tsx` so styles are applied throughout the app.
- To use SASS: Literally just install sass
- [clsx](https://www.npmjs.com/package/clsx) is better flor applying conditional classes than ternary

## Fonts and IMages
- NextJS downloads font files and build time and hosts them with static assets so there are no additional network requests for fonts.
- Files under `/public` can be referenced in app.
- Use `next/image` component to automaticlaly optimize images (responsive; prevent layout shift, etc). Images are lazy loaded by default (loaded when they enter viewport)
    - Set both width and height with same aspect ratio as source (prevents layout shift).

## API Layer and Fetching Data
- Server components can interact with DB directly. Use API layer to fetch data (via API) from client. API endpoints created using special **Route Handlers**.
- Check out Prisma ORM.
- Vercel Postgres SDK provides protection against SQL Injection attacks.
- Check out `definitions.ts` in this repo for how they're typing the data we get back from using Vercel SQL SDK.

If using server components, then we can skip API layer and query DB directly in server components.

## Server Components
- Use `async/await` without having to use `useEffect` or `useState` (or special data fetch libraries). Use same type definitions for backend data fetch as frontend where data is used.
- Be smart about when requests are made in series (waterfall) vs parallel
- **Static Rendering** = Render at build time (or revalidation). **Dynamic Rendering** = rendered at request time for each user (and can account for cookies or other request data). **Use `unstable_noStore` to opt out of static rendering.**. But with dynamic rendering, app is as fast as _slowest_ query.
  - Technically calling any dynamic function makes the entire route dynamic.

**Server Component Pattern:**
```
// Async component
export default async function Page() {
  const revenue = await fetchRevenue(); // Uses {sql} from Vercel to fetch data
```

**Dynamic Render Pattern**
**Todo**: How does `noStore()` work.
```
import { unstable_noStore as noStore } from 'next/cache';
export async function fetchLatestInvoices() {
  noStore();
```

### Streaming
- Prevent slow data requests from blocking whole page (for dynamic rendering at request time) but suspending content that will stream from server to client. Reduces load time because chunks can be rendered in parallel.
- Can stream individual components (using `<Suspense>`) or a whole page (using `loading.tsx`)

There are two ways to stream:
1. Add `loading.tsx` to route folder. Content in that will be shown instead of page. Because page is only _part_ of the `layout`, the rest of layout will also render while loading.
2. Do long-running promise in a component, and then wrap that component in `<Suspense>`. Use wrapper component to suspend many smaller components so there isn't layout shift while they render. This is known as **Suspense Boundary**
```
<Suspense fallback={<RevenueChartSkeleton />}>
  <RevenueChart />
</Suspense>
```

### Partial Rendering
NextJS 14 includes partial rendering. Static parts of the page are generated at buidl time (or revalidation). Dynamic components - wrapped in Suspense - ar eleft as holes in the static content and are automatically streamed in parallel to reduce load.

## Mutating Data
- **Server Actions** are async code run on server, eliminating need for API endpoints to mutate data. Can be invoked from Client or Server components.
Pattern:
```
async function create(formData: FormData) {
  const rawFormData = Object.fromEntries(formData.entries())
return <form action={create}>...</form>;
```

To pass additional data to server action (that's not in form), we need to `bind` the function so that data is properly encoded. Could also use hidden fields, but then values are visible in HTML source.
```
const updateInvoiceWithId = updateInvoice.bind(null, invoice.id);
<form action={updateInvoiceWithId}>
```

- Use Zod to validate form data types
- Need to clear client side cache for routes affected by data change. Do this with `revalidatPath`

## Concepts to not forget
- Use <link> and <image> from NextJS library
- Server components where possible
- Dynamic Rendering
- Streaming to suspend content
- Route Groups **NOT QUTE SURE HOW THESE WORK**
- `use-debounce` library is a quick way to debounce a callback. But I guess lodash does this, too.
- `useRouter` for client-side transitions

## Error Handling
- Use **`error.tsx`** to handle errors **at any route segment** for just that route segment.

## Todo
- Use Drizzle and TypeORM for invoice creation/update
- Add loading state for creating or updating invoice