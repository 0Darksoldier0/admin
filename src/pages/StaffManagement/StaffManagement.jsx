import React from 'react'
import './StaffManagement.css'
import ConfirmPopup from '../../components/ConfirmPopup/ConfirmPopup'
import StaffEditPopup from '../../components/StaffEditPopup/StaffEditPopup'
import axios from 'axios'
import { BACKEND_URL } from '../../../config/constants'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'
import { StoreContext } from '../../context/StoreContext'
import { useContext } from 'react'
import { useState } from 'react'

const StaffManagement = () => {

    const { staffList, fetchUsers, token } = useContext(StoreContext)
    const [showStaffEditPopup, setStaffShowEditPopup] = useState(false);
    const [currentStaff, setCurrentStaff] = useState(null);

    const [showConfirmPopup, setShowConfirmPopup] = useState(false);

    const removeStaff = async (username) => {
        try {
            const response = await axios.post(`${BACKEND_URL}/api/user/remove`, { username: username }, { headers: { token } });

            if (response.status === 200) {
                toast.success(response.data.message);
                await fetchUsers(token);
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

    const onClickEditHandler = (staff) => {
        setCurrentStaff({ ...staff });
        setStaffShowEditPopup(true);
    };

    const closeEditPopupHandler = () => {
        setStaffShowEditPopup(false);
        setCurrentStaff(null);
    };

    const onClickRemoveHandler = (staff) => {
        setCurrentStaff({ ...staff });
        setShowConfirmPopup(true);
    }

    const closeConfirmPopupHandler = () => {
        setShowConfirmPopup(false);
        setCurrentStaff(null);
    }

    const onUpdateSuccessHandler = async () => {
        await fetchUsers(token);
    };

    return (
        <div className='staff-list'>
            <div className='top-section1'>
                <h1>Staff Information</h1>
                <Link to='/staffManagement/addStaff'><button>Add Account</button></Link>
            </div>
            <div className='list-table1'>
                <div className="title1">
                    <b>Username</b>
                    <b>First Name</b>
                    <b>Last Name</b>
                    <b>Phone Number</b>
                    <b>Actions</b>
                </div>

                {staffList.map((staff, index) => {
                    return (
                        <div className='list-table-format1' key={index}>
                            <p>{staff.username}</p>
                            <p>{staff.first_name}</p>
                            <p>{staff.last_name}</p>
                            <p>{staff.phone_number}</p>
                            <div className='actions1'>
                                <p onClick={() => onClickEditHandler(staff)}>edit</p>
                                <p onClick={() => onClickRemoveHandler(staff)}>remove</p>
                            </div>
                        </div>
                    )
                })}
            </div>
            {showStaffEditPopup && currentStaff && (
                <StaffEditPopup
                    staff={currentStaff}
                    onClose={closeEditPopupHandler}
                    onUpdateSuccess={onUpdateSuccessHandler}
                />
            )}

            {showConfirmPopup && currentStaff && (
                <ConfirmPopup
                    id={currentStaff.username}
                    onConfirm={removeStaff}
                    onClose={closeConfirmPopupHandler}
                />
            )}
        </div>
    )
}

export default StaffManagement
