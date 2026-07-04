import { useState, type FormEvent } from 'react'
import { NavLink, useNavigate } from 'react-router'
import Button from '../components/common/Button'
import AuthLayout from '../components/layout/AuthLayout'
import { mockCurrentUser } from '../data/mockCurrentUser'
import { saveMockUser } from '../utils/localAuth'

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
      avatar: mockCurrentUser.avatar,
      description: mockCurrentUser.description,
    })
    navigate('/profile')
  }

  return (
    <AuthLayout
      eyebrow="Start your page"
      title="Create a thoughtful space"
      subtitle="Set up a local mock account for drafting posts and previewing the product flow."
      footer={(
        <p>
          Already have an account?{' '}
          <NavLink className="font-semibold text-[#FF6719] transition hover:text-[#E85D16] dark:text-[#FF7A2F]" to="/login">
            Login
          </NavLink>
        </p>
      )}
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        {messages.length > 0 ? (
          <div className="rounded-2xl border border-[#EBCAB8] bg-[#FFFDF9] px-4 py-3 text-sm text-[#6B7280] dark:border-[#4A3D32] dark:bg-[#1D1813] dark:text-[#B8AEA3]">
            <p className="font-semibold text-[#1F2933] dark:text-[#F5EFE7]">Before creating your account</p>
            <ul className="mt-2 space-y-1">
              {messages.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <label className="block text-sm font-semibold text-[#1F2933] dark:text-[#F5EFE7]">
          Name
          <input
            autoComplete="name"
            className="mt-2 w-full rounded-2xl border border-[#E8E1D8] bg-white px-4 py-3 text-sm font-medium text-[#1F2933] outline-none transition placeholder:text-[#A8A29A] focus:border-[#FF6719] focus:ring-4 focus:ring-[#FFF1E8] dark:border-[#3A3027] dark:bg-[#1D1813] dark:text-[#F5EFE7] dark:placeholder:text-[#7D7167] dark:focus:border-[#FF7A2F] dark:focus:ring-[#3A2116]"
            placeholder="Maya Chen"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>

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
            autoComplete="new-password"
            className="mt-2 w-full rounded-2xl border border-[#E8E1D8] bg-white px-4 py-3 text-sm font-medium text-[#1F2933] outline-none transition placeholder:text-[#A8A29A] focus:border-[#FF6719] focus:ring-4 focus:ring-[#FFF1E8] dark:border-[#3A3027] dark:bg-[#1D1813] dark:text-[#F5EFE7] dark:placeholder:text-[#7D7167] dark:focus:border-[#FF7A2F] dark:focus:ring-[#3A2116]"
            placeholder="At least 6 characters"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        <label className="block text-sm font-semibold text-[#1F2933] dark:text-[#F5EFE7]">
          Confirm password
          <input
            autoComplete="new-password"
            className="mt-2 w-full rounded-2xl border border-[#E8E1D8] bg-white px-4 py-3 text-sm font-medium text-[#1F2933] outline-none transition placeholder:text-[#A8A29A] focus:border-[#FF6719] focus:ring-4 focus:ring-[#FFF1E8] dark:border-[#3A3027] dark:bg-[#1D1813] dark:text-[#F5EFE7] dark:placeholder:text-[#7D7167] dark:focus:border-[#FF7A2F] dark:focus:ring-[#3A2116]"
            placeholder="Repeat your password"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </label>

        <Button className="w-full py-3 dark:bg-[#FF7A2F] dark:hover:bg-[#F06E24]" type="submit">
          Register
        </Button>
      </form>
    </AuthLayout>
  )
}

export default RegisterPage
