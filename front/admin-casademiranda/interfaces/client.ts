export type Client = {
    client_id: string
    check_in: Date
    nacionality: string
    document_type: string
    document_number: string
    expedition_date: Date
    name: string
    firstSurname: string
    secondSurname: string
    gender: string
    birthdate: Date
    booking_id: string
    made_booking: boolean
}

export type ClientDTO={
    customer_id: string
    check_in: Date
    nacionality: string
    document_type: string
    identifier: string
    expedition_date: Date
    name: string
    surname: string
    gender: string
    birthdate: Date
    booking_id: string
    made_booking: boolean 
}