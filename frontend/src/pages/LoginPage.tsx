import { useState, type FormEvent } from 'react'
import { NavLink, useNavigate } from 'react-router'
import Button from '../components/common/Button'
import AuthLayout from '../components/layout/AuthLayout'
import { mockCurrentUser } from '../data/mockCurrentUser'
import { getMockUser, saveMockUser } from '../utils/localAuth'

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
      avatar: existingUser?.avatar ?? mockCurrentUser.avatar,
      description: existingUser?.description ?? mockCurrentUser.description,
    })
    navigate('/profile')
  }

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Sign in to keep writing"
      subtitle="Return to your reading list, drafts, and quiet corner of the platform."
      footer={(
        <p>
          New to quiet?{' '}
          <NavLink className="font-semibold text-[#FF6719] transition hover:text-[#E85D16] dark:text-[#FF7A2F]" to="/register">
            Create an account
          </NavLink>
        </p>
      )}
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        {messages.length > 0 ? (
          <div className="rounded-2xl border border-[#EBCAB8] bg-[#FFFDF9] px-4 py-3 text-sm text-[#6B7280] dark:border-[#4A3D32] dark:bg-[#1D1813] dark:text-[#B8AEA3]">
            <p className="font-semibold text-[#1F2933] dark:text-[#F5EFE7]">Before signing in</p>
            <ul className="mt-2 space-y-1">
              {messages.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <label className="block text-sm font-semibold text-[#1F2933] dark:text-[#F5EFE7]">
          Email
          <input
            autoComplete="email"
            className="mt-2 w-full rounded-2xl border border-[#E8E1D8] bg-white px-4 py-3 text-sm font-medium text-[#1F2933] outline-none transition placeholder:text-[#A8A29A] focus:border-[#FF6719] focus:ring-4 focus:ring-[#FFF1E8] dark:border-[#3A3027] dark:bg-[#1D1813] dark:text-[#F5EFE7] dark:placeholder:text-[#7D7167] dark:focus:border-[#FF7A2F] dark:focus:ring-[#3A2116]"
            placeholder="maya@example.com"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label className="block text-sm font-semibold text-[#1F2933] dark:text-[#F5EFE7]">
          Password
          <input
            autoComplete="current-password"
            className="mt-2 w-full rounded-2xl border border-[#E8E1D8] bg-white px-4 py-3 text-sm font-medium text-[#1F2933] outline-none transition placeholder:text-[#A8A29A] focus:border-[#FF6719] focus:ring-4 focus:ring-[#FFF1E8] dark:border-[#3A3027] dark:bg-[#1D1813] dark:text-[#F5EFE7] dark:placeholder:text-[#7D7167] dark:focus:border-[#FF7A2F] dark:focus:ring-[#3A2116]"
            placeholder="Your password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        <Button className="w-full py-3 dark:bg-[#FF7A2F] dark:hover:bg-[#F06E24]" type="submit">
          Login
        </Button>
      </form>
    </AuthLayout>
  )
}

export default LoginPage
