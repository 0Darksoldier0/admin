import React, { useState, useEffect, useContext } from 'react'
import './StaffEditPopup.css'
import { StoreContext } from '../../context/StoreContext';
import { BACKEND_URL } from '../../../config/constants';
import axios from 'axios';
import { toast } from 'react-toastify';

const StaffEditPopup = ({ staff, onClose, onUpdateSuccess }) => {

    const { token } = useContext(StoreContext);

    const [editedStaffData, setEditedStaffData] = useState({
        username: staff.username,
        first_name: staff.first_name,
        last_name: staff.last_name,
        phone_number: staff.phone_number,
    });

    const [passwordData, setPasswordData] = useState({
        username: staff.username,
        old_password: "",
        new_password: "",
        retype_new_password: "",
    })

    const onChangeHandler = (event) => {
        const { name, value } = event.target;

        if (name === "phone_number") {
            if (/^\d*\.?\d*$/.test(value)) {
                setEditedStaffData(data => ({ ...data, [name]: value }));
            }
        }
        else if (name === "old_password" || name === "new_password" || name === "retype_new_password") {
            const cleanedValue = value.replace(/\s/g, '');
            setPasswordData(prevData => ({ ...prevData, [name]: cleanedValue }));
        }
        else {
            setEditedStaffData(data => ({ ...data, [name]: value }));
        }
    };

    const onSaveDataHandler = async (event) => {
        event.preventDefault();
        if (editedStaffData.first_name.trim() === "" || editedStaffData.last_name.trim() === "" || editedStaffData.phone_number === "") {
            toast.error("Please enter valid data");
            return;
        }
        else {
            try {
                const response = await axios.post(`${BACKEND_URL}/api/user/updateStaffData`, editedStaffData, { headers: { token } });
                if (response.status === 200) {
                    onUpdateSuccess();
                    toast.success(response.data.message);
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

    const onSavePasswordHandler = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post(`${BACKEND_URL}/api/user/updateStaffPassword`, passwordData, { headers: { token } });
            if (response.status === 200) {
                setPasswordData({
                    username: staff.username,
                    old_password: "",
                    new_password: "",
                    retype_new_password: "",
                });
                toast.success("Password updated");
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


    useEffect(() => {
        setEditedStaffData(editedStaffData);
    }, [editedStaffData]);

    return (
        <div className='account-container' onClick={onClose}>
            <div className='account' onClick={e => e.stopPropagation()}>
                <h1>Account Settings</h1>
                <p className="close-btn" onClick={onClose}>&times;</p>
                <div className='account-wrapper'>
                    <form className='data-password-section' onSubmit={onSaveDataHandler}>
                        <h2>Staff Data</h2>
                        <div className='data-password-middle-section'>
                            <div className='sub-group'>
                                <h3>Username</h3>
                                <p className='username'>{editedStaffData.username}</p>
                            </div>
                            <div className='sub-group'>
                                <h3>First Name</h3>
                                <input name='first_name' onChange={onChangeHandler} value={editedStaffData.first_name} type="text" required />
                            </div>
                            <div className='sub-group'>
                                <h3>Last Name</h3>
                                <input name='last_name' onChange={onChangeHandler} value={editedStaffData.last_name} type="text" required />
                            </div>
                            <div className='sub-group'>
                                <h3>Phone Number</h3>
                                <input name='phone_number' onChange={onChangeHandler} value={editedStaffData.phone_number} type="text" required />
                            </div>
                        </div>
                        <button type='submit'>Save Data</button>
                    </form>

                    <form className='data-password-section' onSubmit={onSavePasswordHandler}>
                        <h2>Password</h2>
                        <div className='data-password-middle-section'>
                            <div className='sub-group'>
                                <h3>Old password</h3>
                                <input name='old_password' onChange={onChangeHandler} value={passwordData.old_password} type="password" required />
                            </div>
                            <div className='sub-group'>
                                <h3>New password</h3>
                                <input name='new_password' onChange={onChangeHandler} value={passwordData.new_password} type="password" required />
                            </div>
                            <div className='sub-group'>
                                <h3>Re-enter new password</h3>
                                <input name='retype_new_password' onChange={onChangeHandler} value={passwordData.retype_new_password} type="password" required />
                            </div>
                        </div>
                        <button type='submit'>Save Password</button>

                    </form>
                </div>
            </div>
        </div>
    )
}

export default StaffEditPopup
