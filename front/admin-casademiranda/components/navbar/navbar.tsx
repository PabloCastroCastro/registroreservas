'use client';

import { Navbar } from 'flowbite-react';
import logo from '../../public/logo.jpg'
import Image from "next/image";
import Link from 'next/link';

export default function DefaultNavbar() {
    return (
        <Navbar fluid rounded>
            <Navbar.Brand>
                <Image
                    alt="Logo Casa de Miranda"
                    className="mr-3 h-6 sm:h-9"
                    src={logo}
                    width="100" 
                    height="80"
                />
                <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">Casa de Miranda</span>
            </Navbar.Brand>
            <Navbar.Toggle />
            <Navbar.Collapse>
                <Navbar.Link active href="#">
                    <Link href="/">Home</Link>
                </Navbar.Link>
            </Navbar.Collapse>
        </Navbar>
    )
}


