'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Booking } from '../../interfaces/booking';

type Props = {
    bookings: Booking[];
    showCancelled: boolean;
};

const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DAY_NAMES = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];

const ROOM_LEGEND = [
    { name: 'A Fonte',        chipClass: 'bg-blue bg-opacity-40 text-gray-dark' },
    { name: 'O Carpinteiro',  chipClass: 'bg-purple bg-opacity-40 text-gray-dark' },
    { name: 'O Cuberto',      chipClass: 'bg-pink bg-opacity-40 text-gray-dark' },
    { name: 'O Faiado',       chipClass: 'bg-green bg-opacity-40 text-gray-dark' },
    { name: 'Cancelada',      chipClass: 'bg-gray-light text-gray' },
];

const ROOM_COLORS: Record<string, string> = Object.fromEntries(
    ROOM_LEGEND.slice(0, 4).map(r => [r.name, r.chipClass])
);

function getRoomClass(state: string, roomName: string): string {
    if (state === 'cancelada') return 'bg-gray-light text-gray';
    return ROOM_COLORS[roomName] ?? 'bg-yellow bg-opacity-40 text-gray-dark';
}

export default function BookingCalendar({ bookings, showCancelled }: Props) {
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth());
    const [filterRoom, setFilterRoom] = useState<string | null>(null);

    function prevMonth() {
        if (month === 0) { setYear(y => y - 1); setMonth(11); }
        else setMonth(m => m - 1);
    }
    function nextMonth() {
        if (month === 11) { setYear(y => y + 1); setMonth(0); }
        else setMonth(m => m + 1);
    }

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7;
    const totalCells = Math.ceil((firstDayOfWeek + daysInMonth) / 7) * 7;

    const filteredBookings = bookings.filter(b => {
        const stateOk = b.state === 'ok' || (showCancelled && b.state === 'cancelada');
        const roomOk = filterRoom === null || b.rooms?.some(r => r.name === filterRoom);
        return stateOk && roomOk;
    });

    function getBookingsForDay(day: number): Booking[] {
        const dayDate = new Date(year, month, day);
        return filteredBookings.filter(b => {
            const checkIn = new Date(b.check_in);
            const checkOut = new Date(b.check_out);
            checkIn.setHours(0, 0, 0, 0);
            checkOut.setHours(0, 0, 0, 0);
            return checkIn <= dayDate && checkOut > dayDate;
        });
    }

    return (
        <div className="m-2 md:m-10">
            <div className="flex items-center gap-4 mb-4">
                <button
                    onClick={prevMonth}
                    className="rounded-full bg-gray-light px-4 py-1 text-gray-dark font-bold text-lg"
                >
                    ‹
                </button>
                <h2 className="text-gray-dark font-semibold text-lg md:text-xl w-32 md:w-52 text-center">
                    {MONTH_NAMES[month]} {year}
                </h2>
                <button
                    onClick={nextMonth}
                    className="rounded-full bg-gray-light px-4 py-1 text-gray-dark font-bold text-lg"
                >
                    ›
                </button>
            </div>

            {/* Filtro por habitación */}
            <div className="flex flex-wrap gap-2 mb-4">
                <button
                    onClick={() => setFilterRoom(null)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold border ${filterRoom === null ? 'bg-gray-dark text-white border-gray-dark' : 'bg-white text-gray-dark border-gray-light'}`}
                >
                    Todas
                </button>
                {ROOM_LEGEND.slice(0, 4).map(({ name, chipClass }) => (
                    <button
                        key={name}
                        onClick={() => setFilterRoom(filterRoom === name ? null : name)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold border ${filterRoom === name ? 'border-gray-dark' : 'border-transparent'} ${chipClass}`}
                    >
                        {name}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1 mb-1">
                {DAY_NAMES.map(d => (
                    <div key={d} className="text-center text-gray font-semibold text-sm py-1 bg-gray-light rounded">
                        {d}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: totalCells }, (_, i) => {
                    const day = i - firstDayOfWeek + 1;
                    const isValidDay = day >= 1 && day <= daysInMonth;
                    const isToday =
                        isValidDay &&
                        year === today.getFullYear() &&
                        month === today.getMonth() &&
                        day === today.getDate();
                    const dayBookings = isValidDay ? getBookingsForDay(day) : [];

                    return (
                        <div
                            key={i}
                            className={`border rounded p-1 min-h-[80px] ${isValidDay ? 'border-gray-light' : 'border-transparent'} ${isToday ? 'bg-yellow bg-opacity-20' : ''}`}
                        >
                            {isValidDay && (
                                <>
                                    <p className={`text-sm font-semibold mb-1 ${isToday ? 'text-orange' : 'text-gray'}`}>
                                        {day}
                                    </p>
                                    {dayBookings.flatMap(b =>
                                        b.rooms?.map(room => (
                                            <Link key={`${b.booking_id}-${room.name}`} href={`/booking/${b.booking_id}`}>
                                                <div className={`text-xs rounded px-1 py-0.5 mb-0.5 truncate cursor-pointer ${getRoomClass(b.state, room.name)}`}>
                                                    {b.name} · {room.name}
                                                </div>
                                            </Link>
                                        ))
                                    )}
                                </>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Leyenda */}
            <div className="mt-4 flex flex-wrap gap-3">
                {ROOM_LEGEND.map(({ name, chipClass }) => (
                    <div key={name} className="flex items-center gap-1.5">
                        <div className={`w-3 h-3 rounded ${chipClass}`} />
                        <span className="text-xs text-gray-dark">{name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
