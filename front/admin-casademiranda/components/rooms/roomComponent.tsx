import { Room } from '../../interfaces/room'

type RoomProps = {
    room: Room
}

export default function RoomComponent({ room }: RoomProps) {

    return (
        <div>
            <p>Nombre: {room.name}</p>
            {room.extra_beds?(<p>Supletorias: {room.extra_beds}</p>):(<p>Sin supletorias</p>)}
        </div>
    )
}