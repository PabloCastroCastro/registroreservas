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
      <div className="flex flex-col justify-center h-screen gap-2">
        <div className="grid grid-cols-9 gap-3">
          <Image
            alt="Logo Casa de Miranda"
            className="col-start-5"
            src={logo}
            width="260"
            height="170"
          />
        </div>
        <div className="grid grid-cols-9 gap-3">
          <TextInput className="col-start-5 col-span-1" type="text" name="username" value={username} onChange={e => setUsername(e.target.value)} disabled={loading}></TextInput>
        </div>
        <div className="grid grid-cols-9 gap-3">
          <TextInput className="col-start-5 col-span-1" type="password" name="password" value={password} onChange={e => setPassword(e.target.value)} disabled={loading}></TextInput>
        </div>
        <div className="grid grid-cols-9">
          <button className="col-start-5 col-span-1 rounded-full bg-green bg-opacity-50" onClick={handleLogin} disabled={loading}>
            <p className="text-black text-opacity-75 font-semibold">{loading ? 'Cargando...' : 'Iniciar sesión'}</p>
          </button>
        </div>
      </div>
    </>
  );
}
