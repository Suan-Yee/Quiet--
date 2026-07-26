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
