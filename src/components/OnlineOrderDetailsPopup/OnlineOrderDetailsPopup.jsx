import React from 'react'
import './OnlineOrderDetailsPopup.css'
import { BACKEND_URL } from '../../../config/constants';
import axios from 'axios';
import { useState } from 'react';
import { useEffect } from 'react';

const OnlineOrderDetailsPopup = ({ order, token, onClose }) => {
    // console.log(order);
    const [orderDetails, setOrderDetails] = useState([]);

    const getOnlineOrderDetails = async () => {
        const response = await axios.post(`${BACKEND_URL}/api/order/getOrderDetails`, { order_id: order.order_id }, { headers: { token } })
        setOrderDetails(response.data.orderDetails);
    }
    
    useEffect(() => {
        if (token) {
            getOnlineOrderDetails();
        }
        // console.log(orderDetails);
    }, [])

    return (
        <div className='order-details-container' onClick={onClose}>
            <div className="order-details-content" onClick={e => e.stopPropagation()}>
                <p className="close-button" onClick={onClose}>&times;</p>
                <h1>Order Details</h1>
                <div className="order-details-sections">
                    <div className='customer-details-section'>
                        <h2>Customer Details</h2>
                        <div className="customer-details-grid">
                            <div className='field-group'>
                                <label>Customer Name:</label>
                                <p>{order.shipping_details.firstName} {order.shipping_details.lastName}</p>
                            </div>
                            <div className="field-group">
                                <label>Address:</label>
                                <p>{order.shipping_details.street}, {order.shipping_details.ward}, {order.shipping_details.district}, {order.shipping_details.city}</p>
                            </div>
                            <div className="field-group">
                                <label>Phone Number:</label>
                                <p>{order.shipping_details.phone_number}</p>
                            </div>
                            <div className="field-group">
                                <label>Email:</label>
                                <p>{order.shipping_details.email}</p>
                            </div>
                        </div>
                    </div>

                    <div className="order-summary-section">
                        <h2>Order Summary</h2>
                        <div className="order-items">
                            {orderDetails.map((item, index) => (
                                <div key={index} className="order-item">
                                    <p>{item.product_name} x {item.product_quantity}</p>
                                    <p>{item.total} vnd</p>
                                </div>
                            ))}
                        </div>
                        <div className="field-group subtotal">
                            <label>Subtotal</label>
                            <p>{order.subtotal} vnd</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default OnlineOrderDetailsPopup
