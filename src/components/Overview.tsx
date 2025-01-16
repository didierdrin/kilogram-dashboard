import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import {
  collection,
  query,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { firestore as db } from "../../firebaseApp";
import { getAuth } from "firebase/auth";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type TimeFrame = 'daily' | 'weekly' | 'monthly' | 'yearly';

interface Order {
  totalAmount: number;
  createdAt: Timestamp;
  status: string;
}

const Overview = () => {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('daily');
  const [chartData, setChartData] = useState<{
    labels: string[];
    datasets: { label: string; data: number[]; backgroundColor: string }[];
  }>({
    labels: [],
    datasets: [
      {
        label: 'Sales',
        data: [],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  });

  const auth = getAuth();

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error("No user logged in");
      return;
    }

    // Query orders collection
    const ordersQuery = query(collection(db, "orders"));
    
    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      const orders: Order[] = snapshot.docs.map(doc => ({
        totalAmount: doc.data().totalAmount || 0,
        createdAt: doc.data().createdAt,
        status: doc.data().status
      }));
      processChartData(orders);
    });

    return () => unsubscribe();
  }, [timeFrame]);

  const processChartData = (orders: Order[]) => {
    const dataByTimeFrame = groupOrdersByTimeFrame(orders, timeFrame);
    setChartData({
      labels: dataByTimeFrame.labels,
      datasets: [
        {
          label: 'Sales',
          data: dataByTimeFrame.data,
          backgroundColor: 'rgba(0, 128, 0, 0.6)',
        },
      ],
    });
  };

  const groupOrdersByTimeFrame = (orders: Order[], timeFrame: TimeFrame) => {
    const salesByPeriod: { [key: string]: number } = {};
    
    orders.forEach((order) => {
      if (!order.createdAt) return;

      const orderDate = order.createdAt.toDate();
      let periodKey: string;

      switch (timeFrame) {
        case 'daily':
          periodKey = orderDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          });
          break;
        case 'weekly':
          const weekNumber = getWeekNumber(orderDate);
          periodKey = `Week ${weekNumber}`;
          break;
        case 'monthly':
          periodKey = orderDate.toLocaleDateString('en-US', {
            month: 'long'
          });
          break;
        case 'yearly':
          periodKey = orderDate.getFullYear().toString();
          break;
        default:
          periodKey = orderDate.toLocaleDateString();
      }

      salesByPeriod[periodKey] = (salesByPeriod[periodKey] || 0) + order.totalAmount;
    });

    // Sort the periods chronologically
    const sortedPeriods = Object.entries(salesByPeriod).sort((a, b) => {
      if (timeFrame === 'monthly') {
        return new Date(a[0] + ' 1, 2024').getTime() - new Date(b[0] + ' 1, 2024').getTime();
      }
      return a[0].localeCompare(b[0]);
    });

    return {
      labels: sortedPeriods.map(([label]) => label),
      data: sortedPeriods.map(([_, value]) => value)
    };
  };

  const getWeekNumber = (date: Date) => {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + startOfYear.getDay() + 1) / 7);
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Sales Overview',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Amount (RWF)'
        },
        ticks: {
          callback: (value: number) => `RWF ${value.toLocaleString()}`
        }
      }
    },
    animation: {
      duration: 1000,
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Sales Overview</h3>
        <div className="flex items-center">
          <label htmlFor="timeFrame" className="mr-2">Time frame:</label>
          <select
            id="timeFrame"
            value={timeFrame}
            onChange={(e) => setTimeFrame(e.target.value as TimeFrame)}
            className="border rounded-md p-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>
      
      <div className="h-[400px]">
        <Bar  data={chartData} />
      </div>
    </div>
  );
};

export default Overview;

// import { useState, useEffect } from 'react';
// import { Bar } from 'react-chartjs-2';
// import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
// import {
//   collection,
//   query,
//   onSnapshot,
//   where,
//   getFirestore,
// } from "firebase/firestore";
// import { firestore as db } from "../../firebaseApp";
// import { getAuth } from "firebase/auth";
// ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// type TimeFrame = 'daily' | 'weekly' | 'monthly' | 'yearly';

// const Overview = () => {
//   const [timeFrame, setTimeFrame] = useState<TimeFrame>('daily');
//   const [chartData, setChartData] = useState<{
//     labels: string[];
//     datasets: { label: string; data: number[]; backgroundColor: string }[];
//   }>({
//     labels: [],
//     datasets: [
//       {
//         label: 'Sales',
//         data: [],
//         backgroundColor: 'rgba(75, 192, 192, 0.6)',
//       },
//     ],
//   });
//   const auth = getAuth();
//   useEffect(() => {
//     const fetchData = async () => {
//       const allOrders: any[] = [];
//       const currentUser = auth.currentUser;

//     if (!currentUser) {
//       console.error("No user logged in");
//       return;
//     }

//       // Fetch data from Firestore
//       const ordersQuery = query(collection(db, "orders"), where("brand_uid", "==", currentUser.uid));
//       const recentOrdersQuery = query(collection(db, "recent_orders"), where("brand_uid", "==", currentUser.uid));

//       const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
//         snapshot.forEach((doc) => allOrders.push(doc.data()));
//         processChartData(allOrders);
//       });

//       const unsubscribeRecentOrders = onSnapshot(recentOrdersQuery, (snapshot) => {
//         snapshot.forEach((doc) => allOrders.push(doc.data()));
//         processChartData(allOrders);
//       });

//       return () => {
//         unsubscribeOrders();
//         unsubscribeRecentOrders();
//       };
//     };

//     const processChartData = (allOrders: any[]) => {
//       const dataByTimeFrame = groupOrdersByTimeFrame(allOrders, timeFrame);
//       setChartData({
//         labels: dataByTimeFrame.labels,
//         datasets: [
//           {
//             label: 'Sales',
//             data: dataByTimeFrame.data,
//             backgroundColor: 'rgba(0, 128, 0, 0.6)',
//           },
//         ],
//       });
//     };

//     const groupOrdersByTimeFrame = (orders: any[], timeFrame: TimeFrame) => {
//       const salesByPeriod: { [key: string]: number } = {};
//       const labels: string[] = [];
//       const salesData: number[] = [];

//       // Example grouping logic based on the time frame selected
//       orders.forEach((order) => {
//         const orderDate = order.order_date?.toDate();
//         if (timeFrame === 'daily') {
//           const day = orderDate?.toLocaleDateString();
//           salesByPeriod[day] = (salesByPeriod[day] || 0) + order.total_amount;
//         } else if (timeFrame === 'weekly') {
//           const week = getWeekNumber(orderDate);
//           salesByPeriod[week] = (salesByPeriod[week] || 0) + order.total_amount;
//         } else if (timeFrame === 'monthly') {
//           const month = orderDate?.getMonth().toString();
//           salesByPeriod[month] = (salesByPeriod[month] || 0) + order.total_amount;
//         } else if (timeFrame === 'yearly') {
//           const year = orderDate?.getFullYear().toString();
//           salesByPeriod[year] = (salesByPeriod[year] || 0) + order.total_amount;
//         }
//       });

//       // Prepare labels and data for charting
//       for (const [label, value] of Object.entries(salesByPeriod)) {
//         labels.push(label);
//         salesData.push(value);
//       }

//       return { labels, data: salesData };
//     };

//     const getWeekNumber = (date: Date) => {
//       const start = new Date(date.getFullYear(), 0, 1);
//       const diff = (date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
//       return `Week ${Math.floor(diff / 7) + 1}`;
//     };

//     fetchData();
//   }, [timeFrame]);

//   const options = {
//     responsive: true,
//     plugins: {
//       legend: {
//         position: 'top' as const,
//       },
//       title: {
//         display: true,
//         text: 'Sales Over Time',
//       },
//     },
//     animation: {
//       duration: 1000,
//     },
//   };

//   return (
//     <div className="bg-white p-6 rounded-lg shadow-md">
//       <h3 className="text-xl font-semibold mb-4">Sales Overview</h3>
//       <div className="mb-4">
//         <label htmlFor="timeFrame" className="mr-2">Select time frame:</label>
//         <select
//           id="timeFrame"
//           value={timeFrame}
//           onChange={(e) => setTimeFrame(e.target.value as TimeFrame)}
//           className="border rounded p-1"
//         >
//           <option value="daily">Daily</option>
//           <option value="weekly">Weekly</option>
//           <option value="monthly">Monthly</option>
//           <option value="yearly">Yearly</option>
//         </select>
//       </div>
//       <Bar options={options} data={chartData} />
//     </div>
//   );
// };

// export default Overview;
