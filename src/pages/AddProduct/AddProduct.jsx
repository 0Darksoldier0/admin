import React, { useContext, useEffect, useState } from 'react'
import './AddProduct.css'
import { assets } from '../../assets/assets.js'
import axios from 'axios'
import { toast } from 'react-toastify'
import { BACKEND_URL, MIN_PRICE } from '../../../config/constants.js'
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext.jsx'

const AddProduct = () => {

    const navigate = useNavigate();

    const {token, fetchFoodList, fetchProductPrice} = useContext(StoreContext);

    const [image, setImage] = useState(false);
    const [isAvailable, setIsAvailable] = useState(true);

    const [data, setData] = useState({
        product_name: "",
        price: "",
        description: "",
        category_id: "10",
        availability: 1
    })

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        if (name === "availability") {
            setIsAvailable(event.target.checked);
            setData(data => ({ ...data, [name]: event.target.checked ? 1 : 0 }));
        }
        else if (name === "price") {
            if (/^\d*\.?\d*$/.test(value)) {
                setData(data => ({ ...data, [name]: value }));
            }
        }
        else {
            setData(data => ({ ...data, [name]: value }));
        }
    }


    // for debug
    // useEffect(() => {
    //     console.log(data)
    // }, [data])

    const onAddClickHandler = async (event) => {
        event.preventDefault();
        if (data.product_name.trim() === "" || Number(data.price) < MIN_PRICE || data.description.trim() === "") {
            toast.error("Please enter valid data");
        }

        else {
            const formData = new FormData();
            formData.append("product_name", data.product_name);
            formData.append("price", Number(data.price));
            formData.append("description", data.description);
            formData.append("image", image);
            formData.append("category_id", Number(data.category_id));
            formData.append("availability", data.availability);

            try {
                console.log(token);
                const response = await axios.post(`${BACKEND_URL}/api/product/add`, formData, {headers: {token}});
                if (response.status === 200) {
                    setData({
                        product_name: "",
                        price: "",
                        description: "",
                        category_id: "10",
                        availability: 1
                    });
                    setImage(false);
                    setIsAvailable(true);
                    toast.success(response.data.message)
                    await fetchFoodList(token);
                    await fetchProductPrice(token);
                }
            } catch (error) {
                if (error.response) {
                    toast.error(error.response.data.message);
                }
                else {
                    toast.error("Server error, please try again later");
                }

            }
        }
    }


    return (
        <div className='add-product-container'>
            <h1>Add Product</h1>
            <form className='add-product' onSubmit={onAddClickHandler}>
                <div className="left-section">
                    <p>Upload Image</p>
                    <label htmlFor="image">
                        <img src={image ? URL.createObjectURL(image) : assets.upload_area} alt="" />
                    </label>
                    <input onChange={(event) => setImage(event.target.files[0])} type="file" id='image' hidden required />
                </div>
                <div className='right-section'>
                    <div className="add-product-name right-section">
                        <p>Product Name</p>
                        <input onChange={onChangeHandler} value={data.product_name} type="text" name='product_name' placeholder='e.g. Pho Bo' />
                    </div>
                    <div className="add-category-price right-section">
                        <div className="add-category">
                            <p>Product Category</p>
                            <select onChange={onChangeHandler} name="category_id">
                                <option value="10">Appetizers</option>
                                <option value="11">Main Dishes</option>
                                <option value="12">Drinks</option>
                                <option value="13">Desserts</option>
                            </select>
                        </div>
                        <div className="add-price right-section">
                            <p>Product Price</p>
                            <input onChange={onChangeHandler} value={data.price} type="text" name='price' placeholder='e.g. 10000' />
                        </div>
                    </div>
                    <div className='add-product-description right-section'>
                        <p>Product Description</p>
                        <textarea onChange={onChangeHandler} value={data.description} name="description" rows='3' placeholder='e.g. Rice noodle soup with beef'></textarea>
                    </div>
                    <div className="add-availability">
                        <p>Availability</p>
                        <label className="switch">
                            <input onChange={onChangeHandler} name='availability' type="checkbox" checked={isAvailable} />
                            <span className="slider"></span>
                        </label>
                    </div>
                    <div className='button'>
                        <button className='add-button' type='submit'>ADD</button>
                        <button onClick={() => navigate('/menuManagement')} className='cancel-button' type='button'>RETURN</button>
                    </div>

                </div>
            </form>
        </div>

    )
}

export default AddProduct