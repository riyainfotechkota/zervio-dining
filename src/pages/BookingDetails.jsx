import React, { useState, useMemo, Fragment } from "react";
import DatePicker from "react-datepicker";
import { BsPencil } from "react-icons/bs";
import { format } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";
import "../css/BookingDetails.css";


function generateTimeSlots(startHour = 9, endHour = 23) {
    const slots = [];
    for (let h = startHour; h <= endHour; h++) {
        for (let m = 0; m < 60; m += 15) {
            if (h === endHour && m > 45) break;
            const hh = String(h).padStart(2, "0");
            const mm = String(m).padStart(2, "0");
            slots.push(`${hh}:${mm}`);
        }
    }
    return slots;
}

function isToday(date) {
    const now = new Date();
    return (
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
    );
}

function isPastTime(time, selectedDate) {
    if (!isToday(selectedDate)) return false;

    const [h, m] = time.split(":").map(Number);
    const now = new Date();

    const slot = new Date();
    slot.setHours(h, m, 0, 0);

    return slot <= now;
}


const GUESTS = Array.from({ length: 20 }, (_, i) => i + 1);
const TABLE = Array.from({ length: 20 }, (_, i) => i + 1);



export default function BookingDetails() {
    const [activePanel, setActivePanel] = useState(null);
    const [date, setDate] = useState(new Date());
    const [guests, setGuests] = useState(2);
    const [time, setTime] = useState("19:00");
    const [screen, setScreen] = useState(1)
    const [form, setForm] = useState({
        name: "",
        email: "",
        contact: ''
    });

    const TIMES = useMemo(() => generateTimeSlots(), []);
    const handleScreen = () => {
        setScreen(2)
        setActivePanel('table')
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log(name, value)
        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="booking-layout">
            <div className="booking-form">
                <h2>Booking details</h2>
                {screen === 1 && <Fragment>
                    <Field
                        label="Guests"
                        value={`${guests} people`}
                        active={activePanel === "guests"}
                        onClick={() => setActivePanel("guests")}
                    />

                    <Field
                        label="Date"
                        value={format(date, "EEEE, do 'of' MMMM")}
                        active={activePanel === "date"}
                        onClick={() => setActivePanel("date")}
                    />

                    <Field
                        label="Time"
                        value={time}
                        active={activePanel === "time"}
                        onClick={() => setActivePanel("time")}
                    />
                </Fragment>}
                {screen === 2 && <Fragment>
                    <InputField
                        label="Name"
                        placeholder='Guest Name'
                        value={form.name}
                        onChange={handleChange}
                        name={'name'}
                    />

                    <InputField
                        label="Email"
                        placeholder='Guest Email'
                        value={form.email}
                        onChange={handleChange}
                        name={'email'}

                    />

                    <InputField
                        label="Contact"
                        placeholder='Guest Contact'
                        value={form.contact}
                        onChange={handleChange}
                        name={'contact'}

                    />
                </Fragment>}

                <button className="field-btn active continue" onClick={handleScreen}>Continue</button>
            </div>

            <div className="booking-side">
                {!activePanel && (
                    <img
                        src="https://www.cote.co.uk/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fbooking-default-image.681b1659.webp&w=1920&q=75"
                        alt="Restaurant"
                        className="restaurant-image img-fluid"
                    />
                )}

                {activePanel === "date" && (
                    <SidePanel title="Select date" onClose={() => setActivePanel(null)}>
                        <DatePicker
                            selected={date}
                            minDate={new Date()}
                            onChange={(d) => {
                                setDate(d);
                                setActivePanel(null);
                            }}
                            inline
                            calendarClassName="cote-calendar"
                        />
                    </SidePanel>
                )}

                {activePanel === "guests" && (
                    <SidePanel title="Select guests" onClose={() => setActivePanel(null)}>
                        {GUESTS.map((g) => (
                            <OptionButton
                                key={g}
                                selected={g === guests}
                                onClick={() => {
                                    setGuests(g);
                                    setActivePanel(null);
                                }}
                            >
                                {g} people
                            </OptionButton>
                        ))}
                    </SidePanel>
                )}
                {activePanel === "table" && (
                    <SidePanel classToUse={'dining-tables'} title="Select Table" onClose={() => setActivePanel(null)}>
                        {TABLE.map((g) => (
                            <div className="diningDetails">
                                <img height={100} width={100} src="/dining-set.svg"></img>
                                <span>Indoor</span>
                            </div>
                        ))}
                    </SidePanel>
                )}

                {activePanel === "time" && (
                    <SidePanel title="Select time" onClose={() => setActivePanel(null)}>
                        {TIMES.map((t) => {
                            const disabled = isPastTime(t, date);

                            return (
                                <OptionButton
                                    key={t}
                                    selected={t === time}
                                    disabled={disabled}
                                    onClick={() => {
                                        if (disabled) return;
                                        setTime(t);
                                        setActivePanel(null);
                                    }}
                                >
                                    {t}
                                </OptionButton>
                            );
                        })}
                    </SidePanel>
                )}
            </div>
        </div>
    );
}

const InputField = ({ label, value, onChange, name, placeholder }) => {
    return (
        <div className="field">
            <div className="field-label">{label}</div>

            <input
                name={name}
                type="text"
                className={`field-input`}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
            />
        </div>
    );
};

function Field({ label, value, onClick, active }) {
    return (
        <div className="field">
            <div className="field-label">{label}</div>
            <button
                className={`field-btn ${active ? "active" : ""}`}
                onClick={onClick}
            >
                <span>{value}</span>
                <BsPencil />
            </button>
        </div>
    );
}

function SidePanel({ title, children, onClose, classToUse }) {
    return (
        <div className="side-panel">
            <div className="side-header">
                <h3>{title}</h3>
                <button onClick={onClose}>×</button>
            </div>
            <div className={`side-content ${classToUse ? classToUse : ''}`}>{children}</div>
        </div>
    );
}

function OptionButton({ children, selected, disabled, onClick }) {
    return (
        <button
            className={`option-btn ${selected ? "selected" : ""} ${disabled ? "disabled" : ""
                }`}
            disabled={disabled}
            onClick={onClick}
        >
            {children}
        </button>
    );
}
