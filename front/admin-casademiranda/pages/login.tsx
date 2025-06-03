import { useState } from 'react';
import axios from 'axios';
import Router from 'next/router';


export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const res = await axios.post('http://localhost:3003/login', { username, password });
      localStorage.setItem('token', res.data.token);
      Router.push('/');
    } catch (err) {
      alert('Login fallido');
    }
  };

  return (
    <div>
      <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Usuario" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña" />
      <button onClick={handleLogin}>Iniciar sesión</button>
    </div>
  );
}