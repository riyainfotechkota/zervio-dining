import { Fragment, useState } from "react";
import "../css/Reservation.css";
import BookingDetails from "./BookingDetails";
import { BsPlusCircle } from "react-icons/bs";
import HeaderNew from "../newPages/HeaderNew";

const Reservation = () => {
    const [bookTable, setBookTable] = useState(false)
    return (
        <Fragment>
            <HeaderNew />
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
