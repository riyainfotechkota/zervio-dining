import { Fragment } from "react"
import { FaCheck, FaTimes, FaSpinner, FaSync, FaCircle } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import ProfileMenu from "../components/ProfileMenu";

export default function HeaderNew() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/");
    };
    return (
        <Fragment>
            <div className="tv-header d-flex align-items-center justify-content-between p-3">
                <div className="d-flex align-items-center gap-3">
                    <h4 className="tv-logo mb-0">Din-in</h4>
                    <Link to='/home'>
                        <button type="button" className="btn btn-danger">New Order</button>
                    </Link>
                    <input type="text" className="form-control tv-bill" placeholder="Bill No" />
                </div>
                <div className="d-flex align-items-center gap-2">
                    <div className="d-flex flex-column align-items-center border p-1">
                        <span className="tv-support">📞 Call For Support</span>
                        <span className="tv-support">9099912483</span>
                    </div>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map(v => {
                        if (v === 10) {
                            return (
                                <ProfileMenu handleLogout={handleLogout} />

                            )
                        }
                        return (

                            <button type="button" className="btn"><FaCheck /></button>
                        )
                    })}
                </div>
            </div>
        </Fragment>
    )
}