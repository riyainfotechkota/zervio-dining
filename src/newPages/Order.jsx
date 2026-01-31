import React, { Fragment, useEffect, useState } from "react";
import "./tableView.css";
import { FaWindowClose } from "react-icons/fa";
import GreenAlert from "../components/GreenAlert";
import RedAlert from "../components/RedAlert";
import HeaderNew from "./HeaderNew";
import { useSearchParams } from "react-router-dom";

export default function Order() {
    return (
        <Fragment>
            <HeaderNew />
            <PosScreen />
        </Fragment>
    );
}

const PosScreen = () => {
    const [activeCategory, setActiveCategory] = useState(null);
    const [menu, setMenu] = useState({});
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");

    const [showRed, setShowRed] = useState(false);
    const [showGreen, setShowGreen] = useState(false);
    const [alertData, setAlertData] = useState({ title: "", text: "" });

    const [restaurantId, setRestaurantId] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [searchParams] = useSearchParams();
    const tableId = searchParams.get("tableId");

    useEffect(() => {
        fetch("/api/get_menu.php")
            .then(res => res.json())
            .then(data => {
                const grouped = data.reduce((acc, item) => {
                    acc[item.category] = acc[item.category] || [];
                    acc[item.category].push(item);
                    return acc;
                }, {});

                setMenu(grouped);
                setActiveCategory(Object.keys(grouped)[0]);

                if (data.length > 0) {
                    setRestaurantId(data[0].restaurent_id);
                    localStorage.setItem("restaurantId", data[0].restaurent_id);
                }

                setLoading(false);
            })
            .catch(() => {
                setAlertData({ title: "Error", text: "Unable to load menu" });
                setShowRed(true);
                setLoading(false);
            });
    }, []);

    const addItem = (item) => {
        setCart(prev => {
            const productId = item.parent_id ? item.parent_id : item.id;
            const submenuId = item.is_submenu === "1" ? item.id : 0;

            const existing = prev.find(
                i => i.product_id === productId && i.submenu_id === submenuId
            );

            if (existing) {
                return prev.map(i =>
                    i === existing ? { ...i, qty: i.qty + 1 } : i
                );
            }

            return [
                ...prev,
                {
                    product_id: productId,
                    submenu_id: submenuId,
                    product: item.product,
                    price: item.price,
                    qty: 1
                }
            ];
        });
    };

    const handlePlaceOrder = () => {
        if (cart.length === 0) {
            setAlertData({ title: "Order Error", text: "Cart is empty" });
            setShowRed(true);
            return;
        }

        const formattedCart = cart.map(item => ({
            product_id: item.product_id,
            submenu_id: item.submenu_id,
            price: item.price,
            quantity: item.qty,
            total_price: item.price * item.qty
        }));

        const formData = new FormData();
        formData.append("cart", JSON.stringify(formattedCart));
        formData.append("restaurent_id", restaurantId || localStorage.getItem('restaurantId'));
        formData.append("user_id", tableId);


        fetch("/api/place_order.php", {
            method: "POST",
            body: formData
        })
            .then(res => res.json())
            .then(() => {
                setCart([]);
                setAlertData({ title: "Success", text: "Order placed successfully" });
                setShowGreen(true);
            })
            .catch(() => {
                setAlertData({ title: "Failed", text: "Unable to place order" });
                setShowRed(true);
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

    const filteredItems = search
        ? Object.values(menu)
            .flat()
            .filter(item =>
                item.product.toLowerCase().includes(search.toLowerCase())
            )
        : menu[activeCategory] || [];

    if (loading) return <p>Fetching data...</p>;

    return (
        <Fragment>
            {showGreen && <GreenAlert {...alertData} onCancel={() => setShowGreen(false)} />}
            {showRed && <RedAlert {...alertData} onCancel={() => setShowRed(false)} />}

            <div className="container-fluid" style={{ height: "89vh" }}>
                <div className="row h-100">

                    <div className="col-2 p-0 border-end">
                        <div className="accordion" style={{ height: "80vh", overflow: "auto" }}>
                            {Object.keys(menu).map(cat => (
                                <div className="accordion-item" key={cat}>
                                    <button
                                        className={`accordion-button ${activeCategory === cat ? "" : "collapsed"}`}
                                        onClick={() => {
                                            setActiveCategory(cat);
                                            setSearch("");
                                        }}
                                    >
                                        {cat}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="col-5 p-3 bg-light" style={{ height: "80vh", overflow: "auto" }}>
                        <div className="d-flex mb-3">
                            <input
                                className="form-control me-2"
                                placeholder="Search Item"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="row g-3">
                            {filteredItems.map(item => (
                                <div key={item.id} className="col-4">
                                    <div
                                        className="border p-3 text-center bg-white"
                                        role="button"
                                        onClick={() => handleItemClick(item)}
                                    >
                                        {item.product}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {showModal && selectedItem && (
                            <div className="modal fade show d-block" tabIndex="-1">
                                <div className="modal-dialog modal-dialog-centered">
                                    <div className="modal-content">
                                        <div className="modal-header">
                                            <h5 className="modal-title">{selectedItem.product}</h5>
                                            <button
                                                className="btn-close"
                                                onClick={() => setShowModal(false)}
                                            />
                                        </div>

                                        <div className="modal-body">
                                            {selectedItem.submenu.map(sub => (
                                                <div
                                                    key={sub.id}
                                                    className="border p-2 mb-2 text-center"
                                                    role="button"
                                                    onClick={() => {
                                                        addItem({
                                                            ...selectedItem,
                                                            id: sub.id,
                                                            product: sub.name,
                                                            price: sub.price,
                                                            is_submenu: "1",
                                                            parent_id: selectedItem.id
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

                    <div className="col-5 p-0 border-start d-flex flex-column">
                        <div className="p-3 flex-grow-1 overflow-auto">
                            {cart.length === 0 && <div className="text-muted">No items added</div>}

                            {cart.map((item, idx) => (
                                <div key={idx} className="d-flex justify-content-between align-items-center mb-2">
                                    <div>
                                        <FaWindowClose
                                            className="text-danger me-2"
                                            role="button"
                                            onClick={() => setCart(c => c.filter((_, i) => i !== idx))}
                                        />
                                        {item.product}
                                        <div className="text-muted small">
                                            ₹{item.price} × {item.qty}
                                        </div>
                                    </div>

                                    <div className="btn-group">
                                        <button
                                            className="btn btn-sm btn-outline-secondary"
                                            onClick={() =>
                                                setCart(c =>
                                                    c.map((ci, i) =>
                                                        i === idx ? { ...ci, qty: ci.qty - 1 } : ci
                                                    ).filter(ci => ci.qty > 0)
                                                )
                                            }
                                        >-</button>

                                        <span className="btn btn-sm btn-light">{item.qty}</span>

                                        <button
                                            className="btn btn-sm btn-outline-secondary"
                                            onClick={() =>
                                                setCart(c =>
                                                    c.map((ci, i) =>
                                                        i === idx ? { ...ci, qty: ci.qty + 1 } : ci
                                                    )
                                                )
                                            }
                                        >+</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-3 border-top">
                            <button
                                className="btn btn-danger w-100"
                                onClick={handlePlaceOrder}
                                disabled={cart.length === 0}
                            >
                                Place Order
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </Fragment>
    );
};
