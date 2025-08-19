'use client'
import useSWR from 'swr'
import TodoForm from '@/components/TodoForm'
import TodoItem from '@/components/TodoItem'
import { useRouter } from 'next/navigation'

type Todo = { id: number; title: string; completed: number; createdAt: string; updatedAt: string }
type Me = { user: { id: number; email: string } }

const fetcher = (url: string) => fetch(url).then(r => { if (r.status === 401) throw new Error('unauthorized'); return r.json() })

export default function Page() {
  const router = useRouter()
  const { data: me, error: meErr } = useSWR<Me>('/api/auth/me', fetcher)
  const { data, mutate } = useSWR<Todo[]>('/api/todos', fetcher, { shouldRetryOnError: false })

  if (meErr?.message === 'unauthorized') { if (typeof window !== 'undefined') router.push('/login'); return null }

  async function addTodo(title: string) { await fetch('/api/todos', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ title }) }); await mutate() }
  async function toggleTodo(id: number, completed: boolean) { await fetch(`/api/todos/${id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ completed }) }); await mutate() }
  async function deleteTodo(id: number) { await fetch(`/api/todos/${id}`, { method:'DELETE' }); await mutate() }
  async function renameTodo(id: number, title: string) { await fetch(`/api/todos/${id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ title }) }); await mutate() }
  async function logout() { await fetch('/api/auth/logout', { method: 'POST' }); router.push('/login') }

  return (
    <main>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold">Your Tasks</h2>
          {me?.user && <p className="text-gray-600 text-sm">Signed in as <span className="font-medium">{me.user.email}</span></p>}
        </div>
        <button className="btn-outline" onClick={logout}>Log out</button>
      </div>
      <TodoForm onAdd={addTodo} />
      <div className="card">
        {data && data.length > 0 ? (
          <ul>
            {data.map(t => (
              <TodoItem key={t.id} id={t.id} title={t.title} completed={t.completed} onToggle={toggleTodo} onDelete={deleteTodo} onRename={renameTodo} />
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No tasks yet. Add your first one!</p>
        )}
      </div>
    </main>
  )
}
