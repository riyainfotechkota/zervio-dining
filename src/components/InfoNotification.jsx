import "../css/Notification.css";
import React, { useEffect, useState } from "react";
import { useOrders } from "../context/OrderContext";
const soundSrc = "/Short-notification-sound.mp3";

export default function InfoNotification({ message }) {
    const { setAutoAcceptedOrder } = useOrders();
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const audio = soundSrc ? new Audio(soundSrc) : null;
        if (audio) {
            audio.play().catch(() => { });
        }

        const timer = setTimeout(() => {
            setVisible(false);
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
            }
            setAutoAcceptedOrder(null);
        }, 5000);

        return () => {
            clearTimeout(timer);
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
            }
        };
    }, []);

    if (!visible) return null;

    return (
        <ul className="notif-container">
            <li className="notif-toast notif-info">
                <div className="notif-column">
                    <i className="fa-solid fa-circle-info"></i>
                    <span>{message}</span>
                </div>
            </li>
        </ul>
    );
}
