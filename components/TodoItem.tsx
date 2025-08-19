'use client'
import { useState } from 'react'
import { clsx } from 'clsx'

type Props = {
  id: number
  title: string
  completed: number
  onToggle: (id: number, completed: boolean) => Promise<void>
  onDelete: (id: number) => Promise<void>
  onRename: (id: number, title: string) => Promise<void>
}

export default function TodoItem({ id, title, completed, onToggle, onDelete, onRename }: Props) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(title)
  const [pending, setPending] = useState(false)

  async function saveEdit() {
    if (!val.trim()) return
    setPending(true)
    try { await onRename(id, val.trim()); setEditing(false) } finally { setPending(false) }
  }

  return (
    <li className="flex items-center gap-3 py-3 border-b">
      <input type="checkbox" className="checkbox" checked={!!completed} onChange={() => onToggle(id, !completed)} />
      {editing ? (
        <input className="input" value={val} onChange={(e)=>setVal(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter') saveEdit(); if(e.key==='Escape') setEditing(false) }} autoFocus />
      ) : (
        <span className={clsx('flex-1', completed ? 'line-through text-gray-400' : '')}>{title}</span>
      )}
      {editing ? (
        <div className="flex gap-2">
          <button className="btn-primary" onClick={saveEdit} disabled={pending}>Save</button>
          <button className="btn-outline" onClick={()=>setEditing(false)} disabled={pending}>Cancel</button>
        </div>
      ) : (
        <div className="flex gap-2">
          <button className="btn-outline" onClick={()=>setEditing(true)}>Rename</button>
          <button className="btn-outline" onClick={()=>onDelete(id)}>Delete</button>
        </div>
      )}
    </li>
  )
}
