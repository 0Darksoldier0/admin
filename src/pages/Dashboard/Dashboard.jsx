import React, { useState, useEffect } from 'react'
import './Dashboard.css'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2'
import { useContext } from 'react'
import { StoreContext } from '../../context/StoreContext'
import { BACKEND_URL } from '../../../config/constants';
import axios from 'axios';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    PointElement,
    LineElement,
);

const Dashboard = () => {

    const { priceData, productPurchaseQuantityData, productHistoryData,
        todayRevenueData, totalRevenueData, token } = useContext(StoreContext);

     const [productPriceHistoryData, setProductPriceHistoryData] = useState([]);
    const [selectedProductId, setSelectedProductId] = useState('');

    useEffect(() => {
        if (selectedProductId && token) {
            fetProductPriceHistory(token, selectedProductId);
        } else if (productHistoryData.length > 0 && !selectedProductId) {
            // Automatically select the first product if none is selected initially
            setSelectedProductId(productHistoryData[0].product_id);
        }
    }, [selectedProductId, token, productHistoryData]);

    const fetProductPriceHistory = async (token, product_id) => {
        try {
            const response = await axios.post(`${BACKEND_URL}/api/analytics/getProductPriceHistory`, { product_id: product_id }, { headers: { token } })
            if (response.status === 200) {
                setProductPriceHistoryData(response.data.data);
                console.log("Fetched Price History: ", response.data.data);
            }
        }
        catch (error) {
            if (error.response) {
                console.error("(FetchProductFromPriceHistory) ", error.response.data.message)
            }
            else {
                console.error("(FetchProductFromPriceHistory) Server error")
            }
        }
    }

    const categoryColors = {
        10: 'rgba(255, 99, 132, 0.6)',
        11: 'rgba(54, 162, 235, 0.6)',
        12: 'rgba(255, 206, 86, 0.6)',
        13: 'rgba(75, 192, 192, 0.6)',
    };

    // Prepare data for the Product Price Bar chart
    const labelsPrice = priceData.map(item => item.product_name);
    const dataValuesPrice = priceData.map(item => item.price);
    const backgroundColorsPrice = priceData.map(item => categoryColors[item.category_id] || 'rgba(199, 199, 199, 0.6)');
    const borderColorsPrice = backgroundColorsPrice.map(color => color.replace('0.6', '1'));

    const chartDataPrice = {
        labels: labelsPrice,
        datasets: [
            {
                label: 'Product Price',
                data: dataValuesPrice,
                backgroundColor: backgroundColorsPrice,
                borderColor: borderColorsPrice,
                borderWidth: 1,
            },
        ],
    };

    // Chart options for Product Price chart
    const chartOptionsPrice = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: 'Product Prices by Category',
                font: {
                    size: 20,
                    weight: 'bold'
                },
                padding: {
                    top: 10,
                    bottom: 20
                }
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const productName = context.label;
                        const price = context.parsed.y;
                        const categoryId = priceData[context.dataIndex].category_id;
                        if (price !== null) {
                            return `${productName} (Category ${categoryId}): ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'VND' }).format(price)}`;
                        }
                        return '';
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Price (VND)',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                ticks: {
                    callback: function (value) {
                        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);
                    }
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Product Name',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                ticks: {
                    maxRotation: 90,
                    minRotation: 90,
                    autoSkip: false,
                    font: {
                        size: 12
                    }
                },
                offset: true,
            }
        }
    };


    // --- Code for productPurchaseQuantityData ---
    const labelsQuantity = productPurchaseQuantityData.map(item => item.product_name);
    const dataValuesQuantity = productPurchaseQuantityData.map(item => parseInt(item.quantity));
    const backgroundColorsQuantity = productPurchaseQuantityData.map(item => categoryColors[item.category_id] || 'rgba(199, 199, 199, 0.6)');
    const borderColorsQuantity = backgroundColorsQuantity.map(color => color.replace('0.6', '1'));

    const chartDataQuantity = {
        labels: labelsQuantity,
        datasets: [
            {
                label: 'Purchase Quantity',
                data: dataValuesQuantity,
                backgroundColor: backgroundColorsQuantity,
                borderColor: borderColorsQuantity,
                borderWidth: 1,
            },
        ],
    };

    const chartOptionsQuantity = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: 'Product Purchase Quantities by Category',
                font: {
                    size: 20,
                    weight: 'bold'
                },
                padding: {
                    top: 10,
                    bottom: 20
                }
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const productName = context.label;
                        const quantity = context.parsed.y;
                        const categoryId = productPurchaseQuantityData[context.dataIndex].category_id;
                        if (quantity !== null) {
                            return `${productName} (Category ${categoryId}): ${quantity} units`;
                        }
                        return '';
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Quantity Purchased',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                ticks: {
                    precision: 0
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Product Name',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                ticks: {
                    maxRotation: 90,
                    minRotation: 90,
                    autoSkip: false,
                    font: {
                        size: 12
                    }
                },
                offset: true,
            }
        }
    };

    // --- Code for productPriceHistoryData (Line Chart) ---
    const sortedProductPriceHistoryData = [...productPriceHistoryData].sort((a, b) => new Date(a._date) - new Date(b._date));

    const labelsPriceHistory = sortedProductPriceHistoryData.map(item => item._date);
    const dataValuesPriceHistory = sortedProductPriceHistoryData.map(item => item.product_price);

    const chartDataPriceHistory = {
        labels: labelsPriceHistory,
        datasets: [
            {
                label: 'Product Price',
                data: dataValuesPriceHistory,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.3,
                pointRadius: 5,
                pointBackgroundColor: 'rgba(75, 192, 192, 1)',
                pointBorderColor: '#fff',
                pointHoverRadius: 7,
            },
        ],
    };

    const chartOptionsPriceHistory = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
            },
            title: {
                display: true,
                text: `Price History for ${selectedProductId ? productHistoryData.find(p => p.product_id === selectedProductId)?.product_name : 'Selected Product'}`,
                font: {
                    size: 20,
                    weight: 'bold'
                },
                padding: {
                    top: 10,
                    bottom: 20,
                    right: 150 // Added padding-right to make space for the dropdown
                }
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const date = context.label;
                        const price = context.parsed.y;
                        if (price !== null) {
                            return `Date: ${date}, Price: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'VND' }).format(price)}`;
                        }
                        return '';
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: false,
                title: {
                    display: true,
                    text: 'Price (VND)',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                ticks: {
                    callback: function (value) {
                        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);
                    }
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Date',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                ticks: {
                    display: false, // Hiding x-axis labels
                    maxRotation: 45,
                    minRotation: 0,
                    autoSkip: true,
                    maxTicksLimit: 10,
                },
            }
        }
    };

    return (
        <div className='dashboard-container'>
            {/* Today's and Total Revenue */}
            <div className="revenue-summary">
                <div className="revenue-card">
                    <h3>Today's Revenue</h3>
                    <p className="revenue-value">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'VND' }).format(todayRevenueData || 0)}
                    </p>
                </div>
                <div className="revenue-card">
                    <h3>Total Revenue</h3>
                    <p className="revenue-value">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'VND' }).format(totalRevenueData || 0)}
                    </p>
                </div>
            </div>

            {/* Product Price Chart */}
            <div className='chart-card'>
                {priceData && priceData.length > 0 ? (
                    <Bar data={chartDataPrice} options={chartOptionsPrice} />
                ) : (
                    <p>No price data available to display the chart.</p>
                )}
            </div>

            {/* Product Purchase Quantity Chart */}
            <div className='chart-card'>
                {productPurchaseQuantityData && productPurchaseQuantityData.length > 0 ? (
                    <Bar data={chartDataQuantity} options={chartOptionsQuantity} />
                ) : (
                    <p>No product purchase quantity data available to display the chart.</p>
                )}
            </div>

            {/* Product Price History Chart */}
            <div className='chart-card price-history-card'>
                {/* The h2 tag is removed as the chart's title plugin handles it */}
                <div className="product-select-container">
                    {/* The label is removed as per request */}
                    <select
                        id="product-select"
                        value={selectedProductId}
                        onChange={(e) => setSelectedProductId(parseInt(e.target.value))}
                    >
                        {productHistoryData.length > 0 ? (
                            productHistoryData.map((product) => (
                                <option key={product.product_id} value={product.product_id}>
                                    {product.product_name}
                                </option>
                            ))
                        ) : (
                            <option value="">No products available</option>
                        )}
                    </select>
                </div>

                {productPriceHistoryData && productPriceHistoryData.length > 0 ? (
                    <Line data={chartDataPriceHistory} options={chartOptionsPriceHistory} />
                ) : (
                    <p>No price history data available for the selected product.</p>
                )}
            </div>
        </div>
    )
}

export default Dashboard;