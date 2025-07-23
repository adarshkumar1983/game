// src/components/auth/RegisterForm.tsx
'use client';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'player' | 'owner'>('player'); // Default role is 'player'
  const [error, setError] = useState('');
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    try {
      await register({ name, email, password, role });
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto">
      {error && <p className="text-red-500">{error}</p>}
      <div>
        <label className="block mb-1">Full Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full p-2 border rounded" />
      </div>
      <div>
        <label className="block mb-1">Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-2 border rounded" />
      </div>
      <div>
        <label className="block mb-1">Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full p-2 border rounded" />
      </div>
      <div>
        <label className="block mb-2">I am a:</label>
        <div className="flex gap-x-4">
          <label className="flex items-center">
            <input type="radio" name="role" value="player" checked={role === 'player'} onChange={() => setRole('player')} className="mr-2" />
            Player
          </label>
          <label className="flex items-center">
            <input type="radio" name="role" value="owner" checked={role === 'owner'} onChange={() => setRole('owner')} className="mr-2" />
            Court Owner
          </label>
        </div>
      </div>
      <button type="submit" className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600">Register</button>
    </form>
  );
}