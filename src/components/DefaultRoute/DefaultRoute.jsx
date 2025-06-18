import React from 'react'
import { Navigate } from 'react-router-dom';

const DefaultRoute = ({children}) => {
    const token = localStorage.getItem('token');

    if (token) {
        return <Navigate to="/" replace />;
    }
    else {
        return <Navigate to="/signIn" replace />;
    }

    return children;
}

export default DefaultRoute
