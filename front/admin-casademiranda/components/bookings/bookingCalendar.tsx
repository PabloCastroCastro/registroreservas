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

export default function BookingCalendar({ bookings, showCancelled }: Props) {
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth());

    function prevMonth() {
        if (month === 0) { setYear(y => y - 1); setMonth(11); }
        else setMonth(m => m - 1);
    }
    function nextMonth() {
        if (month === 11) { setYear(y => y + 1); setMonth(0); }
        else setMonth(m => m + 1);
    }

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0
    const totalCells = Math.ceil((firstDayOfWeek + daysInMonth) / 7) * 7;

    const filteredBookings = bookings.filter(b =>
        showCancelled ? b.state === 'cancelada' : b.state === 'ok'
    );

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
        <div className="m-10">
            <div className="flex items-center gap-4 mb-4">
                <button
                    onClick={prevMonth}
                    className="rounded-full bg-gray-light px-4 py-1 text-gray-dark font-bold text-lg"
                >
                    ‹
                </button>
                <h2 className="text-gray-dark font-semibold text-xl w-52 text-center">
                    {MONTH_NAMES[month]} {year}
                </h2>
                <button
                    onClick={nextMonth}
                    className="rounded-full bg-gray-light px-4 py-1 text-gray-dark font-bold text-lg"
                >
                    ›
                </button>
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
                                    {dayBookings.map(b => (
                                        <Link key={b.booking_id} href={`/booking/${b.booking_id}`}>
                                            <div className={`text-xs rounded px-1 py-0.5 mb-0.5 truncate cursor-pointer ${b.state === 'cancelada' ? 'bg-gray-light text-gray' : 'bg-green bg-opacity-30 text-gray-dark'}`}>
                                                {b.name} {b.surname}
                                            </div>
                                        </Link>
                                    ))}
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
