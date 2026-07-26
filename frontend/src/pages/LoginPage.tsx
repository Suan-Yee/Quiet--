import { useState, type FormEvent } from 'react'
import { ArrowRight, LockKeyhole, Mail } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router'
import Button from '../components/common/Button'
import AuthLayout from '../components/layout/AuthLayout'
import { mockCurrentUser } from '../data/mockCurrentUser'
import { getMockUser, saveMockUser } from '../utils/localAuth'

const inputStyles =
  'mt-2 h-12 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] pl-11 pr-4 text-sm font-medium text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-muted)] hover:border-[var(--color-border-soft)] focus:border-[var(--color-accent)] focus:ring-3 focus:ring-[var(--color-soft-accent)]'

function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [messages, setMessages] = useState<string[]>([])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextMessages: string[] = []

    if (!email.trim()) {
      nextMessages.push('Email is required.')
    }

    if (!password) {
      nextMessages.push('Password is required.')
    }

    if (email.trim() && !/^\S+@\S+\.\S+$/.test(email)) {
      nextMessages.push('Enter a valid email address.')
    }

    if (nextMessages.length > 0) {
      setMessages(nextMessages)
      return
    }

    const existingUser = getMockUser()
    saveMockUser({
      name: existingUser?.name ?? mockCurrentUser.name,
      email: email.trim(),
      username: existingUser?.username ?? mockCurrentUser.username,
      profileImage: existingUser?.profileImage ?? mockCurrentUser.profileImage,
      authorDescription: existingUser?.authorDescription ?? mockCurrentUser.authorDescription,
    })
    navigate('/profile')
  }

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Return to your room"
      subtitle="Your saved stories, drafts, and writers are ready when you are."
      footer={(
        <p>
          New to Quiet?{' '}
          <NavLink
            className="font-bold text-[var(--color-accent)] transition hover:text-[var(--color-accent-hover)]"
            to="/register"
          >
            Create your room
          </NavLink>
        </p>
      )}
    >
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        {messages.length > 0 ? (
          <div
            id="login-errors"
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
              aria-describedby={messages.length > 0 ? 'login-errors' : undefined}
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
              autoComplete="current-password"
              className={inputStyles}
              placeholder="Your password"
              type="password"
              value={password}
              aria-invalid={messages.some((message) => message.toLowerCase().includes('password'))}
              aria-describedby={messages.length > 0 ? 'login-errors' : undefined}
              onChange={(event) => {
                setPassword(event.target.value)
                setMessages([])
              }}
            />
          </span>
        </label>

        <Button className="w-full gap-2 py-3" type="submit">
          Enter your room
          <ArrowRight aria-hidden="true" size={17} />
        </Button>
      </form>
    </AuthLayout>
  )
}

export default LoginPage
