import { useState } from "react";
import "../css/Popup.css";

export default function BasePopup({
    color,
    title,
    text,
    onCancel
}) {
    const [closing, setClosing] = useState(false);

    const handleClose = () => {
        setClosing(true);
        setTimeout(() => {
            if (onCancel) onCancel();
        }, 500);
    };

    return (
        <>
            <div
                className={`popUpFundo ${color} ${closing ? "popUpSaida" : "popUpEntrada"
                    }`}
            />
            <div
                className={`popUp ${color} p ${closing ? "popUpSaida" : "popUpEntrada"
                    }`}
            >
                <h1>{title}</h1>
                <div>
                    <span>{text}</span>
                </div>
                <button className="puCancelar alert" onClick={handleClose}>
                    OK
                </button>
            </div>
        </>
    );
}
