import React, { Fragment } from "react";
import { FiWifiOff } from "react-icons/fi";
import "../css/NoInternet.css";

export default function NoInternet() {
    return (
        <Fragment>

            <div className="logo">
                <img
                    src="/src/assets/zer_logo.jpeg"
                    alt="Logo"
                    width="80"
                    height="80"
                    className="rounded"
                />
            </div>
            <div className="noInternetPage">
                <FiWifiOff size={80} color="#FF4C4C" className="icon" />
                <h1>No Internet Connection</h1>
                <p>It seems you are offline. Please check your connection and try again.</p>
                <button
                    className="retryButton"
                    onClick={() => window.location.reload()}
                >
                    Retry
                </button>
            </div>
        </Fragment>
    );
}
