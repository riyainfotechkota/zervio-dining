import React, { Fragment, useState, useEffect, useMemo, useRef, useCallback } from "react";
import "../css/Menu.css";
import Header from "../components/Header";
import { convertToAmPm } from "../helpers/amToPm";
import { getImageUrl } from "../helpers/getImageUrl";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import GreenAlert from "../components/GreenAlert";
import RedAlert from "../components/RedAlert";

const Menu = () => {
  const [items, setItems] = useState([]);
  const [searchList, setSearchList] = useState([]);
  const [addingItem, setAddingItem] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentItem, setCurrentItem] = useState(null);
  const [activeStatus, setActiveStatus] = useState("Active");
  const [search, setSearch] = useState("");
  const [visibleItems, setVisibleItems] = useState(5);
  const [editingSubmenu, setEditingSubmenu] = useState(null);
  const [showSequenceModal, setShowSequenceModal] = useState(false);
  const [priorityList, setPriorityList] = useState([]);
  const [showRed, setShowRed] = useState(false);
  const [showGreen, setShowGreen] = useState(false);
  const [alertData, setAlertData] = useState({ title: "", text: "" })

  const [restaurantId, setRestaurantId] = useState(
    () => localStorage.getItem("restaurantId") || null
  );


  const categoryRef = useRef();
  const itemNameRef = useRef();
  const descriptionRef = useRef();
  const fromTimeRef = useRef();
  const toTimeRef = useRef();
  const priceRef = useRef();
  const imgRef = useRef();

  const debounceTimer = useRef(null);

  useEffect(() => {
    fetch("/api/get_menu.php")
      .then(res => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then(data => {
        setItems(data);
        setSearchList(data);
        if (data.length > 0) {
          setRestaurantId(data[0].restaurent_id);
          localStorage.setItem("restaurantId", data[0].restaurent_id);
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setAlertData(p => ({ ...p, title: 'Fetch Error', text: 'Unable to load Menu' }))
        setShowRed(true)
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("restaurantId");
    if (saved) setRestaurantId(saved);
  }, []);


  const uniqueCategories = useMemo(() => [...new Set(items.map(item => item.category))], [items]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      if (value.trim()) {
        setSearchList(items.filter(item =>
          item.product.toLowerCase().includes(value.toLowerCase())
        ));
      } else {
        setSearchList(items);
      }
    }, 300);
  };

  const handleAddItem = useCallback((e) => {
    e.preventDefault();

    const category = categoryRef.current.value;
    const product = itemNameRef.current.value;
    const description = descriptionRef.current?.value || "";
    const open_time = fromTimeRef.current?.value || "00:00:00";
    const close_time = toTimeRef.current?.value || "23:59:00";
    const price = parseInt(priceRef.current?.value) || 0;
    const imgFile = imgRef.current?.files?.[0] || null;

    if (!category || !product) return;

    const formData = new FormData();
    currentItem?.id ? formData.append("id", currentItem.id) : formData.append("id", restaurantId)

    formData.append("category", category);
    formData.append("product", product);
    formData.append("description", description);
    formData.append("open_time", open_time);
    formData.append("close_time", close_time);
    formData.append("price", price);
    formData.append("status", activeStatus || "Active");
    formData.append("priority", 1);
    formData.append("is_submenu", currentItem?.submenu);

    if (imgFile) {
      formData.append("img", imgFile);
    } else if (currentItem?.img) {
      formData.append("img", currentItem.img);
    }

    const url = currentItem ? "/api/update_menu.php" : "/api/add_menu.php";

    fetch(url, { method: "POST", body: formData })
      .then(res => res.json())
      .then(data => {
        setAlertData(p => ({
          ...p,
          title: currentItem ? 'Menu Update' : 'Item Add',
          text: currentItem ? 'Item Updated Successfully' : 'Item Added Successfully',
        }))
        setShowGreen(true)

        const newItem = {
          id: currentItem?.id || data.inserted_id || Date.now(),
          category,
          product,
          description,
          open_time,
          close_time,
          price,
          img: imgFile ? URL.createObjectURL(imgFile) : currentItem?.img,
          status: activeStatus || "Active",
        };

        setItems(prev => {
          if (currentItem) {
            return prev.map(it => it.id === currentItem.id ? newItem : it);
          } else {
            return [newItem, ...prev];
          }
        });

        setSearchList(prev => {
          if (currentItem) {
            return prev.map(it => it.id === currentItem.id ? newItem : it);
          } else {
            return [newItem, ...prev];
          }
        });

        setCurrentItem(null);
        e.target.reset();
      })
      .catch(err => {
        setAlertData(p => ({
          ...p,
          title: currentItem ? 'Menu Update' : 'Item Add',
          text: currentItem ? 'Unable to update Item' : 'Unable to add Item',
        }))
        setShowRed(true)

      });
  }, [currentItem, activeStatus, restaurantId]);

  const deleteItem = useCallback((itemId) => {
    if (!itemId) return;

    const formData = new FormData();
    formData.append("id", itemId);

    fetch("/api/delete_menu.php", { method: "POST", body: formData })
      .then(res => res.json())
      .then(() => {
        setAlertData(p => ({
          ...p,
          title: 'Menu Update',
          text: 'Item Deleted Successfully',
        }))
        setShowGreen(true)
        setItems(prev => prev.filter(it => it.id !== itemId));
        setSearchList(prev => prev.filter(it => it.id !== itemId));
      })
      .catch(err => {
        setAlertData(p => ({
          ...p,
          title: 'Menu Update',
          text: 'Unable to delete Item',
        }))
        setShowRed(true)
      });
  }, []);

  const handleDeleteSubmenu = useCallback((menuItemId, subItemId) => {
    if (!subItemId) return;

    const formData = new FormData();
    formData.append("id", subItemId);

    fetch("/api/delete_submenu.php", { method: "POST", body: formData })
      .then(res => res.json())
      .then(() => {

        setAlertData(p => ({
          ...p,
          title: 'Sub-Menu Update',
          text: 'Deleted SubMenu Item',
        }))
        setShowGreen(true)
        const removeSubItem = (prevList) =>
          prevList.map(item =>
            item.id === menuItemId
              ? { ...item, submenu: item.submenu?.filter(sub => sub.id !== subItemId) || [] }
              : item
          );

        setItems(prev => removeSubItem(prev));
        setSearchList(prev => removeSubItem(prev));
      })
      .catch(err => {
        setAlertData(p => ({
          ...p,
          title: 'Sub-Menu Update',
          text: 'Unable to delete Sub-Menu Item',
        }))
        setShowRed(true)
      });
  }, []);


  const editItem = useCallback((item) => {
    if (!item) return;
    setAddingItem(true);
    setCurrentItem(item);

    categoryRef.current.value = item.category;
    itemNameRef.current.value = item.product;
    descriptionRef.current.value = item.description;
    fromTimeRef.current.value = item.open_time;
    toTimeRef.current.value = item.close_time;
    priceRef.current.value = item.price;
    imgRef.current.value = "";
  }, []);

  const handleSubMenuEdit = (subItem) => {
    setAddingItem(false);
    setEditingSubmenu(subItem);

    const parentItem = items.find(item => item.id === subItem.product_id);
    if (parentItem) categoryRef.current.value = parentItem.product;

    itemNameRef.current.value = subItem.name;
    priceRef.current.value = subItem.price;
    imgRef.current.value = "";
  };


  const handleStatus = (itemId, newStatus) => {
    const item = items.find(it => it.id === itemId);
    if (!item) return;

    const formData = new FormData();
    formData.append("id", itemId);
    formData.append("category", item.category);
    formData.append("product", item.product);
    formData.append("description", item.description);
    formData.append("open_time", item.open_time);
    formData.append("close_time", item.close_time);
    formData.append("price", item.price);
    formData.append("status", newStatus ? 'Active' : 'Inactive');
    formData.append("priority", 1);
    formData.append("is_submenu", 0);
    if (item.img) formData.append("img", item.img);

    fetch("/api/update_menu.php", { method: "POST", body: formData })
      .then(res => res.json())
      .then(() => {
        setAlertData(p => ({
          ...p,
          title: 'Menu Update',
          text: 'Updated Menu Item',
        }))
        setShowGreen(true)
      })
      .catch(err => {
        setAlertData(p => ({
          ...p,
          title: 'Menu Update',
          text: { err },
        }))
        setShowRed(true)
      });

    setItems(prev => prev.map(it => it.id === itemId ? { ...it, status: newStatus ? "Active" : "Inactive" } : it));
    setSearchList(prev => prev.map(it => it.id === itemId ? { ...it, status: newStatus ? "Active" : "Inactive" } : it));
  };

  const showMoreItems = () => setVisibleItems(prev => prev + 10);

  const handleAddVariant = (e) => {
    e.preventDefault();
    const menuItemId = items.find(item => item.product === categoryRef.current.value)?.id;
    const vName = itemNameRef.current.value;
    const vPrice = parseInt(priceRef.current?.value) || 0;
    const vImgFile = imgRef.current?.files?.[0] || null;

    if (!vName || !menuItemId) return;

    const formData = new FormData();
    formData.append("product_id", menuItemId);
    formData.append("name", vName);
    formData.append("price", vPrice);

    if (vImgFile) formData.append("img", vImgFile);

    let url = "/api/add_new_variation.php";

    if (editingSubmenu) {
      formData.append("id", editingSubmenu.id);
      url = "/api/update_submenu.php";
    }

    fetch(url, { method: "POST", body: formData })
      .then(res => res.json())
      .then(data => {
        setAlertData(p => ({
          ...p,
          title: editingSubmenu ? 'Variation Update' : 'Add variation',
          text: editingSubmenu ? 'Variation Updated Successfully' : 'Variation added Successfully',
        }))
        setShowGreen(true)

        const newVariant = {
          id: editingSubmenu?.id || data.inserted_id || Date.now(),
          product_id: menuItemId,
          name: vName,
          price: vPrice,
          img: vImgFile ? URL.createObjectURL(vImgFile) : (editingSubmenu?.img || null)
        };

        const updateSubmenuItem = (prevList) =>
          prevList.map(item =>
            item.id === menuItemId
              ? {
                ...item,
                submenu: editingSubmenu
                  ? item.submenu?.map(sub => sub.id === editingSubmenu.id ? newVariant : sub) || []
                  : [...(item.submenu || []), newVariant]
              }
              : item
          );

        setItems(prev => updateSubmenuItem(prev));
        setSearchList(prev => updateSubmenuItem(prev));

        // reset form
        e.target.reset();
        setEditingSubmenu(null);
      })
      .catch(err => {
        setAlertData(p => ({
          ...p,
          title: 'Sub-Menu Err',
          text: { err },
        }))
        setShowRed(true)
      });
  };

  const handleOpenSequence = () => {
    const obj = {};

    items.forEach(it => {
      if (!obj[it.category]) {
        obj[it.category] = it.priority;
      }
    });

    setPriorityList(obj);
    setShowSequenceModal(true);
  };

  const handlePriorityChange = (category, newValue) => {
    setPriorityList(prev => ({
      ...prev,
      [category]: newValue
    }));
  };

  const handleSavePriority = () => {
    const formData = new FormData();

    formData.append("restaurent_id", restaurantId);
    formData.append("data", JSON.stringify(priorityList));

    fetch("/api/change_menu_squence.php", {
      method: "POST",
      body: formData
    })
      .then(res => res.json())
      .then(() => {
        setAlertData(p => ({
          ...p,
          title: 'Menu Sequence Upadte',
          text: 'Sequence Updated Successfully',
        }))
        setShowGreen(true)
        setItems(prev =>
          prev.map(it => ({
            ...it,
            priority: priorityList[it.category] || it.priority
          }))
        );

        setShowSequenceModal(false);
      })
      .catch(err => {
        setShowSequenceModal(false);
        setAlertData(p => ({
          ...p,
          title: 'Menu Sequence Update',
          text: 'Sequence Upadted Failed',
        }))
        setShowRed(true)
      });
  };

  return (
    <Fragment>
      <Header order={2} />
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

      <main className="menu-management">
        <h2>Menu Management</h2>

        <div className="tabs">
          <span className={addingItem ? "active-tab" : ""} onClick={() => setAddingItem(true)}>Add Item</span>
          <span className={!addingItem ? "active-tab" : ""} onClick={() => setAddingItem(false)}>Add Variation</span>
        </div>

        <form className="form" onSubmit={addingItem ? handleAddItem : handleAddVariant} disabled={!restaurantId}>
          <h6>{addingItem ? "Item Details" : "Variant Details"}</h6>

          <label>
            {addingItem ? "Category:" : "Menu Item"}
            <select id="itemsList" ref={categoryRef}>
              <option value="">{addingItem ? "Select Category" : "Select Item"}</option>
              {addingItem && uniqueCategories.map((cat, index) => <option key={index} value={cat}>{cat}</option>)}
              {!addingItem && items.map((pro, index) => <option key={index} value={pro.product}>{pro.product}</option>)}
            </select>
          </label>

          <label>
            {addingItem ? "Name:" : "Varient Name:"}
            <input id="item-name" type="text" ref={itemNameRef} required />
          </label>

          {addingItem && (
            <>
              <label>
                Recipe / Description:
                <textarea id="item-description" ref={descriptionRef} />
              </label>

              <label>
                From Time:
                <input id="fromTime" type="time" ref={fromTimeRef} />
              </label>

              <label>
                To Time:
                <input id="toTime" type="time" ref={toTimeRef} />
              </label>
            </>
          )}

          <label>
            Price:
            <input id="itemPrice" type="number" ref={priceRef} required />
          </label>

          <label>
            Upload a file:
            <input id="itemImage" type="file" ref={imgRef} />
          </label>

          {addingItem && <button className="add-btn" type="submit">{currentItem ? "Update Item" : "Add Item"}</button>}
          {!addingItem && <button className="add-btn" type="submit">{editingSubmenu ? "Update Variant" : "Add Variant"}</button>}


        </form>

        <div>
          <div className="menuHead">
            <div className="menuSearch" style={{ display: "flex", gap: "20px" }}>
              <h2>Menu Items</h2>
              <input type="text" id="itemSearch" placeholder="Search Items" value={search} onChange={handleSearch} />
            </div>
            <span onClick={handleOpenSequence} style={{ cursor: "pointer" }}>Change Sequence</span>
          </div>

          {error && <p>Error: {error}</p>}
          {loading && <p>Loading menu data...</p>}

          {!loading && searchList.length === 0 ? <p>No items added yet.</p> : (
            <ul className="item-list">
              {searchList.slice(0, visibleItems).map(item => (
                <div key={item.id}>
                  <MenuItem
                    item={item}
                    onEdit={() => editItem(item)}
                    onDelete={() => deleteItem(item.id)}
                    handleStatus={handleStatus}
                  />
                  <SubMenuList
                    submenu={item.submenu}
                    onEdit={handleSubMenuEdit}
                    onDelete={handleDeleteSubmenu}
                    getImageUrl={getImageUrl}
                  />
                </div>
              ))}
            </ul>
          )}

          {visibleItems < searchList.length && (
            <button className="show-more-btn" onClick={showMoreItems}>Show More</button>
          )}
        </div>
      </main>
      {showSequenceModal && (
        <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content" style={{
              width: '140%',
              color: "#031837",
              overflow: "scroll",
              height: "90vh"
            }}>

              <div className="modal-header">
                <h5 className="modal-title">Change Category Sequence</h5>
                <button className="btn-close" onClick={() => setShowSequenceModal(false)}></button>
              </div>

              <div className="modal-body">
                {Object.entries(priorityList).map(([category, priority]) => (
                  <div key={category} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <strong>{category}</strong>
                    <input
                      type="number"
                      className="form-control"
                      style={{ width: "80px" }}
                      value={priority}
                      onChange={(e) => handlePriorityChange(category, e.target.value)}
                    />
                  </div>
                ))}

              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowSequenceModal(false)}>
                  Cancel
                </button>
                <button className="btn text-white" onClick={handleSavePriority} style={{ background: "#031837" }}>
                  Save Changes
                </button>
              </div>

            </div>
          </div>
        </div>
      )}


    </Fragment>
  );
};

const MenuItem = ({ item, onEdit, onDelete, handleStatus, index }) => {
  const [isActive, setIsActive] = useState(item.status === 'Active');
  const Icon = useCallback(({ type }) => {
    if (type === "edit") return (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="white" viewBox="0 0 16 16">
        <path d="M12.146.854a.5.5 0 0 1 .708 0l2.292 2.292a.5.5 0 0 1 0 .708l-9.439 9.439-3.182.795a.5.5 0 0 1-.605-.605l.795-3.182L12.146.854z" />
      </svg>
    );
    if (type === "delete") return (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M5.5 5.5A.5.5 0 0 1 6 5h4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0V6H6v6.5a.5.5 0 0 1-1 0v-7z" />
        <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 1 1 0-2H5h6h2.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118z" />
      </svg>
    );
    return null;
  }, []);

  const handleStatusClick = () => {
    setIsActive(prev => {
      const newStatus = !prev;
      handleStatus(item.id, newStatus, index);
      return newStatus;
    });
  }

  return (
    <li className="item-card">
      <div className="item-top">
        <span className="item-name">{item.product.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}</span>
        <span className="item-price">₹ {item.price}</span>
      </div>

      <div className="item-category">{item.category}</div>
      <div className="item-desc">{item.description}</div>
      <em className="item-time">{convertToAmPm(item.open_time)} to {convertToAmPm(item.close_time)}</em>

      <div className="item-actions">
        <button className="edit-btn" onClick={onEdit}><Icon type="edit" /></button>
        <button className="delete-btn" onClick={onDelete}><Icon type="delete" /></button>
        <button className={`status-button ${isActive ? 'active' : ''}`} onClick={handleStatusClick}>
          {isActive ? "Active" : "In-Active"}
        </button>
      </div>

      {item.img && <img src={getImageUrl(item.img)} alt={item.product} className="item-img" />}
    </li>
  );
};

const SubMenuList = ({ submenu, onEdit, onDelete, getImageUrl }) => {
  if (!submenu || submenu.length === 0) return null;

  return (
    <ul className="submenu-list">
      <h5>Available Variants</h5>
      {submenu.map((sub) => (
        <li key={sub.id} className="item-card submenu-item">
          <div className="d-flex justify-content-start" style={{ gap: "10px" }}>
            <span className="item-name">{sub.name}</span>
            <span className="item-price">₹ {sub.price}</span>
          </div>

          {sub.category && <div className="item-category">{sub.category}</div>}
          {sub.description && <div className="item-desc">{sub.description}</div>}

          {sub.img && (
            <img
              src={getImageUrl(sub.img)}
              alt={sub.name}
              className="subMenuImg"
              style={{ maxWidth: "80px", marginTop: "5px" }}
            />
          )}

          <div className="item-actions" style={{ marginTop: "5px" }}>
            <button className="edit-btn" onClick={() => onEdit(sub)}>
              <FiEdit />
            </button>
            <button className="delete-btn" onClick={() => onDelete(sub.product_id, sub.id)}>
              <FiTrash2 />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default Menu;
