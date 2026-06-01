import { Room } from '../../interfaces/room'

type RoomProps = {
    room: Room
}

export default function RoomComponent({ room }: RoomProps) {

    return (
        <div>
            <p className='text-gray-dark text-opacity-75'>Nombre: {room.name}</p>
            <p className='text-gray-dark text-opacity-75'>Precio: {room.price}</p>
            {room.extra_beds?(
                <div>
                    <p className='text-gray-dark text-opacity-75'>Supletorias: {room.extra_beds}</p>
                    <p className='text-gray-dark text-opacity-75'>Precio supletoria: {room.price_extra_bed}</p>
                </div>
            ):(<p className='text-gray-dark text-opacity-75'>Sin supletorias</p>)}
        </div>
    )
}