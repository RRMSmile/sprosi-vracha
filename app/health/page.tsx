'use client';

import { useEffect, useState } from 'react';

export default function HealthPage() {
  const [status, setStatus] = useState<'ok'|'fail'|'pending'>('pending');
  const [msg, setMsg] = useState<string>('');

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_API_HEALTH;
    if (!url) { setStatus('fail'); setMsg('NEXT_PUBLIC_API_HEALTH не задан'); return; }

    const ctl = new AbortController();
    const timeoutMs = Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS) || 4000;
    const t = setTimeout(() => ctl.abort(), timeoutMs);

    fetch(url, { signal: ctl.signal, credentials: 'omit' })
      .then(r => {
        if (r.ok) { setStatus('ok'); setMsg('API отвечает 200 OK'); }
        else { setStatus('fail'); setMsg(`API ответил ${r.status}`); }
      })
      .catch(e => { setStatus('fail'); setMsg(e?.name === 'AbortError' ? 'Timeout' : (e?.message || 'Fetch error')); })
      .finally(() => clearTimeout(t));

    return () => { clearTimeout(t); ctl.abort(); };
  }, []);

  return (
    <main style={{maxWidth:720,margin:'48px auto',fontFamily:'system-ui,-apple-system,Segoe UI,Roboto,Arial'}}>
      <h1 style={{fontSize:28,marginBottom:8}}>Sprosi-Vracha</h1>
      {status === 'pending' && <p>Проверяю API…</p>}
      {status === 'ok' && <p style={{color:'#059669'}}>✅ API работает</p>}
      {status === 'fail' && <p style={{color:'#dc2626'}}>❌ Ошибка запроса к API<br/><small>{msg}</small></p>}
      <p style={{marginTop:16}}>
        <a href={process.env.NEXT_PUBLIC_API_HEALTH || '#'} target="_blank" rel="noopener noreferrer">Проверить вручную →</a>
      </p>
    </main>
  );
}
