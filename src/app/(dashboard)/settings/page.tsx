'use client';

import { useEffect, useState } from 'react';
import { useCurrentUser, useUpdateProfile, useChangePassword } from '@/hooks/useUser';
import { getApiErrorMessage } from '@/lib/errors';
import { formatDate } from '@/lib/format';
import { Field, Toast, User as UserIcon, Lock } from '@/components/ui';

export default function SettingsPage() {
  const { data: user, isLoading } = useCurrentUser();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  };

  /* ---- Profile ---- */
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name);
      setUsername(user.username);
    }
  }, [user]);

  const profileDirty =
    !!user && (fullName !== user.full_name || username !== user.username);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    if (!user) return;
    const payload: { full_name?: string; username?: string } = {};
    if (fullName !== user.full_name) payload.full_name = fullName;
    if (username !== user.username) payload.username = username;
    try {
      await updateProfile.mutateAsync(payload);
      showToast('Profile updated');
    } catch (err) {
      setProfileError(getApiErrorMessage(err, 'Failed to update profile.'));
    }
  };

  /* ---- Change password ---- */
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwError, setPwError] = useState<string | null>(null);

  const changePw = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    if (newPw.length < 6) {
      setPwError('New password must be at least 6 characters.');
      return;
    }
    if (newPw !== confirmPw) {
      setPwError('New passwords do not match.');
      return;
    }
    try {
      await changePassword.mutateAsync({
        current_password: currentPw,
        new_password: newPw,
      });
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
      showToast('Password changed successfully');
    } catch (err) {
      setPwError(getApiErrorMessage(err, 'Failed to change password.'));
    }
  };

  return (
    <div className="content__inner" style={{ maxWidth: 760 }}>
      {/* Profile */}
      <div className="card">
        <div className="card__head">
          <div>
            <div className="card__title">Profile</div>
            <div className="card__sub">Update your account details</div>
          </div>
          <span className="stat__ico t-blue">
            <UserIcon size={18} />
          </span>
        </div>
        <form onSubmit={saveProfile} style={{ padding: '20px 20px 22px' }}>
          {isLoading && !user ? (
            <>
              <div className="sk sk-line" style={{ width: '40%', marginBottom: 14 }} />
              <div className="sk" style={{ height: 44, borderRadius: 10, marginBottom: 16 }} />
              <div className="sk" style={{ height: 44, borderRadius: 10 }} />
            </>
          ) : (
            <>
              <div className="field-grid">
                <Field label="Full Name">
                  <input
                    className="input"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                  />
                </Field>
                <Field label="Username">
                  <input
                    className="input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Your username"
                  />
                </Field>
              </div>

              {user && (
                <div
                  className="row"
                  style={{ gap: 22, margin: '4px 0 18px', flexWrap: 'wrap' }}
                >
                  <div>
                    <div className="field__label" style={{ marginBottom: 2 }}>
                      Status
                    </div>
                    <span className={'badge badge--' + (user.is_active ? 'green' : 'red')}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div>
                    <div className="field__label" style={{ marginBottom: 2 }}>
                      Member since
                    </div>
                    <div style={{ fontSize: 13.5, color: 'var(--muted)' }}>
                      {formatDate(user.created_at)}
                    </div>
                  </div>
                  <div>
                    <div className="field__label" style={{ marginBottom: 2 }}>
                      User ID
                    </div>
                    <div className="tnum" style={{ fontSize: 12, color: 'var(--muted-2)' }}>
                      {user.id}
                    </div>
                  </div>
                </div>
              )}

              {profileError && (
                <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>
                  {profileError}
                </p>
              )}

              <div className="row" style={{ justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={!profileDirty || updateProfile.isPending}
                  style={{ opacity: !profileDirty || updateProfile.isPending ? 0.6 : 1 }}
                >
                  {updateProfile.isPending ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>

      {/* Change password */}
      <div className="card section-gap">
        <div className="card__head">
          <div>
            <div className="card__title">Change Password</div>
            <div className="card__sub">Use at least 6 characters</div>
          </div>
          <span className="stat__ico t-amber">
            <Lock size={18} />
          </span>
        </div>
        <form onSubmit={changePw} style={{ padding: '20px 20px 22px' }}>
          <Field label="Current Password">
            <input
              className="input"
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              autoComplete="current-password"
              required
            />
          </Field>
          <div className="field-grid">
            <Field label="New Password">
              <input
                className="input"
                type="password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                autoComplete="new-password"
                required
              />
            </Field>
            <Field label="Confirm New Password">
              <input
                className="input"
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                autoComplete="new-password"
                required
              />
            </Field>
          </div>

          {pwError && (
            <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>{pwError}</p>
          )}

          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={changePassword.isPending}
              style={{ opacity: changePassword.isPending ? 0.6 : 1 }}
            >
              {changePassword.isPending ? 'Updating…' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      {toast && <Toast>{toast}</Toast>}
    </div>
  );
}
