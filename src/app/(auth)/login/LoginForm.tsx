'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { Field, Package, User, Lock, Eye } from '@/components/ui';

export default function LoginForm({ registered = false }: { registered?: boolean }) {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data } = await api.post<{ access_token: string; token_type: string }>(
        '/auth/login',
        { username, password }
      );
      login(data.access_token);
      router.push('/dashboard');
    } catch {
      setError('Invalid username or password.');
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
          <div className="login__sub">Wholesale inventory &amp; accounting</div>
        </div>

        <form className="login__panel" onSubmit={submit}>
          <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-.3px' }}>
            Welcome back
          </h2>
          <p style={{ fontSize: 13.5, color: 'var(--muted)', marginTop: 4, marginBottom: 22 }}>
            Sign in to manage your inventory and books.
          </p>

          {registered && (
            <div
              className="badge badge--green"
              style={{ width: '100%', height: 'auto', padding: '10px 12px', marginBottom: 16 }}
            >
              Registration successful — please sign in.
            </div>
          )}

          <Field label="Username">
            <div className="input-wrap">
              <span className="input-wrap__ico">
                <User size={17} />
              </span>
              <input
                className="input input--icon"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                autoComplete="username"
                required
              />
            </div>
          </Field>

          <Field label="Password">
            <div className="input-wrap">
              <span className="input-wrap__ico">
                <Lock size={17} />
              </span>
              <input
                className="input input--icon"
                type={show ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="input-affix"
                style={{ background: 'none', border: 'none', display: 'grid', placeItems: 'center' }}
                onClick={() => setShow((s) => !s)}
                title="Show password"
              >
                <Eye size={17} />
              </button>
            </div>
          </Field>

          <div className="row between" style={{ margin: '2px 0 20px' }}>
            <label
              className="row"
              style={{ gap: 8, fontSize: 13, color: 'var(--muted)', cursor: 'pointer' }}
            >
              <input
                type="checkbox"
                defaultChecked
                style={{ width: 15, height: 15, accentColor: 'var(--primary)' }}
              />
              Remember me
            </label>
            <a className="mutedlink" href="#" onClick={(e) => e.preventDefault()}>
              Forgot password?
            </a>
          </div>

          {error && (
            <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 14 }}>{error}</p>
          )}

          <button
            className="btn btn--primary btn--block"
            type="submit"
            disabled={loading}
            style={{ height: 44, opacity: loading ? 0.85 : 1 }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>

          <div className="login__hl">or</div>
          <a className="btn btn--ghost btn--block" href="/register">
            Create an account
          </a>
        </form>

        <div className="login__foot">
          Protected workspace · ERCA receipt-compliance ready · Addis Ababa
        </div>
      </div>
    </div>
  );
}
