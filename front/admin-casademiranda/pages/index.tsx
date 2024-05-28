import "@/app/globals.css";
import Bookings from '../components/bookings/bookings'
import Navbar from '../components/navbar/navbar'

export default function Home() {
    return (
        <>
            <Navbar></Navbar>
            <Bookings />
        </>
    )
}