import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { email, password } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ ok: false, error: 'Email and password required' }, { status: 400 })
    }

    // Mock authentication - replace with real DB/auth in production
    const validEmail = 'demo@gohealth.test'
    const validPassword = 'password'

    if (email === validEmail && password === validPassword) {
      const token = 'fake-jwt-token'
      return NextResponse.json({ ok: true, token, user: { email } }, { status: 200 })
    }

    return NextResponse.json({ ok: false, error: 'Invalid credentials' }, { status: 401 })
  } catch (err) {
    return NextResponse.json({ ok: false, error: 'Bad request' }, { status: 400 })
  }
}
