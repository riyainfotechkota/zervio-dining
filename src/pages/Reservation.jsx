import { Fragment, useState } from "react";
import Header from "../components/Header";
import "../css/Reservation.css";
import BookingDetails from "./BookingDetails";
import { BsPlusCircle } from "react-icons/bs";

const Reservation = () => {
    const [bookTable, setBookTable] = useState(false)
    return (
        <Fragment>
            <Header order={10} />
            <div className="main-head">
                <h2 className="book-head">{!bookTable ? 'All Bookings' : "Create a Booking"}</h2>
                <div >
                    {!bookTable && <button
                        type="button"
                        className="d-flex align-items-center create-new"
                        onClick={() => setBookTable(true)}
                    >
                        <BsPlusCircle className="me-2" />
                        Create New
                    </button>}
                    {bookTable && <button
                        type="button"
                        className="d-flex align-items-center create-new"
                        onClick={() => setBookTable(false)}
                    >
                        View all
                    </button>}
                </div>
            </div>


            {bookTable && <div className="selection">
                <BookingDetails />
            </div>}
            {!bookTable && <div className="allBooking">
                No Bookings Found
            </div>}
        </Fragment>
    );
};

export default Reservation;
