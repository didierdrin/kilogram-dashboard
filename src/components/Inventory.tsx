// with image upload
// import { useState, useEffect } from "react";
// import {
//   collection,
//   onSnapshot,
//   addDoc,
//   updateDoc,
//   deleteDoc,
//   doc,
//   serverTimestamp,
// } from "firebase/firestore";
// import { 
//   ref, 
//   uploadBytes, 
//   getDownloadURL 
// } from "firebase/storage";
// import { firestore as db, storage } from "../../firebaseApp";
// import { useAuthState } from "react-firebase-hooks/auth";
// import { auth } from "../../firebaseApp";

// interface GarmentType {
//   name: string;
//   price: number;
// }

// interface Laundromat {
//   name: string;
//   uid: string;
//   imageUrl: string;
//   createdAt: any;
//   updatedAt: any;
// }

// type GarmentTypeWithId = {
//   id: string;
//   data: GarmentType;
// };

// type LaundromatWithId = {
//   id: string;
//   data: Laundromat;
// };

// const Inventory = () => {
//   const [user] = useAuthState(auth);
//   const [garmentTypes, setGarmentTypes] = useState<GarmentTypeWithId[]>([]);
//   const [laundromats, setLaundromats] = useState<LaundromatWithId[]>([]);
//   const [editingGarment, setEditingGarment] = useState<GarmentTypeWithId | null>(null);
//   const [newGarment, setNewGarment] = useState<GarmentType>({
//     name: "",
//     price: 0,
//   });
//   const [newLaundromat, setNewLaundromat] = useState<string>("");
//   const [imageFile, setImageFile] = useState<File | null>(null);
//   const [isUploading, setIsUploading] = useState<boolean>(false);
//   const [imagePreview, setImagePreview] = useState<string | null>(null);

//   // Fetch garment types
//   useEffect(() => {
//     const unsubscribe = onSnapshot(collection(db, "garmentTypeCleaned"), (snapshot) => {
//       setGarmentTypes(
//         snapshot.docs.map((doc) => ({
//           id: doc.id,
//           data: doc.data() as GarmentType,
//         }))
//       );
//     });
//     return () => unsubscribe();
//   }, []);

//   // Fetch laundromats for current user
//   useEffect(() => {
//     if (!user?.uid) return;
    
//     const unsubscribe = onSnapshot(
//       collection(db, "laundromats"), 
//       (snapshot) => {
//         setLaundromats(
//           snapshot.docs
//             .filter(doc => doc.data().uid === user.uid)
//             .map((doc) => ({
//               id: doc.id,
//               data: doc.data() as Laundromat,
//             }))
//         );
//       }
//     );
//     return () => unsubscribe();
//   }, [user]);

//   // Handle image file selection
//   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       const file = e.target.files[0];
//       setImageFile(file);
      
//       // Create image preview
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setImagePreview(reader.result as string);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   // Upload image to Firebase Storage
//   const uploadImage = async (file: File): Promise<string> => {
//     if (!user?.uid) throw new Error("User not authenticated");
    
//     const storageRef = ref(storage, `laundromat-images/${user.uid}/${Date.now()}_${file.name}`);
//     await uploadBytes(storageRef, file);
//     return await getDownloadURL(storageRef);
//   };

//   const handleAddLaundromat = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!newLaundromat || !user?.uid) {
//       alert("Please enter a laundromat name");
//       return;
//     }

//     if (!imageFile) {
//       alert("Please select a logo image for your laundromat");
//       return;
//     }

//     try {
//       setIsUploading(true);
//       // Upload image to storage and get URL
//       const imageUrl = await uploadImage(imageFile);
      
//       // Add laundromat to Firestore with image URL
//       await addDoc(collection(db, "laundromats"), {
//         name: newLaundromat,
//         uid: user.uid,
//         imageUrl: imageUrl,
//         createdAt: serverTimestamp(),
//         updatedAt: serverTimestamp(),
//       });
      
//       // Reset form
//       setNewLaundromat("");
//       setImageFile(null);
//       setImagePreview(null);
//       setIsUploading(false);
//     } catch (error) {
//       console.error("Error adding laundromat: ", error);
//       alert("Failed to add laundromat");
//       setIsUploading(false);
//     }
//   };

//   const handleAddGarment = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!newGarment.name || newGarment.price <= 0) {
//       alert("Please fill in all fields with valid values");
//       return;
//     }

//     try {
//       await addDoc(collection(db, "garmentTypeCleaned"), {
//         name: newGarment.name,
//         price: newGarment.price,
//       });
//       setNewGarment({
//         name: "",
//         price: 0,
//       });
//     } catch (error) {
//       console.error("Error adding garment type: ", error);
//       alert("Failed to add garment type");
//     }
//   };

//   const handleUpdateGarment = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!editingGarment) return;

//     try {
//       await updateDoc(doc(db, "garmentTypeCleaned", editingGarment.id), {
//         name: editingGarment.data.name,
//         price: editingGarment.data.price,
//       });
//       setEditingGarment(null);
//     } catch (error) {
//       console.error("Error updating garment type: ", error);
//       alert("Failed to update garment type");
//     }
//   };

//   const handleDeleteGarment = async (id: string) => {
//     if (!confirm("Are you sure you want to delete this garment type?")) return;

//     try {
//       await deleteDoc(doc(db, "garmentTypeCleaned", id));
//     } catch (error) {
//       console.error("Error deleting garment type: ", error);
//       alert("Failed to delete garment type");
//     }
//   };

//   return (
//     <div className="bg-white p-6 rounded-lg shadow-md">
//       <h3 className="text-xl font-semibold mb-4">Laundromat Management</h3>

//       {/* Add Laundromat Section */}
//       <form onSubmit={handleAddLaundromat} className="mb-8">
//         <h4 className="text-lg font-medium mb-4">Add New Laundromat</h4>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <input
//               type="text"
//               placeholder="Laundromat Name"
//               value={newLaundromat}
//               onChange={(e) => setNewLaundromat(e.target.value)}
//               className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             />
//           </div>
//           <div className="flex flex-col">
//             <div className="mb-2">
//               <label className="block text-sm font-medium mb-1">Logo Image</label>
//               <input
//                 type="file"
//                 accept="image/*"
//                 onChange={handleImageChange}
//                 className="w-full p-2 border rounded"
//               />
//             </div>
//             {imagePreview && (
//               <div className="mt-2">
//                 <img 
//                   src={imagePreview} 
//                   alt="Preview" 
//                   className="h-20 w-20 object-cover rounded"
//                 />
//               </div>
//             )}
//           </div>
//         </div>
//         <button
//           type="submit"
//           disabled={isUploading}
//           className={`mt-4 px-6 py-2 rounded transition duration-200 ${
//             isUploading 
//               ? "bg-gray-400 cursor-not-allowed" 
//               : "bg-blue-500 hover:bg-blue-600 text-white"
//           }`}
//         >
//           {isUploading ? "Adding..." : "Add Laundromat"}
//         </button>
//       </form>

//       {/* Display Current Laundromats */}
//       <div className="mb-8">
//         <h4 className="text-lg font-medium mb-4">Your Laundromats</h4>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           {laundromats.map(({ id, data }) => (
//             <div key={id} className="border rounded-lg p-4 hover:shadow-md transition duration-200">
//               <div className="flex items-center space-x-3">
//                 {data.imageUrl && (
//                   <img 
//                     src={data.imageUrl} 
//                     alt={`${data.name} logo`} 
//                     className="h-12 w-12 object-cover rounded"
//                   />
//                 )}
//                 <h4 className="font-semibold text-lg">{data.name}</h4>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       <hr className="my-8" />

//       <h3 className="text-xl font-semibold mb-4">Garment Types Management</h3>

//       <form onSubmit={handleAddGarment} className="mb-8">
//         <h4 className="text-lg font-medium mb-4">Add New Garment Type</h4>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <input
//             type="text"
//             placeholder="Garment Name"
//             value={newGarment.name}
//             onChange={(e) =>
//               setNewGarment({ ...newGarment, name: e.target.value })
//             }
//             className="p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//           />
//           <input
//             type="number"
//             placeholder="Price (RWF)"
//             value={newGarment.price === 0 ? '' : newGarment.price}
//             onChange={(e) =>
//               setNewGarment({
//                 ...newGarment,
//                 price: parseFloat(e.target.value) || 0,
//               })
//             }
//             className="p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//           />
//         </div>
//         <button
//           type="submit"
//           className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded transition duration-200"
//         >
//           Add Garment Type
//         </button>
//       </form>

//       <div className="mb-6">
//         <h3 className="text-lg font-medium mb-4">Current Garment Types</h3>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           {garmentTypes.map(({ id, data }) => (
//             <div key={id} className="border rounded-lg p-4 hover:shadow-md transition duration-200">
//               <div className="flex justify-between items-start mb-3">
//                 <h4 className="font-semibold text-lg">{data.name}</h4>
//                 <span className="font-medium text-green-600">RWF {data.price.toLocaleString()}</span>
//               </div>
//               <div className="flex justify-end space-x-3 mt-4">
//                 <button
//                   onClick={() => setEditingGarment({ id, data })}
//                   className="text-blue-500 hover:text-blue-700 font-medium transition duration-200"
//                 >
//                   Edit
//                 </button>
//                 <button
//                   onClick={() => handleDeleteGarment(id)}
//                   className="text-red-500 hover:text-red-700 font-medium transition duration-200"
//                 >
//                   Delete
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Edit Modal */}
//       {editingGarment && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-lg p-6 w-full max-w-md">
//             <h3 className="text-xl font-semibold mb-4">Edit Garment Type</h3>
//             <form onSubmit={handleUpdateGarment} className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium mb-1">Name</label>
//                 <input
//                   type="text"
//                   value={editingGarment.data.name}
//                   onChange={(e) =>
//                     setEditingGarment({
//                       ...editingGarment,
//                       data: { ...editingGarment.data, name: e.target.value },
//                     })
//                   }
//                   className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium mb-1">Price (RWF)</label>
//                 <input
//                   type="number"
//                   value={editingGarment.data.price}
//                   onChange={(e) =>
//                     setEditingGarment({
//                       ...editingGarment,
//                       data: {
//                         ...editingGarment.data,
//                         price: parseFloat(e.target.value) || 0,
//                       },
//                     })
//                   }
//                   className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>
//               <div className="flex justify-end space-x-3 mt-6">
//                 <button
//                   type="button"
//                   onClick={() => setEditingGarment(null)}
//                   className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
//                 >
//                   Update
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Inventory;

import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { firestore as db } from "../../firebaseApp";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebaseApp";

interface GarmentType {
  name: string;
  price: number;
}

interface Laundromat {
  name: string;
  uid: string;
  createdAt: any;
  updatedAt: any;
}

type GarmentTypeWithId = {
  id: string;
  data: GarmentType;
};

type LaundromatWithId = {
  id: string;
  data: Laundromat;
};

const Inventory = () => {
  const [user] = useAuthState(auth);
  const [garmentTypes, setGarmentTypes] = useState<GarmentTypeWithId[]>([]);
  const [laundromats, setLaundromats] = useState<LaundromatWithId[]>([]);
  const [editingGarment, setEditingGarment] = useState<GarmentTypeWithId | null>(null);
  const [newGarment, setNewGarment] = useState<GarmentType>({
    name: "",
    price: 0,
  });
  const [newLaundromat, setNewLaundromat] = useState<string>("");

  // Fetch garment types
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "garmentTypeCleaned"), (snapshot) => {
      setGarmentTypes(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          data: doc.data() as GarmentType,
        }))
      );
    });
    return () => unsubscribe();
  }, []);

  // Fetch laundromats for current user
  useEffect(() => {
    if (!user?.uid) return;
    
    const unsubscribe = onSnapshot(
      collection(db, "laundromats"), 
      (snapshot) => {
        setLaundromats(
          snapshot.docs
            .filter(doc => doc.data().uid === user.uid)
            .map((doc) => ({
              id: doc.id,
              data: doc.data() as Laundromat,
            }))
        );
      }
    );
    return () => unsubscribe();
  }, [user]);

  const handleAddLaundromat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLaundromat || !user?.uid) {
      alert("Please enter a laundromat name");
      return;
    }

    try {
      await addDoc(collection(db, "laundromats"), {
        name: newLaundromat,
        uid: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setNewLaundromat("");
    } catch (error) {
      console.error("Error adding laundromat: ", error);
      alert("Failed to add laundromat");
    }
  };

  const handleAddGarment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGarment.name || newGarment.price <= 0) {
      alert("Please fill in all fields with valid values");
      return;
    }

    try {
      await addDoc(collection(db, "garmentTypeCleaned"), {
        name: newGarment.name,
        price: newGarment.price,
      });
      setNewGarment({
        name: "",
        price: 0,
      });
    } catch (error) {
      console.error("Error adding garment type: ", error);
      alert("Failed to add garment type");
    }
  };

  const handleUpdateGarment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGarment) return;

    try {
      await updateDoc(doc(db, "garmentTypeCleaned", editingGarment.id), {
        name: editingGarment.data.name,
        price: editingGarment.data.price,
      });
      setEditingGarment(null);
    } catch (error) {
      console.error("Error updating garment type: ", error);
      alert("Failed to update garment type");
    }
  };

  const handleDeleteGarment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this garment type?")) return;

    try {
      await deleteDoc(doc(db, "garmentTypeCleaned", id));
    } catch (error) {
      console.error("Error deleting garment type: ", error);
      alert("Failed to delete garment type");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Laundromat Management</h3>

      {/* Add Laundromat Section */}
      <form onSubmit={handleAddLaundromat} className="mb-8">
        <h4 className="text-lg font-medium mb-4">Add New Laundromat</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Laundromat Name"
            value={newLaundromat}
            onChange={(e) => setNewLaundromat(e.target.value)}
            className="p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded transition duration-200"
          >
            Add Laundromat
          </button>
        </div>
      </form>

      {/* Display Current Laundromats */}
      <div className="mb-8">
        <h4 className="text-lg font-medium mb-4">Your Laundromats</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {laundromats.map(({ id, data }) => (
            <div key={id} className="border rounded-lg p-4 hover:shadow-md transition duration-200">
              <h4 className="font-semibold text-lg">{data.name}</h4>
            </div>
          ))}
        </div>
      </div>

      <hr className="my-8" />

      <h3 className="text-xl font-semibold mb-4">Garment Types Management</h3>

      <form onSubmit={handleAddGarment} className="mb-8">
        <h4 className="text-lg font-medium mb-4">Add New Garment Type</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Garment Name"
            value={newGarment.name}
            onChange={(e) =>
              setNewGarment({ ...newGarment, name: e.target.value })
            }
            className="p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="number"
            placeholder="Price (RWF)"
            value={newGarment.price === 0 ? '' : newGarment.price}
            onChange={(e) =>
              setNewGarment({
                ...newGarment,
                price: parseFloat(e.target.value) || 0,
              })
            }
            className="p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          type="submit"
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded transition duration-200"
        >
          Add Garment Type
        </button>
      </form>

      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4">Current Garment Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {garmentTypes.map(({ id, data }) => (
            <div key={id} className="border rounded-lg p-4 hover:shadow-md transition duration-200">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-semibold text-lg">{data.name}</h4>
                <span className="font-medium text-green-600">RWF {data.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => setEditingGarment({ id, data })}
                  className="text-blue-500 hover:text-blue-700 font-medium transition duration-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteGarment(id)}
                  className="text-red-500 hover:text-red-700 font-medium transition duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {editingGarment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Edit Garment Type</h3>
            <form onSubmit={handleUpdateGarment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={editingGarment.data.name}
                  onChange={(e) =>
                    setEditingGarment({
                      ...editingGarment,
                      data: { ...editingGarment.data, name: e.target.value },
                    })
                  }
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Price (RWF)</label>
                <input
                  type="number"
                  value={editingGarment.data.price}
                  onChange={(e) =>
                    setEditingGarment({
                      ...editingGarment,
                      data: {
                        ...editingGarment.data,
                        price: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingGarment(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;


// import { useState, useEffect } from "react";
// import {
//   collection,
//   onSnapshot,
//   addDoc,
//   updateDoc,
//   deleteDoc,
//   doc,
// } from "firebase/firestore";
// import { firestore as db } from "../../firebaseApp";

// interface GarmentType {
//   name: string;
//   price: number;
// }

// type GarmentTypeWithId = {
//   id: string;
//   data: GarmentType;
// };

// const Inventory = () => {
//   const [garmentTypes, setGarmentTypes] = useState<GarmentTypeWithId[]>([]);
//   const [editingGarment, setEditingGarment] = useState<GarmentTypeWithId | null>(null);
//   const [newGarment, setNewGarment] = useState<GarmentType>({
//     name: "",
//     price: 0,
//   });

//   useEffect(() => {
//     const unsubscribe = onSnapshot(collection(db, "garmentTypeCleaned"), (snapshot) => {
//       setGarmentTypes(
//         snapshot.docs.map((doc) => ({
//           id: doc.id,
//           data: doc.data() as GarmentType,
//         }))
//       );
//     });
//     return () => unsubscribe();
//   }, []);

//   const handleAddGarment = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!newGarment.name || newGarment.price <= 0) {
//       alert("Please fill in all fields with valid values");
//       return;
//     }

//     try {
//       await addDoc(collection(db, "garmentTypeCleaned"), {
//         name: newGarment.name,
//         price: newGarment.price,
//       });
//       setNewGarment({
//         name: "",
//         price: 0,
//       });
//     } catch (error) {
//       console.error("Error adding garment type: ", error);
//       alert("Failed to add garment type");
//     }
//   };

//   const handleUpdateGarment = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!editingGarment) return;

//     try {
//       await updateDoc(doc(db, "garmentTypeCleaned", editingGarment.id), {
//         name: editingGarment.data.name,
//         price: editingGarment.data.price,
//       });
//       setEditingGarment(null);
//     } catch (error) {
//       console.error("Error updating garment type: ", error);
//       alert("Failed to update garment type");
//     }
//   };

//   const handleDeleteGarment = async (id: string) => {
//     if (!confirm("Are you sure you want to delete this garment type?")) return;

//     try {
//       await deleteDoc(doc(db, "garmentTypeCleaned", id));
//     } catch (error) {
//       console.error("Error deleting garment type: ", error);
//       alert("Failed to delete garment type");
//     }
//   };

//   return (
//     <div className="bg-white p-6 rounded-lg shadow-md">
//       <h3 className="text-xl font-semibold mb-4">Garment Types Management</h3>

//       <form onSubmit={handleAddGarment} className="mb-8">
//         <h4 className="text-lg font-medium mb-4">Add New Garment Type</h4>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <input
//             type="text"
//             placeholder="Garment Name"
//             value={newGarment.name}
//             onChange={(e) =>
//               setNewGarment({ ...newGarment, name: e.target.value })
//             }
//             className="p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//           />
//           <input
//             type="number"
//             placeholder="Price (RWF)"
//             value={newGarment.price === 0 ? '' : newGarment.price}
//             onChange={(e) =>
//               setNewGarment({
//                 ...newGarment,
//                 price: parseFloat(e.target.value) || 0,
//               })
//             }
//             className="p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//           />
//         </div>
//         <button
//           type="submit"
//           className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded transition duration-200"
//         >
//           Add Garment Type
//         </button>
//       </form>

//       <div className="mb-6">
//         <h3 className="text-lg font-medium mb-4">Current Garment Types</h3>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           {garmentTypes.map(({ id, data }) => (
//             <div key={id} className="border rounded-lg p-4 hover:shadow-md transition duration-200">
//               <div className="flex justify-between items-start mb-3">
//                 <h4 className="font-semibold text-lg">{data.name}</h4>
//                 <span className="font-medium text-green-600">RWF {data.price.toLocaleString()}</span>
//               </div>
//               <div className="flex justify-end space-x-3 mt-4">
//                 <button
//                   onClick={() => setEditingGarment({ id, data })}
//                   className="text-blue-500 hover:text-blue-700 font-medium transition duration-200"
//                 >
//                   Edit
//                 </button>
//                 <button
//                   onClick={() => handleDeleteGarment(id)}
//                   className="text-red-500 hover:text-red-700 font-medium transition duration-200"
//                 >
//                   Delete
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Edit Modal */}
//       {editingGarment && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-lg p-6 w-full max-w-md">
//             <h3 className="text-xl font-semibold mb-4">Edit Garment Type</h3>
//             <form onSubmit={handleUpdateGarment} className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium mb-1">Name</label>
//                 <input
//                   type="text"
//                   value={editingGarment.data.name}
//                   onChange={(e) =>
//                     setEditingGarment({
//                       ...editingGarment,
//                       data: { ...editingGarment.data, name: e.target.value },
//                     })
//                   }
//                   className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium mb-1">Price (RWF)</label>
//                 <input
//                   type="number"
//                   value={editingGarment.data.price}
//                   onChange={(e) =>
//                     setEditingGarment({
//                       ...editingGarment,
//                       data: {
//                         ...editingGarment.data,
//                         price: parseFloat(e.target.value) || 0,
//                       },
//                     })
//                   }
//                   className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>
//               <div className="flex justify-end space-x-3 mt-6">
//                 <button
//                   type="button"
//                   onClick={() => setEditingGarment(null)}
//                   className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
//                 >
//                   Update
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Inventory;
