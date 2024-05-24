interface DateProps {
    label: string,
    date: Date
}

export default function DateComponent({ label, date }: DateProps) {

    return (
        <label className='text-gray-dark text-opacity-75'>{label !== undefined ?label:"Date: "}{date !== undefined ? date.toLocaleString().split("T")[0]:""}</label>
    )
}