import { useEffect, useRef, useState } from 'react';
import { normalize } from '@/utils/municipioSearch';

type Municipio = { codigo: string; municipio: string };

interface Props {
    municipios: Municipio[];
    value: string;
    onChange: (codigo: string) => void;
}

export function MunicipioSelector({ municipios, value, onChange }: Props) {
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const m = municipios.find(m => m.codigo === value);
        setQuery(m?.municipio ?? '');
    }, [value, municipios]);

    const filtered = query.length >= 2
        ? municipios.filter(m => normalize(m.municipio).includes(normalize(query))).slice(0, 60)
        : [];

    useEffect(() => {
        function onClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
                const m = municipios.find(m => m.codigo === value);
                setQuery(m?.municipio ?? '');
            }
        }
        document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, [value, municipios]);

    return (
        <div ref={containerRef} className="relative">
            <input
                type="text"
                className="rounded-full w-full"
                value={query}
                placeholder="Buscar municipio..."
                onChange={e => {
                    setQuery(e.target.value);
                    setOpen(true);
                    if (!e.target.value) onChange('');
                }}
                onFocus={() => { if (query.length >= 2) setOpen(true); }}
            />
            {open && filtered.length > 0 && (
                <ul className="absolute z-10 bg-white border border-gray-light rounded-lg mt-1 max-h-52 overflow-y-auto w-full shadow-md">
                    {filtered.map(m => (
                        <li
                            key={m.codigo}
                            className="px-3 py-1.5 text-sm text-gray-dark cursor-pointer hover:bg-gray-light"
                            onMouseDown={() => {
                                onChange(m.codigo);
                                setQuery(m.municipio);
                                setOpen(false);
                            }}
                        >
                            {m.municipio}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
