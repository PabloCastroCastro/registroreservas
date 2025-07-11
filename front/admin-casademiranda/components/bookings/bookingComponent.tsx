import Link from 'next/link'
import { Booking } from '../../interfaces/booking'

type BookingProps = {
    booking: Booking
}

export default function BookingComponent({ booking }: BookingProps) {

    return (
        <tr>
            <td><Link className='text-gray-dark text-opacity-75' href="/booking/[id]" as={`/booking/${booking.booking_id}`}>{booking.confirmation_number}</Link></td>
            <td><p className='text-gray-dark text-opacity-75'>{booking.check_in ? new Date(booking.check_in).toLocaleDateString() : ''}</p></td>
            <td><p className='text-gray-dark text-opacity-75'>{booking.state}</p></td>
            <td><p className='text-gray-dark text-opacity-75'>{booking.name}</p></td>
            <td><p className='text-gray-dark text-opacity-75'>{booking.surname}</p></td>
            <td>
                <table>
                    <tbody>
                        {booking.rooms?.map((room) => (
                            <tr key={room.name}>
                                <td><p className='text-gray-dark text-opacity-75'>{room.name}</p></td>
                                <td><p className='text-gray-dark text-opacity-75'>{room.extra_beds}</p></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </td>
            <td><p className='text-gray-dark text-opacity-75'>{booking.other_platform_reference}</p></td>
        </tr>
    )
}


