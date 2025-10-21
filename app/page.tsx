'use client';
import { useEffect, useState } from 'react';

export default function Home() {
  const [status,setStatus] = useState('…');

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/v1/health`)
      .then(r => r.json())
      .then(() => setStatus('✅ API работает'))
      .catch(() => setStatus('❌ Ошибка подключения'));
  }, []);

  return (
    <main>
      <h1>Sprosi-Vracha</h1>
      <p>{status}</p>
      <a href="/health/">Проверить вручную →</a>
    </main>
  );
}

