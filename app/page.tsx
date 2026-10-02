"use client";

import { FormEvent, useEffect, useState } from "react";

type Todo = { id: string; text: string; done: boolean };

const STORAGE_KEY = "todo-app:items";

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setTodos(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch {}
  }, [todos, loaded]);

  const add = (e: FormEvent) => {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    setTodos((prev) => [{ id: crypto.randomUUID(), text: value, done: false }, ...prev]);
    setText("");
  };

  const toggle = (id: string) =>
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const remove = (id: string) => setTodos((prev) => prev.filter((t) => t.id !== id));

  const remaining = todos.filter((t) => !t.done).length;

  return (
    <main className="wrap">
      <h1 className="title">今日のやること</h1>
      <p className="sub">
        {todos.length === 0 ? "タスクを追加しましょう" : `残り ${remaining} 件 / 全 ${todos.length} 件`}
      </p>

      <form className="form" onSubmit={add}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="新しいタスクを入力"
          aria-label="新しいタスク"
          maxLength={100}
        />
        <button type="submit" disabled={!text.trim()}>
          追加
        </button>
      </form>

      <ul className="list">
        {todos.map((t) => (
          <li key={t.id} className={t.done ? "item done" : "item"}>
            <label>
              <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} />
              <span className="check" aria-hidden />
              <span className="text">{t.text}</span>
            </label>
            <button className="del" onClick={() => remove(t.id)} aria-label={`「${t.text}」を削除`}>
              ×
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
