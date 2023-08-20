import { Room } from '../../interfaces/room'

type RoomProps = {
    room: Room
}

export default function RoomComponent({ room }: RoomProps) {

    return (
        <div>
            <p>Nombre: {room.name}</p>
            <p>Precio: {room.price}</p>
            {room.extra_beds?(<div><p>Supletorias: {room.extra_beds}</p><p>Precio supletoria: {room.price_extra_bed}</p></div>):(<p>Sin supletorias</p>)}
        </div>
    )
}