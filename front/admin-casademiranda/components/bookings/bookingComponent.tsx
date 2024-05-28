import Link from 'next/link'
import { Booking } from '../../interfaces/booking'

type BookingProps = {
    booking: Booking
}

export default function BookingComponent({ booking }: BookingProps) {

    return (
        <tr>
            <td><Link className='text-gray-dark text-opacity-75' href="/booking/[id]" as={`/booking/${booking.booking_id}`}>{booking.booking_id}</Link></td>
            <td><p className='text-gray-dark text-opacity-75'>{booking.name}</p></td>
            <td><p className='text-gray-dark text-opacity-75'>{booking.surname}</p></td>
            <td>
                <table>
                    {booking.rooms?.map((room) => (
                        <tbody>
                            <tr>
                                <td><p className='text-gray-dark text-opacity-75'>{room.name}</p></td>
                                <td><p className='text-gray-dark text-opacity-75'>{room.extra_beds}</p></td>
                            </tr>
                        </tbody>
                    ))}
                </table>
            </td>
        </tr>
    )
}


