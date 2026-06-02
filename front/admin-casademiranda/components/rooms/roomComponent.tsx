import { Room } from '../../interfaces/room'

type RoomProps = {
    room: Room
}

export default function RoomComponent({ room }: RoomProps) {

    return (
        <div className="border border-gray-light rounded-lg p-3 grid grid-cols-2 gap-2">
            <div>
                <p className="text-xs text-gray uppercase tracking-wide">Habitación</p>
                <p className="text-gray-dark font-medium">{room.name}</p>
            </div>
            <div>
                <p className="text-xs text-gray uppercase tracking-wide">Precio</p>
                <p className="text-gray-dark font-medium">{room.price} €</p>
            </div>
            {room.extra_beds ? (
                <>
                    <div>
                        <p className="text-xs text-gray uppercase tracking-wide">Supletorias</p>
                        <p className="text-gray-dark font-medium">{room.extra_beds}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray uppercase tracking-wide">Precio supletoria</p>
                        <p className="text-gray-dark font-medium">{room.price_extra_bed} €</p>
                    </div>
                </>
            ) : (
                <div className="col-span-2">
                    <p className="text-xs text-gray">Sin supletorias</p>
                </div>
            )}
        </div>
    )
}