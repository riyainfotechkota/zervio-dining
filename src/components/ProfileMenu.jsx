import React from "react";
import { FaUserCircle, FaSignOutAlt, FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";

const ProfileMenu = ({ handleLogout }) => {
    return (
        <div className="dropdown">
            <span
                className="dropdown-toggle d-flex align-items-center"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                title="Profile"
                style={{ cursor: "pointer" }}
            >
                <FaUserCircle size={26} />
            </span>

            <ul className="dropdown-menu dropdown-menu-end">
                <li>
                    <Link className="dropdown-item d-flex align-items-center" to="/profile">
                        <FaUser className="me-2" />
                        Profile
                    </Link>
                </li>

                <li>
                    <hr className="dropdown-divider" />
                </li>

                <li>
                    <button
                        className="dropdown-item d-flex align-items-center text-danger"
                        onClick={handleLogout}
                    >
                        <FaSignOutAlt className="me-2" />
                        Logout
                    </button>
                </li>
            </ul>
        </div>
    );
};

export default ProfileMenu;
