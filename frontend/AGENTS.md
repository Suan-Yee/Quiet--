# Project Instructions for Codex

## Project Overview

This project is a calm reading and writing room for ideas worth returning to.

The frontend should feel like a calm writing platform, not a social media app.

Main product goals:
- Users can read posts.
- Users can write and publish articles or normal posts.
- Normal posts contain text and up to 10 images or GIFs; video is not supported.
- Users can follow authors.
- Users can love, comment on, save, repost, and share posts.
- Users can comment with nested comments up to 2 levels.

## Tech Stack

Frontend:
- React
- Vite
- TailwindCSS
- React Router
- lucide-react

Backend:
- Go
- GORM
- SQL database models
- JWT-style auth middleware planned/placeholder

The existing Go backend models are the data contract for frontend mock data.
Even while the frontend uses local mock data, keep mock object shapes aligned with backend JSON fields.

Important backend-aligned naming:
- Use `excerpt`, not `preview`.
- Use `coverImage`, not `image`.
- Use `contentJson` for Tiptap JSON content.
- Use `contentText` for extracted plain text.
- Use `readTime` as a number of minutes, then format it in the UI.
- Use `postType` to distinguish `article` and `normal` posts.
- Use `media` for normal-post images and GIFs, capped at 10 items.
- Use lowercase post status values: `draft` and `published`.
- Use `topics: Topic[]` instead of a single `category` field.
- Use `author.profileImage` and `author.authorDescription`.
- Keep UI-only fields such as `isReacted`, `isBookmarked`, `isFeatured`, and `quotePreview` clearly separated from backend core fields.

For now, focus only on frontend unless the user asks for backend.

## UI/UX Direction

Design style:
- Contemporary editorial
- Library-like rather than newsletter-like
- Writer-focused and reader-centered
- Structured, spacious, and highly readable
- Professional, calm, and visually distinctive
- A single, calm post-feed component on the Dashboard
- Not playful, noisy, or modeled after Substack or social-media timelines

Theme colors:
- Page background: #F1F4F0
- Card background: #FCFDFB
- Primary text: #16211C
- Muted text: #7B8981
- Border: #D6DFD9
- Accent: #276749
- Accent hover: #1F513A
- Soft accent: #DCEDE4
- Brand panel: #12382B
- Highlight: #CDEB7B

Typography:
- Use Manrope for navigation, discovery, controls, and interface headings.
- Use Newsreader or Georgia only for long-form article content and selected reading moments.
- Discovery cards and product surfaces should remain sans-serif.
- Use readable spacing and line height; avoid playful fonts.

## Layout Rules

Home page:
- Sticky navbar
- Posts only: no hero, metrics, topic shelves, writer panels, or section introductions
- One centered column using the same `NormalPost` component for every post type
- Single column composition on mobile

Post cards:
- Use one standard structure: author header, text, optional media, interaction footer.
- Header order: profile picture, username, upload date, and `Edited` when applicable.
- Footer order: Love, Comment, Save, Repost, Share.
- Keep feed actions left-aligned; show counts for Love, Comment, and Repost.
- Active Love, Comment, and Save icons use a filled accent state.
- Use “Comment”, never “Response”, in visible product language.
- Normal-post media accepts images and GIFs only, with a maximum of 10.
- Keep multi-image posts compact by showing four feed tiles and a `+N` lightbox entry for remaining media.
- Clicking any post image opens the lightbox at that exact image; single images use the same viewer.
- Use a translucent neutral lightbox overlay, restrained image sizing, and line-tab position indicators instead of numeric counters.
- Image media may include an optional `label`; show it as a translucent bottom caption in feed tiles and the lightbox.

Create post:
- Open the create page in `Normal Post` mode by default; keep `Create Article` as the explicit long-form alternative.
- A normal post may contain text, images, or both. Keep article-only title, excerpt, topic, and cover controls out of this mode.
- Normal-post uploads must use the shared image/GIF allowlist, support file selection and drag-and-drop, reject video, and enforce the 10-image limit.
- Use the large media drop zone only before the first image is attached. Collapse it to a compact `Add more images` row once media exists.
- Record each uploaded image's intrinsic width and height. Preserve GIF data, and resize/compress still images before local demo persistence to reduce storage failures.
- Image labels are optional and controlled by an explicit toggle. Preserve draft label text when the toggle is off, but do not publish or display it unless labels are enabled.
- The normal-post preview is also the arrangement screen. Support desktop drag reordering plus visible move-earlier/move-later controls for keyboard, touch, and assistive-technology users.
- Keep explicit `Back to editor` and `Publish post` actions persistently visible in the preview.
- Keep every feed and preview media surface inside one compact responsive 16:9 outer frame. Only the internal grid may change; mobile scales the whole frame without changing its ratio.
- One image uses the full frame with no layout selector.
- Two images offer `side-by-side` and `stacked`.
- Three images offer `portrait-strip`, `featured-left`, and `featured-top`; `featured-left` uses equal-width left and right columns.
- Four images default to a 2 × 2 `grid`, with optional `featured-left` and `featured-top` layouts.
- Five or more images always use the first four positions in a 2 × 2 grid and show `+N` over tile four.
- Recommend side by side for two portraits, stacked for two landscapes, and stacked with the landscape first for mixed pairs.
- For three portrait images, recommend `portrait-strip`. Otherwise recommend the widest landscape as the featured top tile, or feature the first image on the left.
- Recommend the 2 × 2 grid for four or more images.
- Let the author explicitly apply a recommendation. Applying it also moves the recommended image into position one when a featured slot is used.
- Fill fixed feed and preview tiles with `object-cover` so layouts have no empty bands; keep the complete uncropped image available in the lightbox carousel.
- Keep every feed and preview media frame left-aligned with a 640px maximum width, including single-image and image-only posts.
- Keep Dashboard and preview post cards at a 680px maximum width so 20px desktop padding aligns exactly with the 640px media frame.
- Keep mixed normal posts compact by clamping longer text to three lines with an accessible `Show more` control and using tighter vertical spacing.

Use max-width containers.
Avoid full-width stretched content on desktop.
Use generous spacing.

## Component Rules

Create reusable components:
- Button
- Card
- Container
- Navbar
- HeroSection
- FeedTabs
- PostCard
- NormalPost
- AuthorCard
- SuggestedAuthors
- TopicsCard
- ProfileStoryRow
- StudioCommandBar
- LoadingSpinner
- EmptyState

Prefer reusable components instead of repeating Tailwind classes everywhere.

## Code Style

Use:
- Functional React components
- Clean file names
- Simple state first
- Mock data before backend connection
- Mock data should match current backend model shapes
- Clear component props
- Organized folders

Avoid:
- Over-engineering
- Complex global state too early
- Random colors
- Inline styles
- Large files
- Mixing too many responsibilities in one component

## Folder Structure

Use this structure:

src/
  components/
    common/
    layout/
    home/
    post/
    profile/
  pages/
  data/
  routes/
  utils/
  assets/

## Tailwind Rules

Use TailwindCSS classes.
Do not use random colors directly unless they match the approved theme.
Prefer consistent spacing:
- px-4 on mobile
- max-w-6xl or max-w-7xl containers
- restrained 12-20px radii
- light borders
- subtle shadows only when useful

## Accuracy Rules

Before editing code:
1. Inspect the current file structure.
2. Understand existing components.
3. Make the smallest good change.
4. Keep the current design system consistent.
5. Explain what changed after editing.

When unsure:
- Ask before making big architectural decisions.
- Do not rewrite the whole project unless asked.

## Testing / Verification

After changes:
- Check for import errors.
- Check route names.
- Check responsive layout.
- Check mobile and desktop behavior.
- Run the project if possible.
