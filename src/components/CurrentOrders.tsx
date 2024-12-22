import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  getDocs,
} from "firebase/firestore";
import { firestore as db } from "../../firebaseApp";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import { getAuth } from "firebase/auth";

interface Order {
  id: string;
  client_uid: string;
  order_id: string;
  customer_info: {
    name: string;
    uid: string; // Assuming client_uid is stored here
  };
  total_amount: number;
  order_date: {
    toDate: () => Date;
  };
  order_status: string[];
  shipping_address?: {
    unit_number: string;
    street_address: string;
    city: string;
    province: string;
    postal_code: string;
    country: string;
    special_instructions?: string;
  };
}

const CurrentOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const auth = getAuth();
  useEffect(() => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      console.error("No user logged in");
      return;
    }

    const q = query(
      collection(db, "orders"),
      where("order_status", "array-contains-any", ["Processing", "Shipped"]),
      where("brand_uid", "==", currentUser.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData: Order[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Order, "id">),
      }));
      setOrders(ordersData);
    });
    return () => unsubscribe();
  }, []);

  // Function to handle updating the order status
  const handleUpdateStatus = async (order: Order, newStatus: string) => {
    const orderDocRef = doc(db, "orders", order.id);

    try {
      if (newStatus === "Delivered") {
        // Add order to the global recent_orders collection
        const addedOrderRef = await addDoc(collection(db, "recent_orders"), {
          ...order,
          order_status: ["Delivered"],
          actual_delivery_date: new Date(),
        });

        const clientUid = order.client_uid;

          if (clientUid) {
            // Add the order to the specific user's recent_orders subcollection
            const userOrderRef = collection(db, "users", clientUid, "recent_orders");

            await addDoc(userOrderRef, {
              items: order || [],
              totalAmount: order.total_amount,
              orderDate: new Date(order.order_date.toDate()),
              status: "Delivered",
              actual_delivery_date: new Date(),
              shipping_address: order.shipping_address || {}, // Ensure shipping address is included
            });
          }

        // Delete the order from the orders collection
        await deleteDoc(orderDocRef);
      } else {
        // Update the order status in the orders collection
        await updateDoc(orderDocRef, {
          order_status: [...order.order_status, newStatus],
        });
      }
    } catch (error) {
      console.error("Error updating order status: ", error);
    }
  };

  // Function to handle opening the dialog with shipping address details
  const handleOpenDialog = (order: Order) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

  // Function to handle closing the dialog
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedOrder(null);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Current Orders</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2">Order ID</th>
              <th className="px-4 py-2">Customer</th>
              <th className="px-4 py-2">Total Amount</th>
              <th className="px-4 py-2">Order Date</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b" onClick={() => handleOpenDialog(order)}>
                <td className="px-4 py-2">{order.order_id}</td>
                <td className="px-4 py-2">{order.customer_info.name}</td>
                <td className="px-4 py-2">RWF{order.total_amount}</td>
                <td className="px-4 py-2">
                  {new Date(order.order_date.toDate()).toLocaleDateString()}
                </td>
                <td className="px-4 py-2">
                  {order.order_status[order.order_status.length - 1]}
                </td>
                <td className="px-4 py-2">
                  <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering the dialog open
                      handleUpdateStatus(order, "Delivered");
                    }}
                  >
                    Mark as Delivered
                  </button>
                  <button
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-4 rounded ml-2"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering the dialog open
                      handleUpdateStatus(order, "Cancelled");
                    }}
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <Dialog open={isDialogOpen} onClose={handleCloseDialog}>
          <DialogTitle>Shipping Address</DialogTitle>
          <DialogContent>
            {selectedOrder.shipping_address ? (
              <div>
                <p>Unit Number: {selectedOrder.shipping_address.unit_number}</p>
                <p>Street Address: {selectedOrder.shipping_address.street_address}</p>
                <p>City: {selectedOrder.shipping_address.city}</p>
                <p>Province: {selectedOrder.shipping_address.province}</p>
                <p>Postal Code: {selectedOrder.shipping_address.postal_code}</p>
                <p>Country: {selectedOrder.shipping_address.country}</p>
                {selectedOrder.shipping_address.special_instructions && (
                  <p>Special Instructions: {selectedOrder.shipping_address.special_instructions}</p>
                )}
              </div>
            ) : (
              <p>No shipping address available.</p>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};

export default CurrentOrders;
