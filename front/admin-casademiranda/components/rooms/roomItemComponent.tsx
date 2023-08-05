import { Room } from '../../interfaces/room'

type RoomProps = {
    room: Room
}

export default function RoomItemComponent({ room }: RoomProps) {

    return (
        <li>{room.name}.{room.extra_beds?' Supletorias:'+room.extra_beds:' Sin supletorias'}</li>
    )
}