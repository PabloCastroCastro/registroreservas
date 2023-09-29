'use client';

import { Navbar } from 'flowbite-react';
import logo from '../../public/logo.jpg'
import Image from "next/image";
import Link from 'next/link';

export default function DefaultNavbar() {
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
                <Link href="/booking/new-booking"><p className='text-gray text-opacity-75 font-semibold'>Crear Reserva</p></Link>
                <Link href="/"><p className='text-gray text-opacity-75 font-semibold'>Home</p></Link>
            </Navbar.Collapse>
        </Navbar>
    )
}


