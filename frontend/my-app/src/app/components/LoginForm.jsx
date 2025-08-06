import { useState } from 'react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async () => {
    try {
      // 模擬登入 API（這裡可以改成你自己的 API 位址）
      const res = await fetch('https://example.com/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        throw new Error('登入失敗');
      }

      const data = await res.json();

      // 儲存 token 到 localStorage
      localStorage.setItem('token', data.token);

      setMessage('登入成功 ✅');
    } catch (error) {
      setMessage('登入失敗 ❌');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <h2>登入頁面</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ display: 'block', marginBottom: '10px', width: '100%' }}
      />
      <input
        type="password"
        placeholder="密碼"
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={{ display: 'block', marginBottom: '10px', width: '100%' }}
      />
      <button onClick={handleLogin}>登入</button>
      <p>{message}</p>
    </div>
  );
}
