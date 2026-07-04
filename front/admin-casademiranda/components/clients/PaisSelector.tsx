import { useEffect, useRef, useState } from 'react';
import { normalize } from '@/utils/municipioSearch';

type Pais = { codigo: string; pais: string };

interface Props {
    paises: Pais[];
    value: string;
    onChange: (codigo: string) => void;
}

export function PaisSelector({ paises, value, onChange }: Props) {
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const p = paises.find(p => p.codigo === value);
        setQuery(p?.pais ?? '');
    }, [value, paises]);

    const filtered = query.length >= 2
        ? paises.filter(p => normalize(p.pais).includes(normalize(query))).slice(0, 60)
        : [];

    useEffect(() => {
        function onClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
                const p = paises.find(p => p.codigo === value);
                setQuery(p?.pais ?? '');
            }
        }
        document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, [value, paises]);

    return (
        <div ref={containerRef} className="relative">
            <input
                type="text"
                className="rounded-full w-full"
                value={query}
                placeholder="Buscar país..."
                onChange={e => {
                    setQuery(e.target.value);
                    setOpen(true);
                    if (!e.target.value) onChange('');
                }}
                onFocus={() => { if (query.length >= 2) setOpen(true); }}
            />
            {open && filtered.length > 0 && (
                <ul className="absolute z-10 bg-white border border-gray-light rounded-lg mt-1 max-h-52 overflow-y-auto w-full shadow-md">
                    {filtered.map(p => (
                        <li
                            key={p.codigo}
                            className="px-3 py-1.5 text-sm text-gray-dark cursor-pointer hover:bg-gray-light"
                            onMouseDown={() => {
                                onChange(p.codigo);
                                setQuery(p.pais);
                                setOpen(false);
                            }}
                        >
                            {p.pais}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
