import Button from '../common/Button'
import Card from '../common/Card'

function NewsletterCard() {
  return (
    <Card className="border-[#F3D9CB] bg-[#FFF1E8] p-6 shadow-sm shadow-[#FF6719]/10 dark:border-[var(--color-border)] dark:bg-[var(--color-soft-accent)]">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
        Newsletter
      </p>
      <h2 className="mt-2 font-reading text-2xl font-bold text-[var(--color-text)]">Weekly letter</h2>
      <p className="mt-3 text-sm leading-7 text-[var(--color-secondary)]">
        Get a quiet digest of thoughtful posts from independent writers.
      </p>
      <form className="mt-4 space-y-3">
        <input
          type="email"
          placeholder="Email address"
          className="h-11 w-full rounded-full border border-[var(--color-border)] bg-[var(--color-input)] px-4 text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)]"
        />
        <Button type="button" className="w-full">
          Subscribe
        </Button>
      </form>
    </Card>
  )
}

export default NewsletterCard
