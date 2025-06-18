import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { BACKEND_URL } from "../../config/constants";
import { useLocation } from "react-router-dom";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {

    const location = useLocation();

    const [menu, setMenu] = useState(() => {
        const savedMenu = localStorage.getItem("currentMenu");
        return savedMenu ? savedMenu : "Dashboard";
    });

    const [token, setToken] = useState("");
    const [foodList, setFoodList] = useState([]);
    const [onlineOrdersData, setOnlineOrdersData] = useState([]);
    const [inHouseOrdersData, setInHouseOrderData] = useState([]);
    const [staffList, setStaffList] = useState([]);
    
    // Data visulization
    const [priceData, setPriceData] = useState([]);

    
    const fetchFoodList = async (token) => {
        try {
            const response = await axios.post(`${BACKEND_URL}/api/product/listall`, {}, { headers: { token } });

            if (response.status == 200) {
                setFoodList(response.data.products);
            }
        }
        catch (error) {
            if (error.response) {
                console.error("(FetchFoodList-StoreContext) ", error.response.data.message);
            }
            else {
                console.error("(FetchFoodList) Server error")
            } 
        }
    }

    const fetchOnlineOrders = async (token) => {
        try {
            const response = await axios.post(`${BACKEND_URL}/api/order/list`, {}, { headers: { token } });
            if (response.status === 200) {
                setOnlineOrdersData(response.data.orders);
                // console.log(response.data.orders);
            }
        }
        catch (error) {
            if (error.response) {
                console.error("(FetchOrders) " + error.response.data.message);
            }
            else {
                console.error("(FetchOrders) Server error");
            }
        }
    }

    const fetchInhouseOrders = async (token) => {
        try {
            const response = await axios.post(`${BACKEND_URL}/api/inhouseorder/list`, {}, { headers: { token } });
            
            if (response.status === 200) {
                setInHouseOrderData(response.data.orders);
                // console.log(response.data.orders)
            }
        }
        catch (error) {
            error.response ? console.error(error.response.data.message) : console.error("Server error");
        }
    }

    const fetchUsers = async (token) => {
        try {
            const response = await axios.post(`${BACKEND_URL}/api/user/list`, {}, {headers: { token }});
            if (response.status === 200) {
                setStaffList(response.data.users);
                // console.log(response.data.users);
            }
        }
        catch (error) {
            if (error.response) {
                console.error("(FetchUsers) " + error.response.data.message);
            }
            else {
                console.error("(FetchUsers) Server error");
            }
        }
    }

    const fetchProductPrice = async (token) => {
        try {
            const response = await axios.post(`${BACKEND_URL}/api/product/getprice`, {}, {headers: {token}})
            if (response.status === 200) {
                setPriceData(response.data.data);
                // console.log(response.data.data);
            }
        }
        catch (error) {
            if (error.response) {
                console.error("(FetchProductPrice) ", error.response.data.message)
            }
            else {
                console.error("(FetchProductPrice) Server error")
            }
        }
    }

    useEffect(() => {
        async function loadData() {
            if (localStorage.getItem("token")) {
                setToken(localStorage.getItem("token"));
                await fetchFoodList(localStorage.getItem("token"));
                await fetchOnlineOrders(localStorage.getItem("token"))
                await fetchProductPrice(localStorage.getItem("token"))
                await fetchUsers(localStorage.getItem("token"));
                await fetchInhouseOrders(localStorage.getItem("token"));
            }
        }
        loadData();

        const intervalId = setInterval(async () => {
            const currentToken = localStorage.getItem("token"); // Get the latest token
            if (currentToken) {
                await fetchOnlineOrders(currentToken);
                await fetchInhouseOrders(currentToken);
            }
        }, 5000);

        return () => clearInterval(intervalId);
    }, [])

    useEffect(() => {
        localStorage.setItem("currentMenu", menu);
    }, [menu]);

    useEffect(() => {
        const path = location.pathname;
        let newMenu = "Dashboard";

        if (path === '/') {
            newMenu = "Dashboard";
        }
        else if (path === '/menuManagement' || path === "/menuManagement/addProduct") {
            newMenu = "Manage Menu";
        }
        else if (path === '/ordersManagement') {
            newMenu = "Manage Orders";
        }
        else if (path === '/onlineOrdersManagement') {
            newMenu = "Manage Online Orders";
        }
        else if (path === '/staffManagement') {
            newMenu = "Manage Staff"
        }
        else {
            newMenu = "";
        }

        if (newMenu !== menu) {
            setMenu(newMenu);
        }
    }, [location.pathname]);

    const contextValue = {
        menu,
        setMenu,
        token,
        setToken,

        foodList,
        fetchFoodList,
        onlineOrdersData,
        fetchOnlineOrders,

        inHouseOrdersData,
        fetchInhouseOrders,

        priceData,
        fetchProductPrice,

        staffList,
        fetchUsers
    }

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    )
}

export default StoreContextProvider