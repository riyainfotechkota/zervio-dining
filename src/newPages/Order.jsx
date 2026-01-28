import React, { useState } from "react";
import "./tableView.css";
import { FaCheck, FaWindowClose, FaPowerOff } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Order() {
    const tables = Array.from({ length: 20 }, (_, i) => i + 1);
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/");
    };
    return (
        <div className="tv-wrapper container-fluid">
            <div className="tv-header d-flex align-items-center justify-content-between p-3">
                <div className="d-flex align-items-center gap-3">
                    <h4 className="tv-logo mb-0">Din-in</h4>
                    <Link className="text-decoration-none" to="/home">
                        <button type="button" className="btn btn-danger">New Order</button>
                    </Link>
                    <input type="text" className="form-control tv-bill" placeholder="Bill No" />
                </div>
                <div className="d-flex align-items-center gap-2">
                    <div className="d-flex flex-column align-items-center border p-1">
                        <span className="tv-support">📞 Call For Support</span>
                        <span className="tv-support">9099912483</span>
                    </div>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((v, i) => {
                        if (i === 9) {
                            return (
                                <button onClick={handleLogout} type="button" className="btn"><FaPowerOff /></button>
                            )
                        }
                        return (
                            <button type="button" className="btn"><FaCheck /></button>
                        )
                    })}
                </div>
            </div>

            <PosScreen />
        </div>
    );
}


const MENU = {
    "Favorite Items": [
        { name: "Aloo Puri", price: 120 },
        { name: "Bhaji Pav", price: 150 },
    ],
    "Sabzi (Non-Veg)": [
        { name: "Bheja Fry", price: 280 },
        { name: "Chicken Korma", price: 320 },
    ],
    "Sabzi (Veg)": [
        { name: "Chole Bhature", price: 180 },
        { name: "Pahadi Tikka", price: 260 },
    ],
    "Dal": [
        { name: "Dal Fry", price: 140 },
        { name: "Dal Tadka", price: 160 },
    ],
    "Chaval": [
        { name: "Jeera Rice", price: 120 },
        { name: "Steam Rice", price: 100 },
    ],
    "Roti": [
        { name: "Tandoori Roti", price: 25 },
        { name: "Butter Naan", price: 40 },
    ],
};

const PosScreen = () => {
    const categories = Object.keys(MENU);
    const [activeCategory, setActiveCategory] = useState(categories[0]);
    const [cart, setCart] = useState({});

    const addItem = (item) => {
        setCart((prev) => ({
            ...prev,
            [item.name]: prev[item.name]
                ? { ...prev[item.name], qty: prev[item.name].qty + 1 }
                : { qty: 1, price: item.price },
        }));
    };

    const deleteItem = (item) => {
        setCart((prev) => {
            const { [item]: _, ...rest } = prev;
            return rest;
        });
    };

    const updateQty = (item, delta) => {
        setCart((prev) => {
            const current = prev[item];
            if (!current) return prev;

            const newQty = current.qty + delta;
            if (newQty <= 0) {
                const { [item]: _, ...rest } = prev;
                return rest;
            }

            return {
                ...prev,
                [item]: { ...current, qty: newQty },
            };
        });
    };

    return (
        <div className="container-fluid" style={{ height: "89vh" }}>
            <div className="row h-100">
                <div className="col-2 p-0 border-end">
                    <div className="accordion">
                        {categories.map((cat) => (
                            <div className="accordion-item" key={cat}>
                                <h2 className="accordion-header">
                                    <button
                                        className={`accordion-button ${activeCategory === cat ? "" : "collapsed"
                                            }`}
                                        type="button"
                                        onClick={() => setActiveCategory(cat)}
                                    >
                                        {cat}
                                    </button>
                                </h2>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="col-5 p-3 bg-light">
                    <div className="d-flex mb-3">
                        <input className="form-control me-2" placeholder="Search Item" />
                        <input className="form-control" placeholder="Short Code" />
                    </div>

                    <div className="row g-3">
                        {MENU[activeCategory].map((item) => (
                            <div key={item.name} className="col-4">
                                <div
                                    className="border p-3 text-center bg-white"
                                    role="button"
                                    onClick={() => addItem(item)}
                                >
                                    <div>{item.name}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="col-5 p-0 border-start d-flex flex-column">
                    <div className="d-flex text-center">
                        <div className="flex-fill p-3 bg-danger text-white">Dine In</div>
                        <div className="flex-fill p-3 bg-secondary text-white">Delivery</div>
                        <div className="flex-fill p-3 bg-secondary text-white">Pick Up</div>
                    </div>

                    <div className="p-3 flex-grow-1 overflow-auto">
                        {Object.keys(cart).length === 0 && (
                            <div className="text-muted">No items added</div>
                        )}

                        {Object.entries(cart).map(([item, data]) => (
                            <div
                                key={item}
                                className="d-flex justify-content-between align-items-center mb-2"
                            >
                                <div>
                                    <span
                                        className="me-2"
                                        role="button"
                                        onClick={() => deleteItem(item)}
                                    >
                                        <FaWindowClose />
                                    </span>
                                    {item}
                                    <div className="text-muted small">
                                        ₹{data.price} × {data.qty}
                                    </div>
                                </div>

                                <div className="btn-group">
                                    <button
                                        className="btn btn-sm btn-outline-secondary"
                                        onClick={() => updateQty(item, -1)}
                                    >
                                        -
                                    </button>
                                    <span className="btn btn-sm btn-light btn-outline-secondary">{data.qty}</span>
                                    <button
                                        className="btn btn-sm btn-outline-secondary"
                                        onClick={() => updateQty(item, 1)}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-3 border-top last">
                        <div className="d-flex align-items-center gap-2 justify-content-around">
                            <button type="button" className="btn btn-danger">Save</button>
                            <button type="button" className="btn btn-danger">Save & Print</button>
                            <button type="button" className="btn btn-danger">Save & eBill</button>
                            <button type="button" className="btn btn-secondary">KOT</button>
                            <button type="button" className="btn btn-secondary">KOT & Print</button>
                            <button type="button" className="btn border">Hold</button>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};



