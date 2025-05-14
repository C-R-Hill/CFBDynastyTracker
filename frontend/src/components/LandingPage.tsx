import React, { useState } from 'react';

export default function LandingPage({ onAuth }: { onAuth: (token: string, user: any) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ email: '', password: '', username: '' });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mode === 'register' ? form : { email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Auth failed');
      onAuth(data.token, data.user);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black bg-[url('/cfb-texture.png')] bg-cover">
      <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-8 text-center drop-shadow-lg">
        Welcome to the <br />
        <span className="text-white">College Football Dynasty Tracker!</span>
      </h1>
      <div className="bg-black bg-opacity-80 p-8 rounded-lg shadow-lg w-full max-w-md border border-white/10">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === 'register' && (
            <input
              className="p-3 rounded bg-neutral-900 text-white placeholder-gray-400 border border-white/10"
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              required
            />
          )}
          <input
            className="p-3 rounded bg-neutral-900 text-white placeholder-gray-400 border border-white/10"
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            className="p-3 rounded bg-neutral-900 text-white placeholder-gray-400 border border-white/10"
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          {error && <div className="text-red-400 text-center">{error}</div>}
          <button
            type="submit"
            className="bg-white text-black font-bold py-2 rounded hover:bg-gray-200 transition border border-white/10"
          >
            {mode === 'login' ? 'Sign In' : 'Register'}
          </button>
        </form>
        <div className="mt-4 text-center text-gray-300">
          {mode === 'login' ? (
            <>
              New here?{' '}
              <button className="text-white underline" onClick={() => setMode('register')}>
                Register
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button className="text-white underline" onClick={() => setMode('login')}>
                Sign In
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 