import React from 'react'
import './Dashboard.css'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2'
import { useContext } from 'react'
import { StoreContext } from '../../context/StoreContext'

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const Dashboard = () => {

    const { priceData } = useContext(StoreContext);

    const categoryColors = {
        10: 'rgba(255, 99, 132, 0.6)', // Reddish
        11: 'rgba(54, 162, 235, 0.6)', // Blueish
        12: 'rgba(255, 206, 86, 0.6)', // Yellowish
        13: 'rgba(75, 192, 192, 0.6)', // Teal
        // Add more colors if you have more categories
    };

    // Prepare data for the Bar chart
    // Each product will have its own bar.
    // The x-axis labels will be product names.
    const labels = priceData.map(item => item.product_name);
    const dataValues = priceData.map(item => item.price);
    const backgroundColors = priceData.map(item => categoryColors[item.category_id] || 'rgba(199, 199, 199, 0.6)'); // Default grey
    const borderColors = backgroundColors.map(color => color.replace('0.6', '1'));

    const chartData = {
        labels: labels,
        datasets: [
            {
                label: 'Product Price',
                data: dataValues,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 1,
            },
        ],
    };

    // Chart options for responsiveness, titles, tooltips, and axis configuration
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false, // Allows the chart to fill the container size
        plugins: {
            legend: {
                display: false, // Hide default legend as colors represent categories visually
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
                    label: function(context) {
                        const productName = context.label;
                        const price = context.parsed.y;
                        const categoryId = priceData[context.dataIndex].category_id; // Get category_id from original data
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
                    callback: function(value) {
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
                    maxRotation: 90,    // Rotate labels by 90 degrees
                    minRotation: 90,    // Ensure they stay at 90 degrees
                    autoSkip: false,    // Prevent skipping labels if space is tight
                    font: {
                        size: 12
                    }
                },
                // Set `offset: true` for bar charts to center bars between ticks
                offset: true,
            }
        }
    };

    return (
        <div className='dashboard-container'>
            {/* Embedded CSS for self-containment */}
            <style>{`
                .dashboard-container {
                    padding: 20px;
                    background-color: #f0f2f5;
                    min-height: 100vh;
                    font-family: 'Inter', sans-serif;
                    color: #333;
                }

                .dashboard-title {
                    text-align: center;
                    color: #2c3e50;
                    margin-bottom: 30px;
                    font-size: 2.5em;
                    font-weight: 700;
                }

                .chart-card {
                    background-color: #ffffff;
                    padding: 30px;
                    border-radius: 12px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                    margin: 0 auto;
                    width: 100%; /* Use full width of parent */
                    max-width: 900px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 400px; /* Ensure space for chart */
                    height: 600px; /* Fixed height for consistent chart rendering */
                }

                @media (max-width: 768px) {
                    .dashboard-container {
                        padding: 15px;
                    }

                    .dashboard-title {
                        font-size: 2em;
                    }

                    .chart-card {
                        padding: 20px;
                        border-radius: 10px;
                        height: 500px; /* Adjust height for smaller screens */
                    }
                }
            `}</style>
            <h1 className='dashboard-title'>Product Price Dashboard</h1>
            <div className='chart-card'>
                {priceData && priceData.length > 0 ? (
                    <Bar data={chartData} options={chartOptions} />
                ) : (
                    <p>No price data available to display the chart.</p>
                )}
            </div>
        </div>
    )
}

export default Dashboard