import React, { Fragment, useRef, useState, useEffect } from 'react';
import '../css/OrderMenu.css';
import { FaShoppingCart } from "react-icons/fa";
import Header from '../components/Header';
import GreenAlert from '../components/GreenAlert';
import RedAlert from '../components/RedAlert';
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

const OrderMenu = () => {
  const [tableSelected, setTableSelected] = useState("");
  const [showTables, setShowTables] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const [itemList, setItemList] = useState([]);
  const [tableList, setTableList] = useState([]);
  const [searchList, setSearchList] = useState([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const debounceTimer = useRef(null);
  const [visibleItems, setVisibleItems] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [restaurantId] = useState(localStorage.getItem("restaurantId") || null);
  const [showRed, setShowRed] = useState(false);
  const [showGreen, setShowGreen] = useState(false);
  const [alertData, setAlertData] = useState({ title: "", text: "" })
  const showMoreItems = () => setVisibleItems(prev => prev + 10);

  const [showAll, setShowAll] = useState(false);

  const initialCount = 15;
  const visibleTables = showAll ? tableList : tableList.slice(0, initialCount);

  useEffect(() => {
    setLoading(true);
    const formData = new FormData();
    formData.append("id", restaurantId);

    Promise.all([
      fetch("/api/get_menu.php").then(res => res.ok ? res.json() : Promise.reject("Menu fetch failed")),
      fetch("/api/get_tables.php", { method: "POST", body: formData }).then(res => res.ok ? res.json() : Promise.reject("Tables fetch failed"))
    ])
      .then(([menuData, tableData]) => {
        setItemList(menuData);
        setSearchList(menuData);
        setTableList(tableData);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, []);

  const handleTable = (table) => {
    setTableSelected(table);
    if (table.name !== "") setMenuVisible(true);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setSearchList(value.trim() ? itemList.filter(item => item.product.toLowerCase().includes(value.toLowerCase())) : itemList);
    }, 300);
  };

  const addToCart = (item, quantity) => {
    if (!quantity || quantity <= 0) return;
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id && i.is_submenu === item.is_submenu);
      if (existing) return prev.map(i => i.id === item.id && i.is_submenu === item.is_submenu ? { ...i, quantity: i.quantity + quantity } : i);
      return [...prev, { ...item, quantity }];
    });
  };

  const handlePlaceOrder = () => {
    if (cart.length === 0) return;
    const formattedCart = cart.map(item => ({
      product_id: item.parent_id ? item.parent_id : item.id,
      submenu_id: item.is_submenu ? item.id : 0,
      price: item.price,
      quantity: item.quantity,
      total_price: item.price * item.quantity
    }));

    const formData = new FormData();
    formData.append("cart", JSON.stringify(formattedCart));
    formData.append("user_id", tableSelected.id);
    formData.append("restaurent_id", restaurantId);

    fetch("/api/place_order.php", { method: "POST", body: formData })
      .then(res => res.json())
      .then(result => {
        setCart([])
        setAlertData({ title: "Order Update", text: "Order Placed Successfully" })
        setShowGreen(true)
      })
      .catch(err => {
        console.error(err)
        setAlertData({ title: "Order Update", text: "Unable to place order" })
        setShowRed(true)
      });
  };

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <Fragment>
      <Header order={0} />
      {showGreen && <GreenAlert
        title={alertData.title}
        text={alertData.text}
        onCancel={() => setShowGreen(false)}
      />}
      {showRed && (
        <RedAlert
          title={alertData.title}
          text={alertData.text}
          onCancel={() => setShowRed(false)}
        />
      )}
      <main>
        <div className='main-cart'>
          <div className='cart'>
            <FaShoppingCart className='cartIcon' size={50} />
            <h1 className='cartHead'>Your Cart</h1>
          </div>
          <div className='order-total'>
            <span>Selected Table: {tableSelected.name || "None"}</span>
            {cart.map((item, idx) => (
              <div className="alert-box" key={idx}>
                <span className="alert-text">{item.product} X {item.quantity}</span>
                <span className="alert-close" onClick={() => setCart(prev => prev.filter((_, i) => i !== idx))}>&times;</span>
              </div>
            ))}
            <span>Total: ₹ {total}</span>
            <button disabled={cart.length === 0} onClick={handlePlaceOrder}>Place order</button>
          </div>
        </div>

        {/* ....... */}
        <div className="table-fixed">
          <div
            className="d-flex justify-content-between align-items-center"
            style={{ cursor: "pointer" }}
            onClick={() => setShowTables(prev => !prev)}
          >
            <h2 className="m-0">Select Table</h2>
            {showTables ? (
              <FiChevronUp color="#031837" size={24} />
            ) : (
              <FiChevronDown color="#031837" size={24} />
            )}
          </div>

          <div className={`collapse ${showTables ? "show" : ""}`}>
            <div className="tables mt-3">
              {visibleTables.map((table, index) => (
                <div
                  className="my-profile"
                  key={index}
                  onClick={() => handleTable(table)}
                >
                  <div className="profile-container">
                    <div className="outer-circle"></div>
                    <div className="circle-glow"></div>
                    <div className="inner-circle">
                      <span>{table.name}</span>
                    </div>
                  </div>
                </div>
              ))}

              {tableList.length > initialCount && (
                <div className="mt-2 d-flex align-items-center">
                  <button
                    className="btn btn-link p-0 d-flex align-items-center"
                    onClick={() => setShowAll(prev => !prev)}
                  >
                    {showAll ? (
                      <>
                        <FiChevronUp className="me-1" /> Show Less
                      </>
                    ) : (
                      <>
                        <FiChevronDown className="me-1" /> Show {tableList.length - initialCount} More
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* ......... */}

        <div className={`order-menu ${menuVisible ? "show-menu" : ""}`}>
          <div className='menuHead'>
            <h1>Menu</h1>
            <input type="text" id="itemSearch" placeholder="Search Items" value={search} onChange={handleSearch} />
          </div>
          <div className='menu-items'>
            {loading && <p>Loading menu data...</p>}
            {!loading && searchList.length > 0 ? searchList.slice(0, visibleItems).map((item, index) => (
              <MenuCard key={index} item={item} addToCart={addToCart} />
            )) : <span>No Items Found</span>}
          </div>
          {visibleItems < searchList.length && (
            <button className="show-more-btn" onClick={showMoreItems}>Show More</button>
          )}
        </div>
      </main>
    </Fragment>
  );
};

const MenuCard = ({ item, addToCart }) => {
  const [selectedSubmenu, setSelectedSubmenu] = useState(null);
  const [showSubmenu, setShowSubmenu] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const handleMainClick = () => {
    if (showSubmenu || showInput) {
      setShowSubmenu(false);
      setShowInput(false);
      setSelectedSubmenu(null);
      return;
    }
    if (item.submenu && item.submenu.length > 0) setShowSubmenu(true);
    else setShowInput(true);
  };

  const handleSubmenuSelect = (sub) => {
    setSelectedSubmenu(sub);
    setShowInput(true);
  };

  const handleAdd = () => {
    let productToAdd;
    if (selectedSubmenu) {
      productToAdd = {
        id: selectedSubmenu.id,
        parent_id: item.id,
        product: selectedSubmenu.name,
        price: selectedSubmenu.price,
        img: selectedSubmenu.img || "",
        is_submenu: true
      };
    } else {
      productToAdd = {
        id: item.id,
        parent_id: 0,
        product: item.product,
        price: item.price,
        img: item.img || "",
        is_submenu: false
      };
    }
    addToCart(productToAdd, quantity);
    setQuantity(1);
    setShowSubmenu(false);
    setShowInput(false);
    setSelectedSubmenu(null);
  };

  return (
    <div className="mb-3">
      <div className="menu-item d-flex justify-content-between p-2 border" onClick={handleMainClick} style={{ cursor: "pointer" }}>
        <span>{item.product.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}</span>
        <span className="fw-bold">&#8377; {item.price}</span>
      </div>
      {showSubmenu && item.submenu && (
        <ul className="list-group mt-2">
          {item.submenu.map(sub => (
            <li key={sub.id} className={`list-group-item d-flex justify-content-between ${selectedSubmenu?.id === sub.id ? "active" : ""}`} onClick={() => handleSubmenuSelect(sub)} style={{ cursor: "pointer" }}>
              <span>{sub.name}</span>
              <span className="fw-bold">&#8377; {sub.price}</span>
            </li>
          ))}
        </ul>
      )}
      {showInput && (
        <div className="mt-2 d-flex">
          <input type="number" min={1} className="form-control me-2" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))} />
          <button className="btn" style={{ backgroundColor: "black", color: "white" }} onClick={handleAdd}>Add</button>
        </div>
      )}
    </div>
  );
};

export default OrderMenu;
