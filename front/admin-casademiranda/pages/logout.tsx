import { useEffect } from 'react';
import Router from 'next/router';


export default function Logout() {

  useEffect(() => {
    localStorage.removeItem('token');
    Router.push('/login');
  }, []);

  return <p>Cerrando sesión...</p>;
}