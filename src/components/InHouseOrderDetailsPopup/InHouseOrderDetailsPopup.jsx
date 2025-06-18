import React from 'react'
import './InHouseOrderDetailsPopup.css'
import axios from 'axios';
import { useState } from 'react';
import { useEffect } from 'react';
import { BACKEND_URL } from '../../../config/constants';
import { toast } from 'react-toastify'


const InHouseOrderDetailsPopup = ({ order, token, onClose }) => {

    const [orderDetails, setOrderDetails] = useState([]);

    const getOnlineOrderDetails = async () => {
        try {
            console.log(order.order_id);
            const response = await axios.post(`${BACKEND_URL}/api/inhouseorder/getDetails`, { order_id: order.order_id }, { headers: { token } })
            if (response.status === 200) {
                setOrderDetails(response.data.order_details);
                console.log(response.data.order_details)
            }
            
        }
        catch (error) {
            console.log(error)
        }
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
                    <div className="order-summary-section">
                        <h2>Order Summary</h2>
                        <div className="order-items">
                            {orderDetails.map((item, index) => (
                                item.served_quantity > 0 
                                ?<div key={index} className="order-item">
                                    <p>{item.product_name} x {item.served_quantity}</p>
                                    <p>{item.quantity * item.price} vnd</p>
                                </div>
                                :<></>
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

export default InHouseOrderDetailsPopup
