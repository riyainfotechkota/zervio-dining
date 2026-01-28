import { Fragment, useEffect, useState } from "react";
import GreenAlert from "../components/GreenAlert";
import RedAlert from "../components/RedAlert";
import Header from "../components/Header";
import '../css/Profile.css'

const Profile = () => {
    const [showRed, setShowRed] = useState(false);
    const [showGreen, setShowGreen] = useState(false);

    const alertData = {
        title: "Success",
        text: "Profile updated successfully!"
    };

    const [form, setForm] = useState({
        restaurant_name: "",
        contact: "",
        address: "",
        state: "",
        city: "",
        pincode: "",
        speciality: "",
        open_time: "08:00",
        close_time: "23:00",
        min_order_amount: "0",
        packaging_charges: "0",
        delivery_type: "",
        distance: "",
        ac_name: "",
        account_no: "",
        bank_name: "",
        bank_branch: "",
        ifsc_code: "",
        display_img: null,
        display_img_url: null
    });


    useEffect(() => {
        const stored = localStorage.getItem("user");

        if (stored) {
            try {
                const parsed = JSON.parse(stored);

                setForm({
                    restaurant_name: parsed.name || "",
                    contact: parsed.contact || "",
                    address: parsed.address || "",
                    state: parsed.state || "",
                    city: parsed.city || "",
                    pincode: parsed.pincode || "",
                    speciality: parsed.speciality || "",
                    open_time: parsed.open_time?.slice(0, 5) || "08:00",
                    close_time: parsed.close_time?.slice(0, 5) || "23:00",
                    min_order_amount: parsed.min_order_amount || "0",
                    packaging_charges: parsed.packaging_charges || "0",
                    delivery_type: parsed.delivery_type || "",
                    distance: parsed.distance || "",

                    ac_name: parsed.ac_name || "",
                    account_no: parsed.account_no || "",
                    bank_name: parsed.bank_name || "",
                    bank_branch: parsed.bank_branch || "",
                    ifsc_code: parsed.ifsc_code || "",

                    display_img: null,

                    display_img_url: parsed.display_img
                        ? `https://purvajresortandhotel.com/tummly/api/display_images/1749623491.png`
                        : null
                });
            } catch (err) {
                console.error("Invalid JSON in LocalStorage");
            }
        }
    }, []);


    const handleChange = (e) => {
        const { name, value, files } = e.target;

        if (files) {
            setForm({
                ...form,
                display_img: files[0],
                display_img_url: URL.createObjectURL(files[0])
            });
            return;
        }

        setForm({
            ...form,
            [name]: value
        });
    };


    const submitHandler = () => {
        const existing = JSON.parse(localStorage.getItem("user")) || {};

        const updatedData = {
            ...existing,
            ...form,
            display_img: existing.display_img
        };

        localStorage.setItem("user", JSON.stringify(updatedData));

        setShowGreen(true);
    };

    return (
        <Fragment>
            {showGreen && (
                <GreenAlert
                    title={alertData.title}
                    text={alertData.text}
                    onCancel={() => setShowGreen(false)}
                />
            )}

            {showRed && (
                <RedAlert
                    title={alertData.title}
                    text={alertData.text}
                    onCancel={() => setShowRed(false)}
                />
            )}

            <Header order={5} />

            <div className="container p-4" style={{ maxWidth: "1200px" }}>

                <div className="logoAndTitle">

                    {form.display_img_url && (
                        <div className="logoDiv">
                            <img
                                src={form.display_img_url}
                                alt="Restaurant Logo"
                            />
                        </div>
                    )}

                    <h3 className=""><strong>{form.restaurant_name}</strong></h3>
                </div>

                <div className="row">

                    <div className="col-md-6">

                        <label className="form-label">Restaurant Name</label>
                        <input
                            type="text"
                            className="form-control mb-3"
                            name="restaurant_name"
                            value={form.restaurant_name}
                            onChange={handleChange}
                        />

                        <label className="form-label">Contact</label>
                        <input
                            type="text"
                            className="form-control mb-3"
                            name="contact"
                            value={form.contact}
                            onChange={handleChange}
                        />

                        <label className="form-label">Address</label>
                        <input
                            type="text"
                            className="form-control mb-3"
                            name="address"
                            value={form.address}
                            onChange={handleChange}
                        />

                        <div className="row">
                            <div className="col-md-6">
                                <label className="form-label">State</label>
                                <input
                                    type="text"
                                    className="form-control mb-3"
                                    name="state"
                                    value={form.state}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label">City</label>
                                <input
                                    type="text"
                                    className="form-control mb-3"
                                    name="city"
                                    value={form.city}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <label className="form-label">Pincode</label>
                        <input
                            type="text"
                            className="form-control mb-3"
                            name="pincode"
                            value={form.pincode}
                            onChange={handleChange}
                        />

                        <label className="form-label">Display Image</label>
                        <input
                            type="file"
                            className="form-control mb-3"
                            name="display_img"
                            onChange={handleChange}
                        />

                        <button className="btn btn-success mb-4" onClick={submitHandler}>
                            Save Changes
                        </button>
                    </div>

                    <div className="col-md-6">

                        <label className="form-label">Speciality</label>
                        <textarea
                            className="form-control mb-3"
                            name="speciality"
                            value={form.speciality}
                            onChange={handleChange}
                        />

                        <div className="row">
                            <div className="col-md-6">
                                <label className="form-label">From Time</label>
                                <input
                                    type="time"
                                    className="form-control mb-3"
                                    name="open_time"
                                    value={form.open_time}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label">To Time</label>
                                <input
                                    type="time"
                                    className="form-control mb-3"
                                    name="close_time"
                                    value={form.close_time}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <label className="form-label">Minimum Order Value</label>
                        <input
                            type="number"
                            className="form-control mb-3"
                            name="min_order_amount"
                            value={form.min_order_amount}
                            onChange={handleChange}
                        />

                        <label className="form-label">Packaging Charges</label>
                        <input
                            type="number"
                            className="form-control mb-3"
                            name="packaging_charges"
                            value={form.packaging_charges}
                            onChange={handleChange}
                        />

                        <label className="form-label">Delivery Type</label>
                        <input
                            type="text"
                            className="form-control mb-3"
                            name="delivery_type"
                            value={form.delivery_type}
                            onChange={handleChange}
                        />

                        <label className="form-label">Delivery Distance (KM)</label>
                        <input
                            type="number"
                            className="form-control mb-3"
                            name="distance"
                            value={form.distance}
                            onChange={handleChange}
                        />

                        <h5 className="mt-4">Bank Details</h5>

                        <label className="form-label">Account Name</label>
                        <input
                            type="text"
                            className="form-control mb-3"
                            name="ac_name"
                            value={form.ac_name}
                            onChange={handleChange}
                        />

                        <label className="form-label">Account No</label>
                        <input
                            type="text"
                            className="form-control mb-3"
                            name="account_no"
                            value={form.account_no}
                            onChange={handleChange}
                        />

                        <label className="form-label">Bank Name</label>
                        <input
                            type="text"
                            className="form-control mb-3"
                            name="bank_name"
                            value={form.bank_name}
                            onChange={handleChange}
                        />

                        <label className="form-label">Bank Branch</label>
                        <input
                            type="text"
                            className="form-control mb-3"
                            name="bank_branch"
                            value={form.bank_branch}
                            onChange={handleChange}
                        />

                        <label className="form-label">IFSC Code</label>
                        <input
                            type="text"
                            className="form-control mb-3"
                            name="ifsc_code"
                            value={form.ifsc_code}
                            onChange={handleChange}
                        />

                        <button className="btn btn-success" onClick={submitHandler}>
                            Save Changes
                        </button>

                    </div>
                </div>
            </div>
        </Fragment>
    );
};

export default Profile;
