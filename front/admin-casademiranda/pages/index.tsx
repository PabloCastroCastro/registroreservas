import "@/app/globals.css";
import Bookings from '../components/bookings/bookings'
import Login from './login'
import Navbar from '../components/navbar/navbar'
import { useEffect, useState } from 'react';


export default function Home() {

    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const tokenGuardado = localStorage.getItem('token');
        setToken(tokenGuardado);
        setLoading(false);
    }, []);

    if (loading) return <p>Cargando...</p>;

    if (!token) {
        return <Login />;
    }

    return (
        <>
            <Navbar></Navbar>
            <Bookings />
        </>
    )
}