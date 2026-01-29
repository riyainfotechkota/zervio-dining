import { Fragment } from "react"
import { FaCheck, FaConciergeBell, FaListUl, FaUserTie, FaHistory, FaPrint, FaChartBar, FaBoxOpen } from "react-icons/fa";
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
                    {Array.from({ length: 8 }, (_, i) => i + 1).map((v) => {
                        switch (v) {
                            case 1:
                                return (
                                    <Link to="/menu">

                                        <button key={v} type="button" className="btn">
                                            <FaListUl />
                                        </button>
                                    </Link>
                                );

                            case 2:
                                return (
                                    <Link to='/orders'>
                                        <button key={v} type="button" className="btn">
                                            <FaConciergeBell />
                                        </button>
                                    </Link>
                                );

                            case 3:
                                return (
                                    <Link to='/orderHistory'>

                                        <button key={v} type="button" className="btn">
                                            <FaHistory />
                                        </button>
                                    </Link>
                                );
                            case 4:
                                return (
                                    <Link to='/printer'>
                                        <button key={v} type="button" className="btn">
                                            <FaPrint />
                                        </button>
                                    </Link>
                                );
                            case 5:
                                return (
                                    <Link to='/day_report'>
                                        <button key={v} type="button" className="btn">
                                            <FaChartBar />
                                        </button>
                                    </Link>
                                );
                            case 6:
                                return (
                                    <Link to='/product_report'>
                                        <button key={v} type="button" className="btn">
                                            <FaBoxOpen />
                                        </button>
                                    </Link>
                                );
                            case 7:
                                return (
                                    <Link to='/waiters'>

                                        <button key={v} type="button" className="btn">
                                            <FaUserTie />
                                        </button>
                                    </Link>
                                );

                            case 8:
                                return (
                                    <ProfileMenu key={v} handleLogout={handleLogout} />
                                );

                            default:
                                return (
                                    <button key={v} type="button" className="btn">
                                        <FaCheck />
                                    </button>
                                );
                        }
                    })}

                </div>
            </div>
        </Fragment>
    )
}