import { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { firestore as db } from "../../firebaseApp";
import { getAuth } from "firebase/auth";
interface Order {
  id: string;
  order_id: number;
  customer_info: {
    name: string;
    email: string;
    phone: string;
  };
  total_amount: number;
  order_date: {
    toDate: () => Date;
  };
  order_status: string[];
  shipping_address: {
    unit_number: string;
    street_address: string;
    city: string;
    province: string;
    postal_code: string;
    country: string;
    special_instructions?: string;
  };
  items: Array<{
    name: string;
    price_per_unit: number;
    quantity: number;
  }>;
  payment_method: string;
  tracking_number: {
    toDate: () => Date;
  };
  actual_delivery_date: {
    toDate: () => Date;
  } | null;
}

const RecentOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const auth = getAuth();
  useEffect(() => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      console.error("No user logged in");
      return;
    }
    const q = query(collection(db, "recent_orders"),where("brand_uid", "==", currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData: Order[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Order, "id">),
      }));
      setOrders(ordersData);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Recent Orders</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2">Order ID</th>
              <th className="px-4 py-2">Customer</th>
              <th className="px-4 py-2">Total Amount</th>
              <th className="px-4 py-2">Order Date</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Items</th>
              <th className="px-4 py-2">Payment Method</th>
              <th className="px-4 py-2">Tracking Number</th>
              <th className="px-4 py-2">Delivery Date</th>
              <th className="px-4 py-2">Shipping Address</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b">
                <td className="px-4 py-2">{order.order_id}</td>
                <td className="px-4 py-2">
                  {order.customer_info.name} <br />
                  {order.customer_info.email} <br />
                  {order.customer_info.phone}
                </td>
                <td className="px-4 py-2">RWF{order.total_amount}</td>
                <td className="px-4 py-2">
                  {new Date(order.order_date.toDate()).toLocaleDateString()}
                </td>
                <td className="px-4 py-2">
                  {order.order_status[order.order_status.length - 1]}
                </td>
                <td className="px-4 py-2">
                  {order.items.map((item, index) => (
                    <div key={index}>
                      {item.name} - {item.quantity} x RWF{item.price_per_unit}
                    </div>
                  ))}
                </td>
                <td className="px-4 py-2">{order.payment_method}</td>
                <td className="px-4 py-2">
                  {new Date(order.tracking_number.toDate()).toLocaleDateString()}
                </td>
                <td className="px-4 py-2">
                  {order.actual_delivery_date
                    ? new Date(order.actual_delivery_date.toDate()).toLocaleDateString()
                    : "Not Delivered Yet"}
                </td>
                <td className="px-4 py-2">
                  {order.shipping_address.unit_number}, {order.shipping_address.street_address},<br />
                  {order.shipping_address.city}, {order.shipping_address.province},<br />
                  {order.shipping_address.postal_code}, {order.shipping_address.country}<br />
                  {order.shipping_address.special_instructions && (
                    <em>Instructions: {order.shipping_address.special_instructions}</em>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentOrders;
