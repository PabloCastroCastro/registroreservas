'use client';

import { Navbar } from 'flowbite-react';

export default function DefaultNavbar() {
    return (
        <Navbar fluid rounded>
            <Navbar.Brand>
                <img
                    alt="Logo Casa de Miranda"
                    className="mr-3 h-6 sm:h-9"
                    src="logo.jpg"
                />
                <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">Casa de Miranda</span>
            </Navbar.Brand>
            <Navbar.Toggle />
            <Navbar.Collapse>
                <Navbar.Link active href="#">
                    <p>Home</p>
                </Navbar.Link>
            </Navbar.Collapse>
        </Navbar>
    )
}


