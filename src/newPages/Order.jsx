import React, { Fragment, useEffect, useState } from "react";
import "./tableView.css";
import { FaWindowClose } from "react-icons/fa";
import GreenAlert from "../components/GreenAlert";
import RedAlert from "../components/RedAlert";
import HeaderNew from "./HeaderNew";

export default function Order() {
    return (
        <Fragment>

            <HeaderNew />
            <PosScreen />
        </Fragment>
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
    // const categories = Object.keys(MENU);
    const [activeCategory, setActiveCategory] = useState(null);
    const [cart, setCart] = useState({});
    const [items, setItems] = useState([]);
    const [searchList, setSearchList] = useState([]);
    const [addingItem, setAddingItem] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentItem, setCurrentItem] = useState(null);
    const [activeStatus, setActiveStatus] = useState("Active");
    const [search, setSearch] = useState("");
    const [visibleItems, setVisibleItems] = useState(5);
    const [editingSubmenu, setEditingSubmenu] = useState(null);
    const [showSequenceModal, setShowSequenceModal] = useState(false);
    const [priorityList, setPriorityList] = useState([]);
    const [showRed, setShowRed] = useState(false);
    const [showGreen, setShowGreen] = useState(false);
    const [alertData, setAlertData] = useState({ title: "", text: "" })
    const [restaurantId, setRestaurantId] = useState(() => {
        const user = localStorage.getItem("user");
        return user ? JSON.parse(user).id : null;
    });
    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);


    useEffect(() => {
        fetch("/api/get_menu.php")
            .then(res => {
                if (!res.ok) throw new Error("Network response was not ok");
                return res.json();
            })
            .then(data => {
                setItems(data);
                setSearchList(data.reduce((acc, item) => {
                    if (!acc[item.category]) {
                        acc[item.category] = [];
                    }

                    acc[item.category].push({ ...item });

                    return acc;
                }, {}));

                setActiveCategory(Object.keys(searchList)[0])
                if (data.length > 0) {
                    setRestaurantId(data[0].restaurent_id);
                    localStorage.setItem("restaurantId", data[0].restaurent_id);
                }
                setLoading(false);
            })
            .catch(err => {
                console.log(err)
                setError(err.message);
                setAlertData(p => ({ ...p, title: 'Fetch Error', text: 'Unable to load Menu' }))
                setShowRed(true)
                setLoading(false);
            });
    }, []);

    const addItem = (item) => {
        setCart((prev) => ({
            ...prev,
            [item.product]: prev[item.product]
                ? { ...prev[item.product], qty: prev[item.product].qty + 1 }
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
    const handleItemClick = (item) => {
        if (item.is_submenu === "1") {
            setSelectedItem(item);
            setShowModal(true);
        } else {
            addItem(item);
        }
    };

    if (loading) {
        return (<p>Fetching data</p>)
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
            <div className="container-fluid" style={{ height: "89vh" }}>
                <div className="row h-100" >
                    <div className="col-2 p-0 border-end">
                        <div className="accordion" style={{ height: "80vh", overflow: "scroll" }}>
                            {Object.keys(searchList).map((cat) => (
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

                    <div className="col-5 p-3 bg-light" style={{ height: "80vh", overflow: "scroll" }}>
                        <div className="d-flex mb-3">
                            <input className="form-control me-2" placeholder="Search Item" />
                            <input className="form-control" placeholder="Short Code" />
                        </div>

                        <div className="row g-3" >
                            {searchList[activeCategory || Object.keys(searchList)[0]].map((item) => (
                                <div key={item.product} className="col-4">
                                    <div
                                        className="border p-3 text-center bg-white"
                                        role="button"
                                        onClick={() => handleItemClick(item)}
                                    >
                                        <div>{item.product}</div>
                                    </div>
                                </div>
                            ))}
                            {showModal && selectedItem && (
                                <div className="modal fade show d-block" tabIndex="-1">
                                    <div className="modal-dialog modal-dialog-centered">
                                        <div className="modal-content">

                                            <div className="modal-header">
                                                <h5 className="modal-title">{selectedItem.product}</h5>
                                                <button
                                                    type="button"
                                                    className="btn-close"
                                                    onClick={() => setShowModal(false)}
                                                />
                                            </div>

                                            <div className="modal-body">
                                                {selectedItem.submenu.map((sub) => (
                                                    <div
                                                        key={sub.id}
                                                        className="border p-2 mb-2 text-center"
                                                        role="button"
                                                        onClick={() => {
                                                            addItem({
                                                                ...selectedItem,
                                                                submenu_item: sub,     // keep reference
                                                                price: sub.price,      // override price
                                                                product: sub.name
                                                            });
                                                            setShowModal(false);
                                                        }}
                                                    >
                                                        <div>{sub.name}</div>
                                                        <div className="text-muted">₹{sub.price}</div>
                                                    </div>
                                                ))}
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                    <div className="col-5 p-0 border-start d-flex flex-column" style={{ height: "89vh", overflow: "scroll" }}>
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
                                <button type="button" className="btn btn-danger">Place Order</button>
                                {/* <button type="button" className="btn btn-danger">Save & Print</button>
                                <button type="button" className="btn btn-danger">Save & eBill</button>
                                <button type="button" className="btn btn-secondary">KOT</button>
                                <button type="button" className="btn btn-secondary">KOT & Print</button>
                                <button type="button" className="btn border">Hold</button> */}
                                {/* <Link to='/menu'>Menu</Link> */}

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
};



