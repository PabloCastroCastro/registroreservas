import Link from 'next/link'
import { Booking } from '../../interfaces/booking'

type BookingProps = {
    booking: Booking
}

export default function BookingComponent({ booking }: BookingProps) {

    return (
        <tr>
            <td><Link href="/booking/[id]" as={`/booking/${booking.booking_id}`}>{booking.booking_id}</Link></td>
            <td>{booking.name}</td>
            <td>{booking.surname}</td>
            <td>
                <table>
                    {booking.rooms?.map((room) => (
                        <tbody>
                            <tr>
                                <td>{room.name}</td>
                                <td>{room.extra_beds}</td>
                            </tr>
                        </tbody>
                    ))}
                </table>
            </td>
        </tr>
    )
}


