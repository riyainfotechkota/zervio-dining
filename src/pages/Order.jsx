import { Fragment, useEffect, useState } from "react";
import "../css/CurrentOrder.css";
import { FiEdit2 } from "react-icons/fi";
import GreenAlert from "../components/GreenAlert";
import RedAlert from "../components/RedAlert";
import { useOrders } from "../context/OrderContext";
import InfoNotification from "../components/InfoNotification";
import { FaCheck, FaTimes, FaSpinner } from "react-icons/fa";
import HeaderNew from "../newPages/HeaderNew";

const CurrentOrder = () => {
    const { orders, autoAcceptedOrder } = useOrders();
    const [showRed, setShowRed] = useState(false);
    const [showGreen, setShowGreen] = useState(false);
    const [alertData, setAlertData] = useState({ title: "", text: "" })
    const [autoAccept, setAutoAccept] = useState(
        () => {
            const userData = JSON.parse(localStorage.getItem("user"));
            if (!userData) return true
            return userData.auto_accept === '1'
        }
    )
    const [live, setLive] = useState(
        () => {
            const userData = JSON.parse(localStorage.getItem("user"));
            if (!userData) return true

            return userData.status === 'Live'
        }
    )

    const [restaurantId, setRestaurantId] = useState(
        () => localStorage.getItem("restaurantId") || null
    )

    const handleAutoAccept = async () => {
        const formData = new FormData();
        formData.append("id", restaurantId);
        formData.append("aa", autoAccept ? '0' : '1');


        fetch("/api/update_auto_accept.php", { method: "POST", body: formData })
            .then(res => {
                if (!res.ok) throw new Error("Network response was not ok");
                return res.json();
            })
            .then(data => {
                setAlertData({ title: 'Profile Update', text: `Auto Accept ${autoAccept ? 'Disable' : 'Enabled'}` })
                setShowGreen(true)
                setAutoAccept(p => {

                    let user = JSON.parse(localStorage.getItem("user")) || {};
                    user.auto_accept = p ? "0" : '1'
                    localStorage.setItem("user", JSON.stringify(user));
                    return !p
                })

            })
            .catch(err => {
                setAlertData({ title: 'Profile Update Failed', text: `Unable to update Auto Accept Feature` })
                setShowRed(true)
            });
    }

    const handleItemUpdate = (item) => {
        const formData = new FormData();
        formData.append("id", item.id);

        fetch("/api/cancel_item.php", { method: "POST", body: formData })
            .then(res => {
                if (!res.ok) throw new Error("Network response was not ok");
                return res.json();
            })
            .then(data => {
                setAlertData({ title: 'Order Update', text: 'Item removed Successfully' })
                setShowGreen(true)
            })
            .catch(err => {
                setAlertData({ title: 'Order Update Failed', text: `Unable to remove item` })
                setShowRed(true)
            });

    };
    const handleLiveStatus = () => {
        const formData = new FormData();
        formData.append("id", restaurantId);
        formData.append("status", live ? 'Offline' : 'Live');


        fetch("/api/set_restaurent_status.php", { method: "POST", body: formData })
            .then(res => {
                if (!res.ok) throw new Error("Network response was not ok");
                return res.json();
            })
            .then(data => {
                setAlertData({ title: 'Restaurant Status Update', text: `You are ${live ? 'Offline' : 'Live'} now` })
                setShowGreen(true)
                setLive(p => {

                    let user = JSON.parse(localStorage.getItem("user")) || {};
                    user.status = p ? 'Offline' : 'Live'
                    localStorage.setItem("user", JSON.stringify(user));
                    return !p
                })
            })
            .catch(err => {
                setAlertData({ title: 'Restaurant Status Update', text: `Unable to Update Restaurant Status` })
                setShowRed(true)
            });
    }
    return (
        <Fragment>
            {autoAcceptedOrder && <InfoNotification message={'New Order Received !!'} />}
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
            <HeaderNew />
            <main className="d-flex flex-column">

                <div className="orderStatus">
                    <button
                        onClick={handleLiveStatus}
                        className={live ? "btn btn-danger mr-3" : "btn btn-info mr-3"}>
                        {live ? 'Stop Taking Orders' : 'Start Taking Orders'}
                    </button>
                    <label className="switchLabel">
                        <input type="checkbox" checked={autoAccept} onChange={handleAutoAccept} />
                        Auto Accept
                    </label>
                </div>

                <h2 className="pageTitle align-self-center">Current Orders</h2>

                {
                    orders.length > 0 &&
                    <div className="ordersList">
                        {orders.map((order, index) => (
                            <div className="omenu" key={index}>
                                <OrderCard
                                    setAlertData={setAlertData}
                                    setShowGreen={setShowGreen}
                                    setShowRed={setShowRed}
                                    key={index}
                                    order={order}
                                    handleItemUpdate={handleItemUpdate}
                                />
                            </div>
                        ))}
                    </div>
                }
                {
                    orders.length === 0 && <span style={{ margin: "0 auto" }}>No Ongoing Orders Yet</span>
                }

            </main>
        </Fragment>
    );
};

const OrderCard = ({ order: orderReceived, handleItemUpdate, setAlertData, setShowGreen, setShowRed }) => {
    const { address_details: addressInfo, order: orderInfo, order_details: itemInfo, user: userInfo } = orderReceived

    const [editingQtyRow, setEditingQtyRow] = useState(null);
    const [qtyValue, setQtyValue] = useState("");
    const [btnDisabed, setBtnDisabed] = useState(false)
    const [showInput, setShowInput] = useState(false);
    const [discountValue, setDiscountValue] = useState("");

    const foodStatus = {
        'Accept': 'Ready',
        'Ready': 'Delivered',
        'ordered': 'Ready',

    }
    useEffect(() => {
        setBtnDisabed(false)
    }, [orderInfo.bill_name, itemInfo])

    const [isEditingBillName, setIsEditingBillName] = useState(false);
    const [billName, setBillName] = useState(orderInfo?.bill_name || 'User');
    const [billGST, setBillGST] = useState(orderInfo?.bill_gst || '-')

    const handleFoodStatus = (isCancelled = false) => {
        setBtnDisabed(true)
        const formData = new FormData();
        formData.append("id", orderInfo.id);

        if (isCancelled) {
            formData.append("status", 'Cancelled');
        } else {
            formData.append("status", ['ordered', 'Accept'].includes(orderInfo.status) ? 'Ready' : 'Delivered');
        }

        fetch("/api/update_order_status.php", { method: "POST", body: formData })
            .then(res => {
                if (!res.ok) throw new Error("Network response was not ok");
                return res.json();
            })
            .then(data => {
                setAlertData({ title: 'Order Status Updated', text: 'Order Status updated Successfully' })
                setShowGreen(true)
            })
            .catch(err => {
                console.log(err)
                setAlertData({ title: 'Update Error', text: 'Unable to update Orders Status' })
                setShowRed(true)
            });
    }

    const handleSaveQty = (item, index) => {
        if (!qtyValue || qtyValue <= 0) {
            alert("Quantity cannot be empty or zero!");
            return;
        }
        setBtnDisabed(true)

        const formData = new FormData();
        formData.append("id", item.id);
        formData.append('price', item.price);
        formData.append('quantity', qtyValue);


        fetch("/api/change_item_quantity.php", { method: "POST", body: formData })
            .then(res => {
                if (!res.ok) throw new Error("Network response was not ok");
                return res.json();
            })
            .then(data => {
                setAlertData({ title: 'Order Update', text: 'Quantity changed Successfully' })
                setShowGreen(true)
                setEditingQtyRow(null);
                setQtyValue("");
            })
            .catch(err => {
                setAlertData({ title: 'Order Update Failed', text: `Unable to change quantity` })
                setShowRed(true)
            });
    };

    const handleCancelQty = () => {
        setEditingQtyRow(null);
        setQtyValue("");
    };
    const handleSaveBillName = () => {
        if (!billName.trim()) {
            alert("Bill Name cannot be empty!");
            return;
        }
        const formData = new FormData();
        formData.append("id", orderInfo.id);
        formData.append("name", billName);
        formData.append("gst", billGST);

        fetch("/api/change_bill_name.php", { method: "POST", body: formData })
            .then(res => {
                if (!res.ok) throw new Error("Network response was not ok");
                return res.json();
            })
            .then(data => {
                setAlertData({ title: 'Bill Updated', text: 'Bill details updated Successfully' })
                setShowGreen(true)
                setBtnDisabed(true)
            })
            .catch(err => {
                console.log(err)
                setAlertData({ title: 'Bill Update', text: 'Unable to update bill details' })
                setShowRed(true)
            });

        setIsEditingBillName(false);
    };

    const handleAddDiscount = () => {
        setShowInput(true);
    };

    const applyDiscount = (value, orderId) => {
        const formData = new FormData();
        formData.append("id", orderId);
        formData.append('discount', value);


        fetch("/api/add_order_discount.php", { method: "POST", body: formData })
            .then(res => {
                if (!res.ok) throw new Error("Network response was not ok");
                return res.json();
            })
            .then(data => {
                setAlertData({ title: 'Order Update', text: 'Discount Added Successfully' })
                setShowGreen(true)
            })
            .catch(err => {
                setAlertData({ title: 'Order Update Failed', text: `Unable to add discount` })
                setShowRed(true)
            });
    }

    const handleConfirm = () => {
        if (!discountValue.trim()) {
            alert("Please enter a discount value!");
            return;
        }
        setShowInput(false);
        setDiscountValue("");
        setBtnDisabed(true)
        applyDiscount(discountValue, orderInfo.id);
    };

    const handleCancel = () => {
        setShowInput(false);
        setDiscountValue("");
    };

    const handleNoCharge = (item) => {
        setBtnDisabed(true)
        const formData = new FormData();
        formData.append("id", item.id);
        formData.append('nc', item.nc === '1' ? 0 : 1);


        fetch("/api/make_nc.php", { method: "POST", body: formData })
            .then(res => {
                if (!res.ok) throw new Error("Network response was not ok");
                return res.json();
            })
            .then(data => {
                setAlertData({ title: 'Order Update', text: item.nc === '1' ? 'Item Charges Added' : 'Item Charges Removed' })
                setShowGreen(true)
            })
            .catch(err => {
                setAlertData({ title: 'Order Update Failed', text: `Unable to remove charges` })
                setShowRed(true)
            });
    }

    const handleCancelChange = () => {
        setIsEditingBillName(false)
    }

    return (
        <div className="orderCard shadow-sm d-flex flex-column">
            <div style={{ margin: "0 auto", paddingBottom: "10px", borderBottom: "2px solid #ea7100", marginBottom: "20px" }}>Table No: <strong>{userInfo.name}</strong></div>
            <div className="orderHeader mb-3">

                <h4>Order #{orderInfo.order_id}</h4>
                {isEditingBillName ? (
                    <div style={{ display: "flex", gap: "6px", alignItems: "flex-end", flexDirection: "column", justifyContent: "flex-end" }}>
                        <input
                            type="text"
                            value={billName}
                            onChange={(e) => setBillName(e.target.value)}
                            className="qtyInput"
                            placeholder="Enter Name"
                        />
                        <input
                            type="text"
                            value={billGST}
                            onChange={(e) => setBillGST(e.target.value)}
                            className="qtyInput"
                            placeholder="GST number"
                        />
                        <div className="updateAction" style={{ display: "flex", gap: "10px" }}>

                            <FaCheck
                                onClick={handleSaveBillName}
                                style={{ cursor: "pointer" }}
                                size={20}
                                color="green"
                            />

                            <FaTimes
                                onClick={handleCancelChange}
                                style={{ cursor: "pointer" }}
                                size={20}
                                color="red"
                            />
                        </div>

                    </div>
                ) : (
                    <button
                        className="themeBtn small"
                        onClick={() => setIsEditingBillName(true)}
                    >
                        Change Bill Name
                    </button>
                )}
            </div>

            <div className="billInfo mb-2">
                <div className="statusRow">
                    <p className="paymentText">
                        <strong>Payment Status:</strong> Pending
                    </p>
                    <button className="themeBtn blue small">Update</button>
                </div>

                <p><strong>Bill Name:</strong> {billName}</p>
                <p><strong>Bill GST:</strong> {billGST}</p>
            </div>

            <table className="table customTable mb-4">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                        <th>NC</th>
                        <th>Remove</th>
                    </tr>
                </thead>

                <tbody>
                    {itemInfo.map((item, index, itemList) => {
                        const isEditing = editingQtyRow === index;

                        return (
                            <tr key={index}>
                                <td>
                                    <input style={{ marginRight: "5px" }} type="checkbox" />
                                    {item.product.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
                                </td>

                                <td className="qtyCell">
                                    {isEditing ? (
                                        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                                            <input
                                                type="number"
                                                className="qtyInput2"
                                                value={qtyValue}
                                                onChange={(e) => setQtyValue(e.target.value)}
                                            />

                                            <FaCheck
                                                onClick={() => handleSaveQty(item, index)}
                                                style={{ cursor: "pointer" }}
                                                size={20}
                                                color="green"
                                            />

                                            <FaTimes
                                                onClick={handleCancelQty}
                                                style={{ cursor: "pointer" }}
                                                size={20}
                                                color="red"
                                            />
                                        </div>
                                    ) : (
                                        <span>{item.quantity}</span>
                                    )}

                                    {!isEditing && (
                                        <FiEdit2
                                            className="editIcon"
                                            onClick={() => {
                                                setEditingQtyRow(index); // only this row
                                                setQtyValue(item.quantity);
                                            }}
                                        />
                                    )}
                                </td>

                                <td>{item.price}</td>
                                <td>{item.total_price}</td>

                                <td>
                                    <input
                                        type="checkbox"
                                        checked={item.nc === "1"}
                                        onChange={() => handleNoCharge(item)}
                                    />
                                </td>

                                <td>
                                    {itemList.length > 1 && <button
                                        onClick={() => handleItemUpdate(item)}
                                        className="btn btn-danger btn-sm"
                                    >
                                        X
                                    </button>}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>

            </table>

            {btnDisabed ? <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                <FaSpinner className="spin-loader" />
                <span>Updating Order</span>
            </div> :
                <div className="totalsBox mt-3">
                    <p>Total: <strong>₹{orderInfo.total}</strong></p>
                    <p>GST: <strong>₹{orderInfo.gst}</strong></p>
                    <p>Discount: <strong>₹{orderInfo.discount}</strong></p>
                    <p className="grand">Grand Total: <strong>₹{orderInfo.grand_total}</strong></p>
                    <div>
                        {!showInput ? (
                            <button className="add-discount" onClick={handleAddDiscount}>
                                Add Discount
                            </button>
                        ) : (
                            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", padding: "16px" }}>
                                <input
                                    type="text"
                                    value={discountValue}
                                    onChange={(e) => setDiscountValue(e.target.value)}
                                    placeholder="Enter discount"
                                    required
                                />

                                <FaCheck
                                    onClick={handleConfirm}
                                    style={{ cursor: "pointer" }}
                                    size={20}
                                    color="green"
                                />

                                <FaTimes
                                    onClick={handleCancel}
                                    style={{ cursor: "pointer" }}
                                    size={20}
                                    color="red"
                                />
                            </div>
                        )}
                    </div>
                </div>}

            <div className="actioButton mt-auto">
                <div className="d-flex justify-content-between mt-4">

                    <div className="print">
                        <button className="themeBtn mr-2 blue">Print KOT</button>
                        <button className="themeBtn green">Print Bill</button>
                    </div>
                </div>

                <div className="d-flex justify-content-between mt-3">
                    {<button
                        className="themeBtn green"
                        onClick={() => handleFoodStatus(false)}
                        disabled={btnDisabed}
                    >
                        Food is{" "}
                        {btnDisabed
                            ? <FaSpinner className="spin-loader" />
                            : foodStatus[orderInfo.status] || <FaSpinner className="spin-loader" />
                        }
                    </button>
                    }
                    <button className="cancelB" onClick={() => handleFoodStatus(true)}>Cancel Order</button>
                </div>
            </div>
        </div>
    );
};

export default CurrentOrder;

