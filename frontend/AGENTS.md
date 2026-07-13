# Project Instructions for Codex

## Project Overview

This project is a Substack-like writing platform.

The frontend should feel like a calm writing platform, not a social media app.

Main product goals:
- Users can read posts.
- Users can write and publish posts.
- Users can follow/subscribe to authors.
- Users can react to posts.
- Users can bookmark posts.
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
- Use lowercase post status values: `draft` and `published`.
- Use `topics: Topic[]` instead of a single `category` field.
- Use `author.profileImage` and `author.authorDescription`.
- Keep UI-only fields such as `isReacted`, `isBookmarked`, `isFeatured`, and `quotePreview` clearly separated from backend core fields.

For now, focus only on frontend unless the user asks for backend.

## UI/UX Direction

Design style:
- Warm minimal
- Clean cards
- Writer-focused
- Readable
- Professional
- Not playful
- Not noisy
- Not like Facebook, Instagram, or Twitter

Theme colors:
- Page background: #FAF7F0
- Card background: #FFFFFF
- Primary text: #1F2933
- Muted text: #6B7280
- Border: #E5E7EB
- Accent: #FF6719
- Accent hover: #E85D16
- Soft accent: #FFF1E8

Typography:
- Use Inter for UI elements.
- Use Merriweather or Georgia for post titles and article content.
- Use readable spacing and line height.
- Avoid playful fonts.

## Layout Rules

Home page:
- Sticky navbar
- Hero section
- Feed tabs
- Main post feed
- Right sidebar on desktop only
- Single column on mobile

Post cards:
- Author info first
- Post title
- Short preview
- Optional image
- Quiet interaction row
- Reaction, comment, bookmark, read more

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
- AuthorCard
- SuggestedAuthors
- TopicsCard
- NewsletterCard
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
- rounded-2xl cards
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
