import "@/app/globals.css";
import { useState } from 'react';
import Router from 'next/router';
import * as APIUser from '@/services/users';
import { User } from '@/interfaces/user';
import { TextInput } from 'flowbite-react';
import logo from '../public/logo.jpg'
import Image from "next/image";

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const user: User = {
        username,
        password,
      };

      const res = await APIUser.login(user);
      localStorage.setItem('token', res.token);

      Router.push('/');
    } catch (err) {
      console.error(err);
      alert('Login fallido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col justify-center items-center h-screen gap-3 px-4">
        <Image
          alt="Logo Casa de Miranda"
          src={logo}
          width="260"
          height="170"
        />
        <TextInput className="w-full max-w-xs" type="text" name="username" value={username} onChange={e => setUsername(e.target.value)} disabled={loading} placeholder="Usuario" />
        <TextInput className="w-full max-w-xs" type="password" name="password" value={password} onChange={e => setPassword(e.target.value)} disabled={loading} placeholder="Contraseña" />
        <button className="w-full max-w-xs rounded-full bg-green bg-opacity-50 py-2" onClick={handleLogin} disabled={loading}>
          <p className="text-black text-opacity-75 font-semibold">{loading ? 'Cargando...' : 'Iniciar sesión'}</p>
        </button>
      </div>
    </>
  );
}
