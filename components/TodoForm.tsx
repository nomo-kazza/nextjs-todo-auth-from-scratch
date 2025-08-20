'use client';
import { useState } from 'react';

export default function TodoForm({
  onAdd,
}: {
  onAdd: (title: string) => Promise<void>;
}) {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      await onAdd(title.trim());
      setTitle('');
    } finally {
      setLoading(false);
    }
  }
  return (
    <form onSubmit={handleSubmit} className="card mb-6">
      <div className="flex gap-3">
        <input
          className="input"
          placeholder="Add a new task..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
        />
        <button className="btn-primary" disabled={loading || !title.trim()}>
          {loading ? 'Adding...' : 'Add'}
        </button>
      </div>
    </form>
  );
}
