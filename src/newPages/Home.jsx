import React, { useState, useEffect } from "react";
import "./tableView.css";
import { FaCheck, FaTimes, FaSpinner, FaSync, FaCircle } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function Home() {
    const tables = Array.from({ length: 20 }, (_, i) => i + 1);
    const [tableList, setTableList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [restaurantId] = useState(() => {
        const user = localStorage.getItem("user");
        return user ? JSON.parse(user).id : null;
    });

    useEffect(() => {
        setLoading(true);
        const formData = new FormData();
        formData.append("id", restaurantId);

        Promise.all([
            fetch("/api/get_tables.php", { method: "POST", body: formData }).then(res => res.ok ? res.json() : Promise.reject("Tables fetch failed"))
        ])
            .then(([tableData]) => {
                setTableList(tableData);
                setLoading(false);
            })
            .catch(err => {
                setError(err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="tv-wrapper container-fluid">
            <div className="tv-header d-flex align-items-center justify-content-between p-3">
                <div className="d-flex align-items-center gap-3">
                    <h4 className="tv-logo mb-0">Din-in</h4>
                    <button type="button" className="btn btn-danger">New Order</button>
                    <input type="text" className="form-control tv-bill" placeholder="Bill No" />
                </div>
                <div className="d-flex align-items-center gap-2">
                    <div className="d-flex flex-column align-items-center border p-1">
                        <span className="tv-support">📞 Call For Support</span>
                        <span className="tv-support">9099912483</span>
                    </div>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map(v => {
                        return (

                            <button type="button" className="btn"><FaCheck /></button>
                        )
                    })}
                </div>
            </div>

            <div className="tv-header d-flex align-items-center justify-content-between p-3 mb-3">
                <div className="d-flex align-items-center gap-3">
                    <h6 className=" mb-0">Table View</h6>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <button type="button" className="btn"><FaSync /></button>
                    <button type="button" className="btn btn-danger">Delivery</button>
                    <button type="button" className="btn btn-danger">Pick Up</button>
                    <button type="button" className="btn btn-danger">+ Add Table</button>
                </div>
            </div>

            <div className="d-flex justify-content-between">

                <div className="mb-3">
                    <button type="button" className="btn btn-danger me-2">+ Table Reservation</button>
                    <button type="button" className="btn btn-danger">+ Contactless</button>
                </div>

                <div className="d-flex gap-2 mb-3 tv-legend">
                    <Legend color="white" label="Move KOT/Items" />
                    <Legend color="gray" label="Blank Table" />
                    <Legend color="blue" label="Running Table" />
                    <Legend color="green" label="Printed Table" />
                    <Legend color="pink" label="Paid Table" />
                    <Legend color="yellow" label="Running KOT Table" />
                </div>
            </div>

            <h6 className="tv-section">Ground Floor</h6>
            {loading && <p>Loading Tables data...</p>}
            {!loading && <div className="tv-grid">
                {tableList.map((t) => (
                    <Link className="text-decoration-none text-black" to='/order'><div key={t.id} className="tv-table">{t.name}</div></Link>
                ))}
            </div>}
        </div>
    );
}

function Legend({ color, label }) {
    return (
        <div className="d-flex align-items-center gap-2">
            <FaCircle style={{ color: `${color}` }} />
            <span>{label}</span>
        </div>
    );
}
