import Bookings from '../components/bookings/bookings'
import Navbar from '../components/navbar/navbar'
import Image from 'next/image'

export default function Home() {
  return (
    <main className="main-class">
      <Navbar></Navbar>
      <div className="">
        <Bookings></Bookings>
      </div>
    </main>
  )
}
