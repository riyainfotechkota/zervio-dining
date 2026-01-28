import React from "react";
import "../css/OrderCard.css";

export default function OrderCard({ data }) {
    const { order, order_details, address_details, user } = data;

    const INR = (v) => <span>{parseFloat(v || 0).toFixed(2)}</span>;

    return (
        <div className="newOrderCard">

            <div className="orderHeader">
                <h3>Order #{order.id}</h3>
                <span className={`status ${order.status}`}>
                    {order.status.toUpperCase()}
                </span>
            </div>

            <div className="section">
                <h4>Customer</h4>
                <p><strong>Name:</strong> {user?.name || "N/A"}</p>
                <p><strong>Contact:</strong> {user?.contact || "N/A"}</p>
            </div>

            <div className="section">
                <h4>Delivery Address</h4>
                <p>{address_details?.address}</p>
                <p>{address_details?.city}, {address_details?.state}</p>
                <p>{address_details?.pincode}</p>
            </div>

            <div className="section">
                <h4>Items</h4>
                <ul className="itemsList">
                    {order_details.map(item => (
                        <li key={item.id} className="itemRow">
                            <span>{item.product} × {item.quantity}</span>
                            <span>{INR(item.total_price)}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="section">
                <h4>Payment</h4>

                <div className="priceRow">
                    <span>Total:</span>
                    <span>{INR(order.total)}</span>
                </div>

                <div className="priceRow">
                    <span>GST:</span>
                    <span>{INR(order.gst)}</span>
                </div>

                <div className="priceRow">
                    <span>Delivery Fee:</span>
                    <span>{INR(order.delivery_fee)}</span>
                </div>

                <div className="priceRow grand">
                    <span>Grand Total:</span>
                    <span>{INR(order.grand_total)}</span>
                </div>

                <div className="priceRow">
                    <span>Payment Status:</span>
                    <strong className={`statusText ${order.payment_status.toLowerCase()}`}>
                        {order.payment_status}
                    </strong>
                </div>
            </div>

            <div className="footerRow">
                <span>Order Date:</span>
                <span>{order.created_on}</span>
            </div>
        </div>
    );
}
