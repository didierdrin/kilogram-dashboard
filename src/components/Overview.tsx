import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import {
  collection,
  query,
  onSnapshot,
  where,
  getFirestore,
} from "firebase/firestore";
import { firestore as db } from "../../firebaseApp";
import { getAuth } from "firebase/auth";
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type TimeFrame = 'daily' | 'weekly' | 'monthly' | 'yearly';

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
    const fetchData = async () => {
      const allOrders: any[] = [];
      const currentUser = auth.currentUser;

    if (!currentUser) {
      console.error("No user logged in");
      return;
    }

      // Fetch data from Firestore
      const ordersQuery = query(collection(db, "orders"), where("brand_uid", "==", currentUser.uid));
      const recentOrdersQuery = query(collection(db, "recent_orders"), where("brand_uid", "==", currentUser.uid));

      const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
        snapshot.forEach((doc) => allOrders.push(doc.data()));
        processChartData(allOrders);
      });

      const unsubscribeRecentOrders = onSnapshot(recentOrdersQuery, (snapshot) => {
        snapshot.forEach((doc) => allOrders.push(doc.data()));
        processChartData(allOrders);
      });

      return () => {
        unsubscribeOrders();
        unsubscribeRecentOrders();
      };
    };

    const processChartData = (allOrders: any[]) => {
      const dataByTimeFrame = groupOrdersByTimeFrame(allOrders, timeFrame);
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

    const groupOrdersByTimeFrame = (orders: any[], timeFrame: TimeFrame) => {
      const salesByPeriod: { [key: string]: number } = {};
      const labels: string[] = [];
      const salesData: number[] = [];

      // Example grouping logic based on the time frame selected
      orders.forEach((order) => {
        const orderDate = order.order_date?.toDate();
        if (timeFrame === 'daily') {
          const day = orderDate?.toLocaleDateString();
          salesByPeriod[day] = (salesByPeriod[day] || 0) + order.total_amount;
        } else if (timeFrame === 'weekly') {
          const week = getWeekNumber(orderDate);
          salesByPeriod[week] = (salesByPeriod[week] || 0) + order.total_amount;
        } else if (timeFrame === 'monthly') {
          const month = orderDate?.getMonth().toString();
          salesByPeriod[month] = (salesByPeriod[month] || 0) + order.total_amount;
        } else if (timeFrame === 'yearly') {
          const year = orderDate?.getFullYear().toString();
          salesByPeriod[year] = (salesByPeriod[year] || 0) + order.total_amount;
        }
      });

      // Prepare labels and data for charting
      for (const [label, value] of Object.entries(salesByPeriod)) {
        labels.push(label);
        salesData.push(value);
      }

      return { labels, data: salesData };
    };

    const getWeekNumber = (date: Date) => {
      const start = new Date(date.getFullYear(), 0, 1);
      const diff = (date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      return `Week ${Math.floor(diff / 7) + 1}`;
    };

    fetchData();
  }, [timeFrame]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Sales Over Time',
      },
    },
    animation: {
      duration: 1000,
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Sales Overview</h3>
      <div className="mb-4">
        <label htmlFor="timeFrame" className="mr-2">Select time frame:</label>
        <select
          id="timeFrame"
          value={timeFrame}
          onChange={(e) => setTimeFrame(e.target.value as TimeFrame)}
          className="border rounded p-1"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>
      <Bar options={options} data={chartData} />
    </div>
  );
};

export default Overview;
