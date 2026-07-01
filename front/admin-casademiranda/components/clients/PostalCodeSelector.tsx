interface Props {
    postalCodesByMunicipio: Record<string, string[]>;
    municipioCodigo: string;
    value: string;
    onChange: (cp: string) => void;
}

export function PostalCodeSelector({ postalCodesByMunicipio, municipioCodigo, value, onChange }: Props) {
    const options = municipioCodigo ? (postalCodesByMunicipio[municipioCodigo] ?? []) : [];
    const disabled = !municipioCodigo || options.length === 0;

    return (
        <select
            className="rounded-full"
            value={value}
            disabled={disabled}
            onChange={e => onChange(e.target.value)}
        >
            <option value="">{disabled ? '— Elige primero un municipio —' : '— Elige un CP —'}</option>
            {options.map(cp => (
                <option key={cp} value={cp}>{cp}</option>
            ))}
        </select>
    );
}
