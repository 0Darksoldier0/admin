import React, { useContext, useEffect, useState } from 'react';
import './InHouseOrdersManagement.css';
import { StoreContext } from '../../context/StoreContext';
import { assets } from '../../assets/assets';
import { BACKEND_URL } from '../../../config/constants';
import axios from 'axios';
import { toast } from 'react-toastify';
import InHouseOrderDetailsPopup from '../../components/InHouseOrderDetailsPopup/InHouseOrderDetailsPopup';
import ConfirmPaymentPopup from '../../components/ConfirmPaymentPopup/ConfirmPaymentPopup';

const OrdersManagement = () => {
    const { token, inHouseOrdersData, fetchInhouseOrders } = useContext(StoreContext);
    const [orderDetailsMap, setOrderDetailsMap] = useState({});
    const [showServedItems, setShowServedItems] = useState({});
    const [showConfirmPaymentPopup, setShowConfirmPopup] = useState(false);
    const [showOrderDetailsPopup, setShowOrderDetailsPopup] = useState(false);
    const [currentOrder, setCurrentOrder] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const getInHouseOrderDetails = async (order_id) => {
        try {
            const response = await axios.post(`${BACKEND_URL}/api/inhouseorder/getDetails`, { order_id: order_id }, { headers: { token } });
            // Add a 'status' property to each item based on its state for the dropdown
            const processedDetails = response.data.order_details.map(item => {
                let status = "preparing"; // Default status for items to prepare
                if (item.served_quantity === item.quantity) {
                    status = "complete"; // All quantity served
                } else if (item.served_quantity > 0 && item.served_quantity < item.quantity) {
                    // If partially served, still 'preparing' or 'partially_served' - let's stick to 'preparing' for simplicity for dropdown
                    status = "preparing";
                }
                // If a 'cancel' status existed for the item, you'd need to fetch that from backend too
                // For now, assume "preparing" is the initial state for the dropdown for items not fully served
                return { ...item, status };
            });
            return processedDetails;
        }
        catch (error) {
            error.response ? toast.error(error.response.data.message) : toast.error("Server error");
            return [];
        }
    };

    useEffect(() => {
        const fetchAllOrderDetails = async () => {
            const newOrderDetailsMap = {};
            for (const order of inHouseOrdersData) {
                if (order.payment === 0) {
                    const details = await getInHouseOrderDetails(order.order_id);
                    newOrderDetailsMap[order.order_id] = details;
                }
            }
            setOrderDetailsMap(newOrderDetailsMap);
        };

        if (inHouseOrdersData.length > 0 && token) {
            fetchAllOrderDetails();
        }
    }, [inHouseOrdersData, token]);


    const onSelectStatusHandler = async (event, order_id, product_id, quantity, served_quantity) => {
        const currentStatus = event.target.value;
        try {
            if (currentStatus === "complete") {
                const response = await axios.post(`${BACKEND_URL}/api/inhouseorder/updateServedQuantity`, { order_id, product_id, quantity }, { headers: { token } })

                if (response.status === 200) {
                    toast.success(response.data.message);
                    const updatedDetails = await getInHouseOrderDetails(order_id);
                    setOrderDetailsMap(prevMap => ({
                        ...prevMap,
                        [order_id]: updatedDetails
                    }));
                }
            }
            if (currentStatus === "cancel") {
                const response = await axios.post(`${BACKEND_URL}/api/inhouseorder/updateQuantity`, { order_id, product_id, served_quantity }, { headers: { token } })

                if (response.status === 200) {
                    toast.success(response.data.message);
                    const updatedDetails = await getInHouseOrderDetails(order_id);
                    setOrderDetailsMap(prevMap => ({
                        ...prevMap,
                        [order_id]: updatedDetails
                    }));
                }
            }
            // Update the local state for the specific item's status immediately
            // This is important for controlling the select element's value
            setOrderDetailsMap(prevMap => {
                const updatedOrderDetails = [...(prevMap[order_id] || [])];
                const itemIndex = updatedOrderDetails.findIndex(item => item.product_id === product_id);
                if (itemIndex > -1) {
                    updatedOrderDetails[itemIndex] = { ...updatedOrderDetails[itemIndex], status: currentStatus };
                }
                return {
                    ...prevMap,
                    [order_id]: updatedOrderDetails
                };
            });


        }
        catch (error) {
            if (error.response) {
                toast.error(error.response.data.message);
            }
            else {
                toast.error("Server error, please try again");
            }
        }
    }


    const toggleServedItemsVisibility = (orderId) => {
        setShowServedItems(prevState => ({
            ...prevState,
            [orderId]: !prevState[orderId]
        }));
    };

    const onOrderIdClickHandler = (order) => {
        setCurrentOrder({ ...order });
        setShowOrderDetailsPopup(true);
    };

    const closePopupHandler = () => {
        setCurrentOrder(null);
        setShowOrderDetailsPopup(false);
    };

    const filteredOrders = inHouseOrdersData.filter(order => {
        const orderDate = new Date(order.order_date);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        return order.payment === 1 &&
            (!start || orderDate >= start) &&
            (!end || orderDate <= end);
    });

    const conFirmPaymentCLickHandler = (items, order) => {
        if (items.length > 0) {
            toast.error("Order not fullfilled")
            return;
        }
        else {
            setShowConfirmPopup(true);
            setCurrentOrder(order);
        }
    }

    const onConfirmHandler = async () => {
        try {
            if (!currentOrder) {
                toast.error("No order selected for payment confirmation.");
                return;
            }

            // First API Request: Free up the seat (update table status)
            const updateTableResponse = await axios.post(
                `${BACKEND_URL}/api/inhouseorder/updateTableStatus`,
                { seat_id: currentOrder.seat_id, availability: 1 },
                { headers: { token } }
            );

            if (updateTableResponse.status === 200) {
                toast.success("Table status updated!");

                // Second API Request: Set order payment status
                // Ensure you have an /api/inhouseorder/updatePayment endpoint
                const updatePaymentResponse = await axios.post(
                    `${BACKEND_URL}/api/inhouseorder/updatePayment`,
                    { order_id: currentOrder.order_id },
                    { headers: { token } }
                );

                if (updatePaymentResponse.status === 200) {
                    toast.success("Payment confirmed!");
                    if (fetchInhouseOrders) {
                        await fetchInhouseOrders(token); // Re-fetch all in-house orders
                    }
                    setCurrentOrder(null); // Clear current order after successful payment
                } else {
                    toast.error("Failed to update payment status.");
                }
            } else {
                toast.error("Failed to update table status.");
            }
        } catch (error) {
            console.error("Error during payment confirmation:", error);
            if (error.response) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Server error during payment confirmation.");
            }
        } finally {
            closeConfirmPopupHandler();
        }
    }

    const closeConfirmPopupHandler = () => {
        setShowConfirmPopup(false);
    }

    return (
        <div className='in-house-order'>
            <h1 className='new-order-h1'>New Orders</h1>
            <div className='list-table3'>
                {inHouseOrdersData.map((order, index) => {
                    if (order.payment === 0) {
                        const currentOrderDetails = orderDetailsMap[order.order_id] || [];
                        const itemsToPrepare = currentOrderDetails.filter(item => item.quantity !== item.served_quantity);
                        const servedItems = currentOrderDetails.filter(item => item.served_quantity !== 0);

                        return (
                            <div key={order.order_id} className='order-card'> {/* Changed key to order.order_id for stability */}
                                <div className='headings'>
                                    <h2>Table {order.seat_id}</h2>
                                    <button onClick={() => conFirmPaymentCLickHandler(itemsToPrepare, order)} className='confirm-payment-btn'>Confirm Payment</button>
                                </div>

                                {/* Items to prepare (quantity - served_quantity) */}
                                {itemsToPrepare.length > 0 ? (
                                    itemsToPrepare.map((item, itemIndex) => (
                                        <div key={`${order.order_id}-${item.product_id}`} className='list-table-format3'> {/* More stable key */}
                                            <p>Product ID: {item.product_id}</p>
                                            <p>{item.product_name}</p>
                                            <p>Quantity: {item.quantity - item.served_quantity}</p>
                                            <select
                                                className='order-status'
                                                value={item.status || "preparing"} // Controlled component: set value from state/item
                                                onChange={(event) => onSelectStatusHandler(event, item.order_id, item.product_id, item.quantity, item.served_quantity)}
                                            >
                                                <option value="preparing">Preparing</option>
                                                <option value="complete">Complete</option>
                                                <option value="cancel">Cancel</option>
                                            </select>
                                        </div>
                                    ))
                                ) : (
                                    <p>All items have been prepared</p>
                                )}
                                <br />
                                {/* "Show" button to toggle served items */}
                                {servedItems.length > 0 && (
                                    <button onClick={() => toggleServedItemsVisibility(order.order_id)} className='show-btn'>
                                        {showServedItems[order.order_id] ? 'Hide Served Items' : 'Show Served Items'}
                                    </button>
                                )}


                                {/* Served items (served_quantity) - conditionally rendered */}
                                {showServedItems[order.order_id] && servedItems.length > 0 && (
                                    <div>
                                        <h3>Served Items:</h3>
                                        {servedItems.map((item, itemIndex) => (
                                            <div key={`served-${order.order_id}-${item.product_id}`} className='list-table-format3'> {/* More stable key */}
                                                <p>Product ID: {item.product_id}</p>
                                                <p>Product Name: {item.product_name}</p>
                                                <p>Quantity: {item.served_quantity}</p>
                                                <p>Served</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    }
                    return null;
                })}
            </div>
            <br /><br /><br /><hr /><br /><br />
            <h1>Completed Orders</h1>
            <div className="date-range-selector">
                <label htmlFor="startDate">Start Date:</label>
                <input
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />
                <label htmlFor="endDate">End Date:</label>
                <input
                    type="date"
                    id="endDate"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                />
            </div>
            <div className='list-table2'>
                {filteredOrders.map((order, index) => {
                    return (
                        <div key={index} className='list-table-format3'>
                            <img src={assets.parcel_icon} alt="" />
                            <p onClick={() => onOrderIdClickHandler(order)} className='order-id'>{order.order_id}</p>
                            <p>{order.order_date.replace('T', ' ').replace('.000Z', '')}</p>
                            <p>Complete and Paid</p>
                        </div>
                    )
                })}
            </div>
            {showOrderDetailsPopup && currentOrder && (
                <InHouseOrderDetailsPopup
                    order={currentOrder}
                    onClose={closePopupHandler}
                    token={token}
                />
            )}
            {showConfirmPaymentPopup && (
                <ConfirmPaymentPopup
                    onConfirm={onConfirmHandler}
                    onClose={closeConfirmPopupHandler}
                />
            )}
        </div>
    );
};

export default OrdersManagement;