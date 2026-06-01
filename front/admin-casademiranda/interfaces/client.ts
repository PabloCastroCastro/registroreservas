export type Client = {
    client_id: string
    check_in: Date
    nacionality: string
    document_type: string
    document_number: string
    support_document: string
    expedition_date: Date
    name: string
    firstSurname: string
    secondSurname: string
    gender: string
    birthdate: Date
    phone: string
    other_phone: string
    email: string
    relationship: string
    booking_id: string
    address: Address
    made_booking: boolean
}

export type Address = {
    line: string
    line2: string
    country: string
    province: string
    location: string
    postalCode: number 
}

export type ClientDTO={
    customer_id: string
    check_in: Date
    nacionality: string
    document_type: string
    identifier: string
    support_document: string
    expedition_date: Date
    name: string
    surname: string
    gender: string
    birthdate: Date
    phone: string
    other_phone: string
    email: string
    relationship: string
    booking_id: string
    address_id: number
    line: string
    line2: string
    country: string
    province: string
    location: string
    postalCode: number
    made_booking: boolean 
}