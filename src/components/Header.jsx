import { Link } from 'react-router-dom'
import '../css/Header.css'
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ProfileMenu from './ProfileMenu';

const Header = (props) => {
  const { order } = props
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };
  return (
    <header className="header">
      <div className="text-center logo-wrapper imageDiv">
        <img
          src="/src/assets/zer_logo.jpeg"
          alt="Logo Image"
          width="80"
          height="80"
          className="rounded text-white"
        />
        {/* <span className="logout" onClick={handleLogout} >Logout</span> */}
        <div className="logout">

          <ProfileMenu handleLogout={handleLogout} />
        </div>

      </div>

      <div className="" id="menuPanel">
        <div className="offcanvas-body p-0">
          <ul className="menu-horizontal">
            <li className={order === 0 ? 'active' : ""}><Link to="/new_order">New Order</Link></li>
            <li className={order === 1 ? 'active' : ""}><Link to='/orders' >Orders</Link></li>
            <li className={order === 10 ? 'active' : ""}><Link to="/reservation">Reservations</Link></li>
            <li className={order === 6 ? 'active' : ""}><Link to="/table">Create Table</Link></li>
            <li className={order === 2 ? 'active' : ""}><Link to="/menu">Menu</Link></li>
            <li className={order === 9 ? 'active' : ""}><Link to="/waiters">Waiters</Link></li>
            <li className={order === 3 ? 'active' : ""}><Link to="/orderHistory">Order History</Link></li>
            <li className={order === 7 ? 'active' : ""}><Link to="/day_report">Daily Report</Link></li>
            <li className={order === 8 ? 'active' : ""}><Link to="/product_report">Product Wise Report</Link></li>
            <li className={order === 4 ? 'active' : ""}><Link to="/printer">Printer Settings</Link></li>
          </ul>
        </div>
      </div>
    </header>
  )
}

export default Header