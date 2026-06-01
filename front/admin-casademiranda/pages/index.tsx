import "@/app/globals.css";
import Bookings from '../components/bookings/bookings'
import Navbar from '../components/navbar/navbar'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';


export default function Home() {

    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    function isTokenExpired(token: string): boolean {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const now = Math.floor(Date.now() / 1000);
            return payload.exp < now;
        } catch (e) {
            return true;
        }
    }

    useEffect(() => {
        const tokenGuardado = localStorage.getItem('token');
        console.log(tokenGuardado);
        if (!tokenGuardado || isTokenExpired(tokenGuardado)) {
            router.push('/login');
        }
        setToken(tokenGuardado);
        setLoading(false);
    }, [router]);

    if (loading) return <div className="flex justify-center items-center h-screen">Cargando...</div>;

    return (
        <>
            <Navbar></Navbar>
            <Bookings />
        </>
    )
}