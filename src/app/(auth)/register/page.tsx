'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Field, Package, User, Lock } from '@/components/ui';

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', {
        username,
        full_name: fullName,
        password,
      });
      router.push('/login?registered=1');
    } catch {
      setError('Registration failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="login__card">
        <div className="login__brand">
          <span className="login__logo">
            <Package size={28} color="#fff" />
          </span>
          <div style={{ textAlign: 'center' }}>
            <div className="login__title">
              Stock<b>Mate</b>
            </div>
          </div>
          <div className="login__sub">Create your workspace account</div>
        </div>

        <form className="login__panel" onSubmit={submit}>
          <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-.3px' }}>
            Get started
          </h2>
          <p style={{ fontSize: 13.5, color: 'var(--muted)', marginTop: 4, marginBottom: 22 }}>
            Register to start managing inventory and books.
          </p>

          <Field label="Username">
            <div className="input-wrap">
              <span className="input-wrap__ico">
                <User size={17} />
              </span>
              <input
                className="input input--icon"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                autoComplete="username"
                required
              />
            </div>
          </Field>

          <Field label="Full Name">
            <input
              className="input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              required
            />
          </Field>

          <Field label="Password">
            <div className="input-wrap">
              <span className="input-wrap__ico">
                <Lock size={17} />
              </span>
              <input
                className="input input--icon"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                autoComplete="new-password"
                required
              />
            </div>
          </Field>

          <Field label="Confirm Password">
            <div className="input-wrap">
              <span className="input-wrap__ico">
                <Lock size={17} />
              </span>
              <input
                className="input input--icon"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                required
              />
            </div>
          </Field>

          {error && (
            <p style={{ color: 'var(--danger)', fontSize: 13, margin: '4px 0 14px' }}>{error}</p>
          )}

          <button
            className="btn btn--primary btn--block"
            type="submit"
            disabled={loading}
            style={{ height: 44, marginTop: 6, opacity: loading ? 0.85 : 1 }}
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>

          <div className="login__hl">or</div>
          <a className="btn btn--ghost btn--block" href="/login">
            Sign in instead
          </a>
        </form>

        <div className="login__foot">Protected workspace · Addis Ababa</div>
      </div>
    </div>
  );
}
