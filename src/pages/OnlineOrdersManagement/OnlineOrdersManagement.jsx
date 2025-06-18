import React from 'react'
import './OnlineOrdersManagement.css'
import { useContext } from 'react'
import { StoreContext } from '../../context/StoreContext'
import { assets } from '../../assets/assets'
import { useState } from 'react'
import OnlineOrderDetailsPopup from '../../components/OnlineOrderDetailsPopup/OnlineOrderDetailsPopup'
import axios from "axios";
import { BACKEND_URL } from '../../../config/constants'
import { toast } from 'react-toastify'

const OnlineOrdersManagement = () => {

    const { token, onlineOrdersData, fetchOnlineOrders } = useContext(StoreContext);
    const [showOrderDetailsPopup, setShowOrderDetailsPopup] = useState(false);
    const [currentOrder, setCurrentOrder] = useState(null);

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');


    const onSelectStatusHandler = async (event, order_id) => {
        const currentStatus = event.target.value;
        try {
            const response = await axios.post(`${BACKEND_URL}/api/order/updateStatus`, { status: currentStatus, order_id: order_id }, { headers: { token } });
            if (response.status === 200) {
                if (currentStatus === "delivered") {
                    await fetchOnlineOrders(token);
                }
                toast.success(response.data.message);
            }
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

    const onOrderIdClickHandler = (order) => {
        setCurrentOrder({ ...order });
        setShowOrderDetailsPopup(true);
    };

    const closePopupHandler = () => {
        setCurrentOrder(null);
        setShowOrderDetailsPopup(false);
    };

    const filteredOrders = onlineOrdersData.filter(order => {
        const orderDate = new Date(order.order_date);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        return order.status === "delivered" &&
            (!start || orderDate >= start) &&
            (!end || orderDate <= end);
    });

    return (
        <div className='orders'>

            <h1>All Online Orders</h1>

            <h2>New Orders</h2>
            <div className='list-table2'>
                <div className='title2'>
                    <p></p>
                    <p>OrderID</p>
                    <p>Order Date</p>
                    <p>Order Status</p>
                </div>
                {onlineOrdersData.map((order, index) => {
                    if (order.status !== "delivered") {
                        return (
                            <div key={index} className='list-table-format2'>
                                <img src={assets.parcel_icon} alt="" />
                                <p onClick={() => onOrderIdClickHandler(order)} className='order-id'>{order.order_id}</p>
                                <p>{order.order_date.replace('T', ' ').replace('.000Z', '')}</p>
                                <select onChange={(event) => onSelectStatusHandler(event, order.order_id)} value={order.status} className='order-status'>
                                    <option value="preparing">Preparing</option>
                                    <option value="out for delivery">Out For Delivery</option>
                                    <option value="delivered">Delivered</option>
                                </select>
                            </div>
                        )
                    }
                })}
            </div>
            <br /><br /><br />
            <h2>Completed Orders</h2>
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
                        <div key={index} className='list-table-format2'>
                            <img src={assets.parcel_icon} alt="" />
                            <p onClick={() => onOrderIdClickHandler(order)} className='order-id'>{order.order_id}</p>
                            <p>{order.order_date.replace('T', ' ').replace('.000Z', '')}</p>
                            <p>{order.status}</p>
                        </div>
                    )
                })}
            </div>
            {showOrderDetailsPopup && currentOrder && (
                <OnlineOrderDetailsPopup
                    order={currentOrder}
                    onClose={closePopupHandler}
                    token={token}
                />
            )}
        </div>
    )
}

export default OnlineOrdersManagement