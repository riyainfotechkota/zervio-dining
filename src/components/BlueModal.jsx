import "../css/Popup.css";
import { Fragment, useEffect, useState } from "react";

export default function BlueModal({ title, text, orderId, onCancel, onAccept, soundSrc }) {
    const [closing, setClosing] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!soundSrc) return;

        const audio = new Audio(soundSrc);
        audio.loop = true;
        audio.play().catch(() => { });

        return () => {
            audio.pause();
            audio.currentTime = 0;
        };
    }, [soundSrc]);

    const updateStatus = async (status) => {
        if (!orderId) return;

        setLoading(true);
        const formData = new FormData();
        formData.append("id", orderId);
        formData.append("status", status);

        try {
            const res = await fetch("/api/update_order_status.php", { method: "POST", body: formData });
            if (!res.ok) throw new Error("Network response was not ok");
            const data = await res.json();
            console.log("Order updated:", data);
        } catch (err) {
            console.error("Failed to update order status:", err);
        } finally {
            setLoading(false);
        }
    };

    const close = async () => {
        setClosing(true);
        await updateStatus("Cancelled");
        setTimeout(() => onCancel && onCancel(), 500);
    };

    const accept = async () => {
        setClosing(true);
        await updateStatus("Accept");
        setTimeout(() => onAccept && onAccept(), 500);
    };

    return (
        <Fragment>
            <div
                className={`popUpFundo blue ${closing ? "popUpSaida" : "popUpEntrada"}`}
            />

            <div className={`popUp blue p ${closing ? "popUpSaida" : "popUpEntrada"}`}>
                <h1>{title}</h1>

                <div>
                    {text}
                </div>

                <button className="puCancelar alert" onClick={close} disabled={loading}>
                    Cancel
                </button>
                <button className="puCancelar alert" onClick={accept} disabled={loading}>
                    Accept
                </button>
            </div>
        </Fragment>
    );
}
