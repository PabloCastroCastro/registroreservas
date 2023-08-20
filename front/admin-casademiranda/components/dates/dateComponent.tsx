
type DateProps = {
    label: string,
    date: Date
}

export default function DateComponent({ dateProps }: DateProps) {

    return (
        <p>{dateProps !== undefined && dateProps.label !== undefined ?dateProps.label:"Date: "}{dateProps !== undefined && dateProps.date !== undefined && dateProps.date !== null ? dateProps.date.toLocaleString().split("T")[0]:""}</p>
    )
}