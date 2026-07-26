import { useState, type FormEvent } from 'react'
import { ArrowRight, LockKeyhole, Mail, UserRound } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router'
import Button from '../components/common/Button'
import AuthLayout from '../components/layout/AuthLayout'
import { mockCurrentUser } from '../data/mockCurrentUser'
import { saveMockUser } from '../utils/localAuth'

const inputStyles =
  'mt-2 h-12 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] pl-11 pr-4 text-sm font-medium text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-muted)] hover:border-[var(--color-border-soft)] focus:border-[var(--color-accent)] focus:ring-3 focus:ring-[var(--color-soft-accent)]'

function RegisterPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [messages, setMessages] = useState<string[]>([])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextMessages: string[] = []

    if (!name.trim()) {
      nextMessages.push('Name is required.')
    }

    if (!email.trim()) {
      nextMessages.push('Email is required.')
    }

    if (email.trim() && !/^\S+@\S+\.\S+$/.test(email)) {
      nextMessages.push('Enter a valid email address.')
    }

    if (password.length < 6) {
      nextMessages.push('Password must be at least 6 characters.')
    }

    if (password !== confirmPassword) {
      nextMessages.push('Confirm password must match password.')
    }

    if (nextMessages.length > 0) {
      setMessages(nextMessages)
      return
    }

    saveMockUser({
      name: name.trim(),
      email: email.trim(),
      username: name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      profileImage: mockCurrentUser.profileImage,
      authorDescription: mockCurrentUser.authorDescription,
    })
    navigate('/profile')
  }

  return (
    <AuthLayout
      eyebrow="Make it yours"
      title="Create your quiet room"
      subtitle="Keep what you read, follow the ideas that matter, and shape your own work."
      footer={(
        <p>
          Already have an account?{' '}
          <NavLink
            className="font-bold text-[var(--color-accent)] transition hover:text-[var(--color-accent-hover)]"
            to="/login"
          >
            Sign in
          </NavLink>
        </p>
      )}
    >
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        {messages.length > 0 ? (
          <div
            id="register-errors"
            role="alert"
            className="rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger-soft)] px-4 py-3 text-sm text-[var(--color-secondary)]"
          >
            <p className="font-bold text-[var(--color-text)]">Check these details</p>
            <ul className="mt-2 space-y-1">
              {messages.map((message) => (
                <li key={message}>• {message}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <label className="block text-sm font-bold text-[var(--color-text)]">
          Name
          <span className="relative block">
            <UserRound
              aria-hidden="true"
              size={17}
              className="pointer-events-none absolute left-4 top-1/2 mt-1 -translate-y-1/2 text-[var(--color-muted)]"
            />
            <input
              autoComplete="name"
              className={inputStyles}
              placeholder="Your name"
              type="text"
              value={name}
              aria-invalid={messages.some((message) => message.toLowerCase().includes('name'))}
              aria-describedby={messages.length > 0 ? 'register-errors' : undefined}
              onChange={(event) => {
                setName(event.target.value)
                setMessages([])
              }}
            />
          </span>
        </label>

        <label className="block text-sm font-bold text-[var(--color-text)]">
          Email
          <span className="relative block">
            <Mail
              aria-hidden="true"
              size={17}
              className="pointer-events-none absolute left-4 top-1/2 mt-1 -translate-y-1/2 text-[var(--color-muted)]"
            />
            <input
              autoComplete="email"
              className={inputStyles}
              placeholder="you@example.com"
              type="email"
              value={email}
              aria-invalid={messages.some((message) => message.toLowerCase().includes('email'))}
              aria-describedby={messages.length > 0 ? 'register-errors' : undefined}
              onChange={(event) => {
                setEmail(event.target.value)
                setMessages([])
              }}
            />
          </span>
        </label>

        <label className="block text-sm font-bold text-[var(--color-text)]">
          Password
          <span className="relative block">
            <LockKeyhole
              aria-hidden="true"
              size={17}
              className="pointer-events-none absolute left-4 top-1/2 mt-1 -translate-y-1/2 text-[var(--color-muted)]"
            />
            <input
              autoComplete="new-password"
              className={inputStyles}
              placeholder="At least 6 characters"
              type="password"
              value={password}
              aria-invalid={messages.some((message) => message.toLowerCase().includes('password'))}
              aria-describedby={messages.length > 0 ? 'register-errors' : undefined}
              onChange={(event) => {
                setPassword(event.target.value)
                setMessages([])
              }}
            />
          </span>
        </label>

        <label className="block text-sm font-bold text-[var(--color-text)]">
          Confirm password
          <span className="relative block">
            <LockKeyhole
              aria-hidden="true"
              size={17}
              className="pointer-events-none absolute left-4 top-1/2 mt-1 -translate-y-1/2 text-[var(--color-muted)]"
            />
            <input
              autoComplete="new-password"
              className={inputStyles}
              placeholder="Repeat your password"
              type="password"
              value={confirmPassword}
              aria-invalid={messages.some((message) => message.toLowerCase().includes('confirm'))}
              aria-describedby={messages.length > 0 ? 'register-errors' : undefined}
              onChange={(event) => {
                setConfirmPassword(event.target.value)
                setMessages([])
              }}
            />
          </span>
        </label>

        <Button className="mt-1 w-full gap-2 py-3" type="submit">
          Create your room
          <ArrowRight aria-hidden="true" size={17} />
        </Button>
      </form>
    </AuthLayout>
  )
}

export default RegisterPage
