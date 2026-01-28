import { Fragment, useEffect, useState } from "react";
import Header from "../components/Header";
import "../css/OrderHistory.css";
import RedAlert from "../components/RedAlert";

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showRed, setShowRed] = useState(false);
    const [alertData, setAlertData] = useState({ title: "", text: "" })


    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const limit = 10;


    const restaurantId = localStorage.getItem("restaurantId");
    useEffect(() => {
        if (!restaurantId) return;

        const controller = new AbortController();

        const formData = new FormData();
        formData.append("id", restaurantId);
        formData.append("page", page);
        formData.append("limit", limit);

        fetch("/api/get_order_history.php", {
            method: "POST",
            body: formData,
        })
            .then(res => res.json())
            .then(res => {
                if (!res.status) throw new Error(res.message);

                const mappedOrders = res.data.map(order => ({
                    id: order.order_id,
                    customerName: order.user_name || "Guest",
                    orderDetails: order.order_details?.length
                        ? order.order_details
                            .map(o => `${o.quantity}x ${o.product}`)
                            .join(", ")
                        : "-",
                    orderStatus: order.status || "Pending",
                    totalAmount: Number(order.grand_total || 0),
                    paymentStatus: order.payment_status || "-",
                    paymentMode: order.payment_type
                        ? order.payment_type.replace(/<br\s*\/?>/gi, " ")
                        : "-",
                    orderDate: order.created_on?.split(" ")[0],
                    paymentDate: order.payment_date?.split(" ")[0] || "-"
                }));

                setOrders(mappedOrders);
                setHasMore(res.has_more);
            })
            .catch(err => {
                if (err.name !== "AbortError") {
                    console.error("API Error:", err);
                }
                setAlertData({ title: "Order History", text: "Unable to fetch order history" })
                setShowRed(true)
            });

        return () => controller.abort();
    }, [page, restaurantId]);

    const filteredOrders = orders.filter(order =>
        order.id.toString().includes(searchTerm) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.orderStatus.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Fragment>
            <Header order={3} />
            {showRed && (
                <RedAlert
                    title={alertData.title}
                    text={alertData.text}
                    onCancel={() => setShowRed(false)}
                />
            )}
            <main className="main-order-history">
                <h2>Order History</h2>

                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Search by Order ID, Customer Name or Status"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <table className="order-history-table">
                    <thead>
                        <tr>
                            <th>Sr. No.</th>
                            <th>Order ID</th>
                            <th>Customer Name</th>
                            <th>Order Details</th>
                            <th>Order Status</th>
                            <th>Total Amount</th>
                            <th>Payment Status</th>
                            <th>Payment Mode</th>
                            <th>Order Date</th>
                            <th>Payment Date</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredOrders.length ? (
                            filteredOrders.map((order, index) => (
                                <tr key={order.id}>
                                    <td style={{ textAlign: "center" }}>
                                        {(page - 1) * limit + index + 1}
                                    </td>
                                    <td>{order.id}</td>
                                    <td>{order.customerName}</td>
                                    <td className="wrap-text">
                                        {order.orderDetails}
                                    </td>
                                    <td>{order.orderStatus}</td>
                                    <td>
                                        ₹{order.totalAmount.toFixed(2)}
                                    </td>
                                    <td>{order.paymentStatus}</td>
                                    <td>{order.paymentMode}</td>
                                    <td>{order.orderDate}</td>
                                    <td>{order.paymentDate}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="10" style={{ textAlign: "center" }}>
                                    No orders found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

            </main>
            <div className="pagination">
                <button
                    disabled={page === 1}
                    onClick={() => setPage(1)}
                >
                    First
                </button>

                <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                >
                    Prev
                </button>

                <span>Page {page}</span>

                <button
                    disabled={!hasMore}
                    onClick={() => setPage(p => p + 1)}
                >
                    Next
                </button>
            </div>
        </Fragment>
    );
};

export default OrderHistory;
