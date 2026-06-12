'use client';

import { Navbar } from 'flowbite-react';
import logo from '../../public/logo.jpg'
import Image from "next/image";
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getRole } from '@/auth/auth';

const NAV_LINKS = [
    { href: '/', label: 'Reservas', exact: true, adminOnly: false },
    { href: '/booking/new-booking', label: 'Crear reserva', adminOnly: false },
    { href: '/booking/load-booking', label: 'Cargar reservas', adminOnly: false },
    { href: '/menu', label: 'Carta de cenas', adminOnly: false },
    { href: '/checkin-xml', label: 'Check-in XML', adminOnly: false },
    { href: '/precios-base', label: 'Precios base', adminOnly: false },
    { href: '/usuarios', label: 'Usuarios', adminOnly: true },
];

export default function DefaultNavbar() {
    const router = useRouter();
    const [token, setToken] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        const tokenGuardado = localStorage.getItem('token');
        if (tokenGuardado) setToken(tokenGuardado);
        setRole(getRole());
    }, []);

    function isActive(href: string, exact?: boolean) {
        if (exact) return router.pathname === href;
        return router.pathname.startsWith(href);
    }

    return (
        <Navbar fluid rounded className="border-b border-gray-light shadow-sm">
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
                {NAV_LINKS.filter(({ adminOnly }) => !adminOnly || role === 'admin').map(({ href, label, exact }) => (
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
                    <span className="text-sm font-semibold px-3 py-1.5 rounded-lg border border-gray-light text-gray hover:border-orange hover:text-orange transition-colors">
                        Cerrar sesión
                    </span>
                </Link>
            </Navbar.Collapse>
        </Navbar>
    )
}
