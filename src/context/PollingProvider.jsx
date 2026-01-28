import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useOrders } from "../context/OrderContext";
import BlueModal from "../components/BlueModal";
import OrderCard from "../components/OrderCard";

const soundSrc = "/Short-notification-sound.mp3";

export default function DataWatcher({ children }) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { orders, setOrders, newOrders, setNewOrders, setAutoAcceptedOrder } = useOrders();

    const autoAccept = JSON.parse(localStorage.getItem("user") || '{}')?.auto_accept === '1';
    const restaurantId = localStorage.getItem("restaurantId");

    const previousData = useRef([]);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (!autoAccept || newOrders.length === 0) return;

        const latestOrder = newOrders[0];
        const orderId = latestOrder.order.id;

        const formData = new FormData();
        formData.append("id", orderId);
        formData.append("status", "Accept");

        fetch("/api/update_order_status.php", { method: "POST", body: formData })
            .then(res => res.json())
            .then(() => {
                setNewOrders(prev => prev.filter(o => o.order.id !== orderId));
                setAutoAcceptedOrder(latestOrder);
                navigate("/orders");
            })
            .catch(() => { });
    }, [newOrders, autoAccept]);

    useEffect(() => {
        if (!user || !restaurantId) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            previousData.current = [];
            setNewOrders([]);
            return;
        }

        if (!intervalRef.current) {
            fetchOrders();
            intervalRef.current = setInterval(fetchOrders, 10000);
        }

        return () => {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        };
    }, [user, restaurantId]);

    async function fetchOrders() {
        try {
            const formData = new FormData();
            formData.append("id", restaurantId);

            const res = await fetch("/api/get_current_order.php", { method: "POST", body: formData });
            const newData = await res.json();

            const newDataArray = Array.isArray(newData) ? newData : (newData ? [newData] : []);
            setOrders(newDataArray);

            const orderedItems = newDataArray.filter(item => item.order?.status === "ordered");
            const prevIds = previousData.current.map(o => o.order.id);
            const newOrdersToAdd = previousData.current.length === 0
                ? orderedItems
                : orderedItems.filter(o => !prevIds.includes(o.order.id));

            if (newOrdersToAdd.length > 0) {
                setNewOrders(prev => [...prev, ...newOrdersToAdd]);
            }

            previousData.current = newDataArray;
        } catch (error) {
            console.error("Failed to fetch orders:", error);
        }
    }

    const handleModalClose = (orderId) => {
        setNewOrders(prev => prev.filter(o => o.order.id !== orderId));
        navigate("/orders");
    };

    return (
        <>
            {children}

            {!autoAccept &&
                newOrders.map(order => (
                    <BlueModal
                        key={order.order.id}
                        title={`New Order #${order.order.id}`}
                        text={<OrderCard data={order} />}
                        orderId={order.order.id}
                        onCancel={() => handleModalClose(order.order.id)}
                        onAccept={() => handleModalClose(order.order.id)}
                        soundSrc={soundSrc}
                    />
                ))
            }
        </>
    );
}
