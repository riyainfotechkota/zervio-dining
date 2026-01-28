import React, { Fragment, useState } from "react";
import "../css/Auth.css";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { AiOutlineUser } from "react-icons/ai";

const AuthPanel = () => {
    const [isLogin, setIsLogin] = useState(false);
    const [restaurantName, setRestaurantName] = useState("");
    const [mobile, setMobile] = useState("");
    const [err, setErr] = useState(false);
    const [errorField, setErrorField] = useState(false);
    const [loading, setLoading] = useState(false)

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = () => {
        setErr(false);
        setErrorField(false);

        if (mobile.length !== 10) {
            setErr(true);
            setErrorField(true);
            return;
        }
        setLoading(true)
        const formData = new FormData();
        formData.append("contact", mobile);

        fetch("/api/login.php", { method: "POST", body: formData })
            .then(res => {
                if (!res.ok) {
                    setErr(true);
                    setErrorField(true);
                    throw new Error("Network response was not ok");
                }
                return res.json();
            })
            .then(data => {
                if (!data?.id) {
                    setErr(true);
                    setErrorField(true);
                    return;
                }

                setLoading(false)

                login({
                    ...data
                });

                navigate("/home");
            })
            .catch(() => {
                setErr(true);
                setErrorField(true);
            });
    };

    return (
        <Fragment>
            <div className="logo">
                <img
                    src="zer_logo.jpeg"
                    alt="Logo"
                    width="80"
                    height="80"
                    className="rounded"
                />
            </div>

            <div className="auth-container">
                <div className="auth-box">

                    <h1>{isLogin ? "Login" : "Signup"}</h1>

                    <div className="user-icon">
                        <AiOutlineUser size={36} color="#031837" />
                    </div>
                    {loading &&
                        <div className="spinner-border text-warning" role="status">
                            f                      <span className="visually-hidden">Loading...</span>
                        </div>
                    }
                    {err && (
                        <p className="error-text">Invalid details, try again.</p>
                    )}
                    {!loading && <Fragment>
                        <div className="inputs">
                            {!isLogin && (
                                <input
                                    type="text"
                                    placeholder="Enter Restaurant Name"
                                    value={restaurantName}
                                    onChange={(e) => setRestaurantName(e.target.value)}
                                    className={errorField ? "input-error" : ""}
                                    onFocus={() => {
                                        setErr(false)
                                        setErrorField(false)
                                    }}
                                />
                            )}

                            <input
                                type="tel"
                                placeholder="Enter 10-digit Mobile"
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value)}
                                className={errorField ? "input-error" : ""}
                                onFocus={() => {
                                    setErr(false)
                                    setErrorField(false)
                                }}
                            />
                        </div>

                        <button className="auth-btn" onClick={handleSubmit}>
                            {isLogin ? "Login" : "Signup"}
                        </button>

                        <div className="toggle-auth">
                            {isLogin ? (
                                <span>
                                    Don't have an account?{" "}
                                    <button onClick={() => setIsLogin(false)}>Signup</button>
                                </span>
                            ) : (
                                <span>
                                    Already have an account?{" "}
                                    <button onClick={() => setIsLogin(true)}>Login</button>
                                </span>
                            )}
                        </div>
                    </Fragment>}
                </div>
            </div>
        </Fragment>
    );
};

export default AuthPanel;
