import { Fragment, useEffect, useState } from "react";
import Header from "../components/Header";
import "../css/Waiter.css";
import { FiTrash2 } from "react-icons/fi";
import GreenAlert from "../components/GreenAlert";
import RedAlert from "../components/RedAlert";

const Waiters = () => {
    const [form, setForm] = useState({ name: "", contact: "", password: "" });
    const [search, setSearch] = useState("");
    const [waiters, setWaiters] = useState([])
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showRed, setShowRed] = useState(false);
    const [showGreen, setShowGreen] = useState(false);
    const [alertData, setAlertData] = useState({ title: "", text: "" })
    const [restaurantId, setRestaurantId] = useState(
        () => localStorage.getItem("restaurantId") || null
    );
    useEffect(() => {
        const formData = new FormData();
        formData.append("id", restaurantId);

        fetch("/api/get_waiters.php", { method: "POST", body: formData })
            .then(res => {
                if (!res.ok) throw new Error("Network response was not ok");
                return res.json();
            })
            .then(data => {
                setWaiters(data)
                setLoading(false)
            })
            .catch(err => {
                setAlertData({ title: 'Fetch Error', text: 'Unable to fetch Waiters data' })
                setShowRed(true)
                setLoading(false)
            });
    }, [])

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = () => {
        if (!form.name || !form.contact || !form.password) return alert("Please fill all fields");
        const newWaiter = { id: Date.now(), ...form };
        const formData = new FormData();
        formData.append("name", form.name);
        formData.append("contact", form.contact);
        formData.append("password", form.password);
        formData.append("restaurent_id", restaurantId);


        fetch("/api/add_waiter.php", { method: "POST", body: formData })
            .then(res => {
                if (!res.ok) throw new Error("Network response was not ok");
                return res.json();
            })
            .then(data => {
                setAlertData(p => ({ ...p, title: 'Waiter', text: 'Added Successfully' }))
                setShowGreen(true)
                setWaiters([...waiters, newWaiter]);
                setForm({ name: "", contact: "", password: '' });
            })
            .catch(err => {
                setAlertData(p => ({ ...p, title: 'Waiter Addition Error', text: { err } }))
                setShowRed(true)
            });
    };

    const filteredWaiters = waiters.filter(
        (waiter) =>
            waiter.name.toLowerCase().includes(search.toLowerCase()) ||
            waiter.contact.includes(search)
    );

    const onDelete = (waiterId) => {
        const formData = new FormData();
        formData.append("id", waiterId);

        fetch("/api/delete_waiter.php", { method: "POST", body: formData })
            .then(res => {
                if (!res.ok) throw new Error("Network response was not ok");
                return res.json();
            })
            .then(data => {
                setAlertData(p => ({ ...p, title: 'Waiter', text: 'Deleted Successfully' }))
                setShowGreen(true)
                setWaiters(pre => {
                    return pre.filter(w => w.id !== waiterId)
                })
            })
            .catch(err => {
                setAlertData(p => ({ ...p, title: 'Waiter Deletion Error', text: { err } }))
                setShowRed(true)
            });
    }

    return (
        <Fragment>
            {showGreen && <GreenAlert
                title={alertData.title}
                text={alertData.text}
                onCancel={() => setShowGreen(false)}
            />}
            {showRed && (
                <RedAlert
                    title={alertData.title}
                    text={alertData.text}
                    onCancel={() => setShowRed(false)}
                />
            )}
            <Header order={9} />
            <main className="main">
                <h2>Manage Waiters</h2>

                <div className="card add-waiter-card">
                    <div className="waiter-form">
                        <input
                            autoComplete="false"
                            id="waiterName"
                            type="text"
                            name="name"
                            placeholder="Name"
                            value={form.name}
                            onChange={handleChange}
                        />
                        <input
                            id="waiterContact"
                            type="tel"
                            name="contact"
                            placeholder="Contact Number"
                            value={form.contact}
                            onChange={handleChange}
                        />
                        <input
                            id="waiterPassword"
                            type="text"
                            name="password"
                            placeholder="Password"
                            value={form.password}
                            onChange={handleChange}
                        />
                    </div>
                    <button onClick={handleSubmit}>Add Waiter</button>
                </div>

                <div className="card search-card">
                    <input
                        id="waiterSearch"
                        type="text"
                        placeholder="Search by Name or Contact"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="card table-card">

                    <table className="waiters-table">
                        <thead>
                            <tr>
                                <th>S.No</th>
                                <th>Name</th>
                                <th>Contact</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!loading && filteredWaiters.length > 0 ? (
                                filteredWaiters.map((waiter, index) => (
                                    <tr key={waiter.id}>
                                        <td>{index + 1}</td>
                                        <td>{waiter.name}</td>
                                        <td>{waiter.contact}</td>
                                        <td>
                                            <button className="deleteWaiter" onClick={() => onDelete(waiter.id)}>
                                                <FiTrash2 />
                                            </button>
                                        </td>

                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3">No waiters found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </Fragment>
    );
};

export default Waiters;
