import React from 'react'
import './ConfirmPopup.css'

const ConfirmPopup = ({id, onConfirm, onClose}) => {

    const onConfirmHandler = async (id) => {
        await onConfirm(id);
        onClose()
    }

    return (
        <div className='confirm-popup-wrapper' onClick={onClose}>
            <div className='confirm-popup' onClick={e => e.stopPropagation()}>
                <h2>Confirm remove? </h2>
                <button className='confirm-btn' onClick={() => onConfirmHandler(id)}>Confirm</button>
                <button className='cancel-btn' onClick={() => onClose()}>Cancel</button>
            </div>
        </div>
    )
} 


export default ConfirmPopup
