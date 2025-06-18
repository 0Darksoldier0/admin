import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar'
import ScrollToTop from './context/ScrollToTop'
import SignIn from './pages/SignIn/SignIn'
import AddProduct from './pages/AddProduct/AddProduct'
import MenuManagement from './pages/MenuManagement/MenuManagement'
import InHouseOrdersManagement from './pages/InHouseOrdersManagement/InHouseOrdersManagement'
import OnlineOrdersManagement from './pages/OnlineOrdersManagement/OnlineOrdersManagement'
import Dashboard from './pages/Dashboard/Dashboard'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/ReactToastify.css'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import DefaultRoute from './components/DefaultRoute/DefaultRoute'
import StaffManagement from './pages/StaffManagement/StaffManagement'
import AddStaff from './pages/AddStaff/AddStaff'

const App = () => {

    return (
        <div className='app'>
            <ToastContainer />
            <ScrollToTop />
            <Navbar />
            <Routes>
                <Route path='/signIn' element={<SignIn />} />
                <Route path='/' element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path='/menuManagement' element={<ProtectedRoute><MenuManagement /></ProtectedRoute>} />
                <Route path='/menuManagement/addProduct' element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
                <Route path='/onlineOrdersManagement' element={<ProtectedRoute><OnlineOrdersManagement /></ProtectedRoute>} />
                <Route path='/ordersManagement' element={<ProtectedRoute><InHouseOrdersManagement /></ProtectedRoute>} />
                <Route path='/staffManagement' element={<ProtectedRoute><StaffManagement /></ProtectedRoute>} />
                <Route path='/staffManagement/addStaff' element={<ProtectedRoute><AddStaff /></ProtectedRoute>} />

                <Route path="*" element={<DefaultRoute></DefaultRoute>} />
            </Routes>

        </div>
    )
}

export default App
