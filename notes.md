- Create new projects using `create-next-app` to avoid manual config
- They recommend Prisma to automatically generate types based on DB schema

## Structure, Routing and Layout Pages
- Folders represent URL segments/paths. Only page.tsx files in folders are read as accessible pages, allowing for co-locating other logic (i.e. tests) within these folders
- **To create a new page**: Create a new folder in `/app` and then add a `page.tsx` file to it (that returns a React component)
- `layout.tsx` in root directory defines global layout. `page.tsx` in `/app` is homepage. Root layout is required, and is used in addition to layouts in subfolders.
- Generally, **layouts** define UI that is shared between multiple pages. Layout is component that takes `children` prop. When layout is in a directory, page in that directory automatically use it.
- Next.js uses partial rendering so that on navigation the page components update but the layout doesn't re-render.

### Navigation
- We navigate using `<Link>` element, which optimizes or client-side navigation and prevents doing full page refreshes.
- **Navigation in Next** is optimized because:
    - Routes are split into separate client bundles. One cool thing vs SPA is that NextJS is tolerant of errors on a specific page. They won't bring down the whole app like an SPA.
    - Code for a route is pre-fetched with a `<Link>` enters viewport
    - 

## Styling
- Create global CSS file (literally `/app/ui/global.css`) that gets loaded **in app root** like `layout.tsx` so styles are applied throughout the app.
- To use SASS: Literally just install sass
- [clsx](https://www.npmjs.com/package/clsx) is better flor applying conditional classes than ternary

## Fonts and IMages
- NextJS downloads font files and build time and hosts them with static assets so there are no additional network requests for fonts.
- Files under `/public` can be referenced in app.
- Use `next/image` component to automaticlaly optimize images (responsive; prevent layout shift, etc). Images are lazy loaded by default (loaded when they enter viewport)
    - Set both width and height with same aspect ratio as source (prevents layout shift).



Next: Chapter 5