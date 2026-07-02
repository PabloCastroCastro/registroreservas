import "@/app/globals.css";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Tabs } from 'flowbite-react';
import Navbar from '@/components/navbar/navbar';
import { isAdmin } from '@/auth/auth';

export default function Contabilidad() {
    const router = useRouter();
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        if (!isAdmin()) { router.replace('/'); return; }
        setChecked(true);
    }, []);

    if (!checked) return null;

    return (
        <>
            <Navbar />
            <div className="px-4 md:px-10 mt-5">
                <h1 className="text-xl text-green text-opacity-75 font-semibold mb-5">Contabilidad</h1>

                <Tabs.Group style="underline">
                    <Tabs.Item active title="Facturas emitidas">
                        <p className="text-sm text-gray">Próximamente</p>
                    </Tabs.Item>
                    <Tabs.Item title="Facturas proveedores">
                        <p className="text-sm text-gray">Próximamente</p>
                    </Tabs.Item>
                    <Tabs.Item title="Informe / Gestoría">
                        <p className="text-sm text-gray">Próximamente</p>
                    </Tabs.Item>
                </Tabs.Group>
            </div>
        </>
    );
}
