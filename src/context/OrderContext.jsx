import { createContext, useContext, useState } from "react";

const OrderContext = createContext();

export function OrderProvider({ children }) {
    const [orders, setOrders] = useState([]);
    const [newOrders, setNewOrders] = useState([]);
    const [autoAcceptedOrder, setAutoAcceptedOrder] = useState(null);

    return (
        <OrderContext.Provider
            value={{
                orders,
                setOrders,
                newOrders,
                setNewOrders,
                autoAcceptedOrder,
                setAutoAcceptedOrder
            }}
        >
            {children}
        </OrderContext.Provider>
    );
}

export function useOrders() {
    return useContext(OrderContext);
}
