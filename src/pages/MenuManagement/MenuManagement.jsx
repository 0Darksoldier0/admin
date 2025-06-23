import React, { useContext, useEffect, useState } from 'react'
import './MenuManagement.css'
import axios from 'axios'
import { BACKEND_URL } from '../../../config/constants.js' // This import is no longer needed for image URLs
import { toast } from 'react-toastify'
import { Link, useNavigate } from 'react-router-dom'
import EditPopup from '../../components/EditPopup/EditPopup.jsx'
import ConfirmPopup from '../../components/ConfirmPopup/ConfirmPopup.jsx'
import { StoreContext } from '../../context/StoreContext.jsx'
import { jwtDecode } from 'jwt-decode'


const MenuManagement = () => {
    const { foodList, fetchFoodList, token } = useContext(StoreContext);
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);

    const [showConfirmPopup, setShowConfirmPopup] = useState(false);

    // State to track the specific product being edited and its new image file
    const [editingImage, setEditingImage] = useState({ productId: null, file: null });

    const navigate = useNavigate();

    const mapCategoryIdToName = (id) => {
        switch (id) {
            case 10: return 'Appertizer';
            case 11: return 'Main Dishes';
            case 12: return 'Drinks';
            case 13: return 'Desserts';
            default: return 'Unknown'; // Added default case
        }
    }

    const removeProduct = async (product_id) => {
        try {
            const response = await axios.post(`${BACKEND_URL}/api/product/remove`, { product_id: product_id }, { headers: { token } });

            if (response.status === 200) {
                toast.success(response.data.message);
                await fetchFoodList(token);
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

    const onClickEditHandler = (product) => {
        setCurrentProduct({ ...product });
        setShowEditPopup(true);
    };

    const closeEditPopupHandler = () => {
        setShowEditPopup(false);
        setCurrentProduct(null);
    };

    const onClickRemoveHandler = (product) => {
        setCurrentProduct({ ...product });
        setShowConfirmPopup(true);
    }

    const closeConfirmPopupHandler = () => {
        setShowConfirmPopup(false);
        setCurrentProduct(null);
    }

    const onUpdateSuccessHandler = async () => {
        await fetchFoodList(token);
    };

    const handleImageChange = (event, productId) => {
        if (event.target.files && event.target.files[0]) {
            setEditingImage({ productId: productId, file: event.target.files[0] });
        }
    };

    const onSaveImageClickHandler = async (item) => {
        if (!editingImage.file) {
            toast.error("Please select an image to save.");
            return;
        }

        const formData = new FormData();
        formData.append("image", editingImage.file);
        // old_image_filename is no longer strictly necessary, as backend fetches old URL from DB
        // formData.append("old_image_filename", item.image); // Remove this line
        formData.append("product_id", item.product_id);

        try {
            const response = await axios.post(`${BACKEND_URL}/api/product/updateimage`, formData, { headers: { token } });

            if (response.status === 200) {
                toast.success(response.data.message);
                await fetchFoodList(token);
                setEditingImage({ productId: null, file: null });
            }
        }
        catch (error) {
            if (error.response.data.message) {
                toast.error(error.response.data.message);
            }
            else {
                toast.error("Server error, please try again later");
            }
        }
    }

    useEffect(() => {
        const decoded = jwtDecode(localStorage.getItem("token"));

        if (decoded.type !== 0) {
            navigate('/onlineOrdersManagement')
        }
    }, [])

    return (
        <div className='menu-list'>
            <div className='top-section'>
                <h1>Menu Items List</h1>
                <div>
                    <Link to='/menuManagement/addProduct'><button>Add Product</button></Link>
                </div>
            </div>
            <div className='list-table'>
                <div className="title">
                    <b></b>
                    <b>Product Code</b>
                    <b>Product Name</b>
                    <b>Category</b>
                    <b>Price</b>
                    <b>Availability</b>
                    <b>Actions</b>
                </div>

                {foodList.map((item, index) => {
                    const isEditingThisItem = editingImage.productId === item.product_id;
                    return (
                        <div className='list-table-format' key={index}>
                            <div>
                                <img
                                    className='image-preview'
                                    // Directly use the 'image' prop as it's now the full GCS URL
                                    src={isEditingThisItem && editingImage.file ? URL.createObjectURL(editingImage.file) : item.image}
                                    alt="Product"
                                />
                                <div className={`image-change ${isEditingThisItem ? 'editing' : ''}`}>
                                    {!isEditingThisItem ? (
                                        <>
                                            <label className='change-cancel' htmlFor={`image-upload-${item.product_id}`}>Change</label>
                                            <input
                                                onChange={(e) => handleImageChange(e, item.product_id)}
                                                type="file"
                                                id={`image-upload-${item.product_id}`}
                                                hidden
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <span className='change-cancel' onClick={() => setEditingImage({ productId: null, file: null })}>Clear</span>
                                            <label onClick={() => onSaveImageClickHandler(item)} className='save'>Save</label>
                                        </>
                                    )}
                                </div>
                            </div>
                            <p>{item.product_id}</p>
                            <p>{item.product_name}</p>
                            <p>{mapCategoryIdToName(item.category_id)}</p>
                            <p>{item.price}</p>
                            <p>{item.availability ? 'Available' : 'Unavailable'}</p>
                            <div className='actions'>
                                <p onClick={() => onClickEditHandler(item)}>edit</p>
                                <p onClick={() => onClickRemoveHandler(item)}>remove</p>
                            </div>
                        </div>
                    )
                })}
            </div>
            {showEditPopup && currentProduct && (
                <EditPopup
                    product={currentProduct}
                    onClose={closeEditPopupHandler}
                    onUpdateSuccess={onUpdateSuccessHandler}
                />
            )}
            
            {showConfirmPopup && currentProduct && (
                <ConfirmPopup
                    id={currentProduct.product_id}
                    onConfirm={removeProduct}
                    onClose={closeConfirmPopupHandler}
                />
            )}
        </div>
    )
}

export default MenuManagement