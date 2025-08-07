import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BACKEND_URL, MIN_PRICE } from '../../../config/constants.js';
import { toast } from 'react-toastify';
import './EditPopup.css';
import { useContext } from 'react';
import { StoreContext } from '../../context/StoreContext.jsx';

const EditPopup = ({ product, onClose, onUpdateSuccess }) => {
    const { token, fetchProductPrice } = useContext(StoreContext);
    
    const [editedProductData, setEditedProductData] = useState({
        product_id: product.product_id,
        product_name: product.product_name,
        price: product.price,
        description: product.description,
        category_id: product.category_id,
        availability: product.availability
    });

    const [isAvailable, setIsAvailable] = useState(product.availability ? true : false)

    const categories = [
        { category_id: 10, category_name: 'South Korean' },
        { category_id: 11, category_name: 'Japanese' },
        { category_id: 12, category_name: 'Chinese' },
        { category_id: 13, category_name: 'Italian' },
        { category_id: 14, category_name: 'Vietnamese' },
        { category_id: 15, category_name: 'Drink' },
        { category_id: 16, category_name: 'Snack' },
        { category_id: 17, category_name: 'The Usual' }
    ];

    const onChangeHandler = (event) => {
        const { name, value } = event.target;

        if (name === 'availability') {
            setIsAvailable(event.target.checked);
            setEditedProductData(data => ({ ...data, [name]: event.target.checked ? 1 : 0 }));
        }
        else if (name === "price") {
            if (/^\d*\.?\d*$/.test(value)) {
                setEditedProductData(data => ({ ...data, [name]: value }));
            }
        } 
        else {
            setEditedProductData(data => ({...data, [name]: value }));
        }
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        if (editedProductData.product_name.trim() === "" || Number(editedProductData.price) < MIN_PRICE || editedProductData.description === "") {
            toast.error("Please enter valid data");
            return;
        }
        else {
            try {
                const response = await axios.post(`${BACKEND_URL}/api/product/update`, editedProductData, {headers: {token}});
                if (response.status === 200) {
                    onUpdateSuccess();
                    toast.success(response.data.message);
                    await fetchProductPrice(token);
                }
            } 
            catch (error) {
                if (error.response) {
                    toast.error(error.response.data.message);
                }
                else {
                    toast.error("Server error, please try again later");
                }
            }
        }
    };

    useEffect(() => {
        setEditedProductData(editedProductData);
    }, [editedProductData]);

    // useEffect(() => {
    //     console.log(editedProductData)
    // }, [editedProductData])

    return (
        <div className="edit-popup-container" onClick={onClose}>
            <div className="edit-popup" onClick={e => e.stopPropagation()}>
                <h1>Edit Product</h1>
                <p className='close-edit-popup-btn' onClick={onClose}>&times;</p>
                <form onSubmit={onSubmitHandler}>
                    <div className="form-group">
                        <label>Product Name</label>
                        <input type="text" name="product_name" value={editedProductData.product_name || ''} onChange={onChangeHandler} placeholder='e.g. Pho Bo' required />
                    </div>
                    <div className="form-group">
                        <label>Price</label>
                        <input type="text" name="price" value={editedProductData.price || ''} onChange={onChangeHandler} placeholder='e.g. 10000' required />
                    </div>
                    <div className="form-group">
                        <label>Category</label>
                        <select name="category_id" value={editedProductData.category_id || ''} onChange={onChangeHandler} required>
                            <option value="">Select a category</option>
                            {categories.map((category) => (
                                <option key={category.category_id} value={category.category_id}>{category.category_name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea name="description" value={editedProductData.description || ''} onChange={onChangeHandler} rows="4"></textarea>
                    </div>
                    <div className="add-availability">
                        <p>Availability</p>
                        <label className="switch1">
                            <input onChange={onChangeHandler} name='availability' type="checkbox" checked={isAvailable} />
                            <span className="slider1"></span>
                        </label>
                    </div>
                    <div className='buttons'>
                        <button className='save-change-btn' type="submit">Save Changes</button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default EditPopup;