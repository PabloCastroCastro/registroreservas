'use client';

import { Navbar } from 'flowbite-react';
import logo from '../../public/logo.jpg'
import Image from "next/image";
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const NAV_LINKS = [
    { href: '/', label: 'Reservas', exact: true },
    { href: '/booking/new-booking', label: 'Crear reserva' },
    { href: '/booking/load-booking', label: 'Cargar reservas' },
    { href: '/menu', label: 'Carta de cenas' },
];

export default function DefaultNavbar() {
    const router = useRouter();
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const tokenGuardado = localStorage.getItem('token');
        if (tokenGuardado) setToken(tokenGuardado);
    }, []);

    function isActive(href: string, exact?: boolean) {
        if (exact) return router.pathname === href;
        return router.pathname.startsWith(href);
    }

    return (
        <Navbar fluid rounded>
            <Navbar.Brand href="/">
                <Image
                    alt="Logo Casa de Miranda"
                    className="mr-3"
                    src={logo}
                    width="180"
                    height="150"
                />
            </Navbar.Brand>
            <Navbar.Toggle />
            <Navbar.Collapse>
                {NAV_LINKS.map(({ href, label, exact }) => (
                    <Link key={href} href={href}>
                        <span className={`
                            text-sm font-semibold px-1 py-0.5 rounded transition-colors
                            ${isActive(href, exact)
                                ? 'text-green border-b-2 border-green'
                                : 'text-gray hover:text-gray-dark'}
                        `}>
                            {label}
                        </span>
                    </Link>
                ))}
                <Link href="/logout">
                    <span className="text-sm font-semibold px-1 py-0.5 text-gray hover:text-orange transition-colors">
                        Cerrar sesión
                    </span>
                </Link>
            </Navbar.Collapse>
        </Navbar>
    )
}
