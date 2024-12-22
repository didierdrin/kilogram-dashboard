import { useState, useEffect } from "react";
import Image from "next/image";
import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  GeoPoint,
  where,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { firestore as db } from "../../firebaseApp";
import { getAuth } from "firebase/auth";

interface ProductData {
  name: string;
  price: number;
  description: string;
  category: string[];
  brand: string;
  quantity: number;
  color: string;
  size: string;
  sku: string;
  cost_price: number;
  discount_price: number;
  material: string;
  care_instructions: string;
  shipping_weight: number;
  available_colors: string[];
  available_sizes: string[];
  tags: string[];
  img_url: string;
  brand_uid: string;
  date_added: Date;
  last_updated: Date;
  is_active: boolean;
  additional_images: string[];
  bar_code: string;
  lead_time: string;
  product_id: number;
  reorder_point: GeoPoint;
  supplier_info: string;
  tax_category: string;
  weight: number;
}

type Product = {
  id: string;
  data: ProductData;
};

const Inventory = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<ProductData>({
    name: "",
    price: 0,
    description: "",
    category: [],
    brand: "",
    quantity: 0,
    color: "",
    size: "",
    sku: "",
    cost_price: 0,
    discount_price: 0,
    material: "",
    care_instructions: "",
    shipping_weight: 0,
    available_colors: [],
    available_sizes: [],
    tags: [],
    img_url: "",
    brand_uid: "",
    date_added: new Date(),
    last_updated: new Date(),
    is_active: true,
    additional_images: [],
    bar_code: "",
    lead_time: "",
    product_id: 0,
    reorder_point: new GeoPoint(0, 0),
    supplier_info: "",
    tax_category: "",
    weight: 0,
  });
  const [image, setImage] = useState<File | null>(null);

  const storage = getStorage();
  const auth = getAuth();

  useEffect(() => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      console.error("No user logged in");
      return;
    }

    const q = query(
      collection(db, "products"),
      where("brand_uid", "==", currentUser.uid)
    );
    // const q = query(
    //   collection(db, "products"),
      
    // );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProducts(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          data: doc.data() as ProductData,
        }))
      );
    });
    return () => unsubscribe();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImage(e.target.files[0]);
    }
  };

  // Safe parsing functions to prevent NaN values
  const safeParseFloat = (value: string): number => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  const safeParseInt = (value: string): number => {
    const parsed = parseInt(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let img_url = "";
      if (image) {
        const storageRef = ref(storage, `product_images/${image.name}`);
        await uploadBytes(storageRef, image);
        img_url = await getDownloadURL(storageRef);
      }

      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error("No user logged in");
        return;
      }

      const productData: ProductData = {
        ...newProduct,
        img_url,
        brand_uid: currentUser.uid,
        date_added: new Date(),
        last_updated: new Date(),
        is_active: true,
        reorder_point: new GeoPoint(0, 0), // Default value, update as needed
      };

      await addDoc(collection(db, "products"), productData);
      setNewProduct({
        name: "",
        price: 0,
        description: "",
        category: [],
        brand: "",
        quantity: 0,
        color: "",
        size: "",
        sku: "",
        cost_price: 0,
        discount_price: 0,
        material: "",
        care_instructions: "",
        shipping_weight: 0,
        available_colors: [],
        available_sizes: [],
        tags: [],
        img_url: "",
        brand_uid: "",
        date_added: new Date(),
        last_updated: new Date(),
        is_active: true,
        additional_images: [],
        bar_code: "",
        lead_time: "",
        product_id: 0,
        reorder_point: new GeoPoint(0, 0),
        supplier_info: "",
        tax_category: "",
        weight: 0,
      });
      setImage(null);
    } catch (error) {
      console.error("Error adding product: ", error);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      const updatedData: Partial<ProductData> = {
        ...editingProduct.data,
        last_updated: new Date(),
      };
      await updateDoc(doc(db, "products", editingProduct.id), updatedData);
      setEditingProduct(null);
    } catch (error) {
      console.error("Error updating product: ", error);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, "products", id));
    } catch (error) {
      console.error("Error deleting product: ", error);
    }
  };

  

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Garmets - Cleaning services</h3>

      <form onSubmit={handleAddProduct} className="mb-8">
        <h4 className="text-lg font-medium mb-2">Add New Product</h4>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Product Name"
            value={newProduct.name}
            onChange={(e) =>
              setNewProduct({ ...newProduct, name: e.target.value })
            }
            className="p-2 border rounded"
          />
          <input
            type="number"
            placeholder="Price"
            // value={newProduct.price}
            value={newProduct.price === 0 ? '' : newProduct.price}
            onChange={(e) =>
              setNewProduct({
                ...newProduct,
                price: safeParseFloat(e.target.value),
              })
            }
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Description"
            value={newProduct.description}
            onChange={(e) =>
              setNewProduct({ ...newProduct, description: e.target.value })
            }
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Category (comma-separated)"
            value={newProduct.category?.join(",")}
            onChange={(e) =>
              setNewProduct({
                ...newProduct,
                category: e.target.value.split(","),
              })
            }
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Brand"
            value={newProduct.brand}
            onChange={(e) =>
              setNewProduct({ ...newProduct, brand: e.target.value })
            }
            className="p-2 border rounded"
          />
          <input
            type="number"
            placeholder="Quantity"
            // value={newProduct.quantity}
            value={newProduct.quantity === 0 ? '' : newProduct.quantity}
            onChange={(e) =>
              setNewProduct({
                ...newProduct,
                quantity: parseInt(e.target.value),
              })
            }
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Color"
            value={newProduct.color}
            onChange={(e) =>
              setNewProduct({ ...newProduct, color: e.target.value })
            }
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Size"
            value={newProduct.size}
            onChange={(e) =>
              setNewProduct({ ...newProduct, size: e.target.value })
            }
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="SKU"
            value={newProduct.sku}
            onChange={(e) =>
              setNewProduct({ ...newProduct, sku: e.target.value })
            }
            className="p-2 border rounded"
          />
          <input
            type="number"
            placeholder="Cost Price"
            // value={newProduct.cost_price}
            value={newProduct.cost_price === 0 ? '' : newProduct.cost_price}
            onChange={(e) =>
              setNewProduct({
                ...newProduct,
                cost_price: parseFloat(e.target.value),
              })
            }
            className="p-2 border rounded"
          />
          <input
            type="number"
            placeholder="Discount Price"
            // value={newProduct.discount_price}
            value={newProduct.discount_price === 0 ? '' : newProduct.discount_price}
            onChange={(e) =>
              setNewProduct({
                ...newProduct,
                discount_price: parseFloat(e.target.value),
              })
            }
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Material"
            value={newProduct.material}
            onChange={(e) =>
              setNewProduct({ ...newProduct, material: e.target.value })
            }
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Care Instructions"
            value={newProduct.care_instructions}
            onChange={(e) =>
              setNewProduct({
                ...newProduct,
                care_instructions: e.target.value,
              })
            }
            className="p-2 border rounded"
          />
          <input
            type="number"
            placeholder="Shipping Weight"
            // value={newProduct.shipping_weight}
            value={newProduct.shipping_weight === 0 ? '' : newProduct.shipping_weight}
            onChange={(e) =>
              setNewProduct({
                ...newProduct,
                shipping_weight: parseFloat(e.target.value),
              })
            }
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Available Colors (comma-separated)"
            value={newProduct.available_colors?.join(",")}
            onChange={(e) =>
              setNewProduct({
                ...newProduct,
                available_colors: e.target.value.split(","),
              })
            }
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Available Sizes (comma-separated)"
            value={newProduct.available_sizes?.join(",")}
            onChange={(e) =>
              setNewProduct({
                ...newProduct,
                available_sizes: e.target.value.split(","),
              })
            }
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Tags (comma-separated)"
            value={newProduct.tags?.join(",")}
            onChange={(e) =>
              setNewProduct({ ...newProduct, tags: e.target.value.split(",") })
            }
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Bar Code"
            value={newProduct.bar_code}
            onChange={(e) =>
              setNewProduct({ ...newProduct, bar_code: e.target.value })
            }
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Lead Time"
            value={newProduct.lead_time}
            onChange={(e) =>
              setNewProduct({ ...newProduct, lead_time: e.target.value })
            }
            className="p-2 border rounded"
          />
          <input
            type="number"
            placeholder="Product ID"
            // value={newProduct.product_id}
            value={newProduct.product_id === 0 ? '' : newProduct.product_id}
            onChange={(e) =>
              setNewProduct({
                ...newProduct,
                product_id: parseInt(e.target.value),
              })
            }
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Supplier Info"
            value={newProduct.supplier_info}
            onChange={(e) =>
              setNewProduct({ ...newProduct, supplier_info: e.target.value })
            }
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Tax Category"
            value={newProduct.tax_category}
            onChange={(e) =>
              setNewProduct({ ...newProduct, tax_category: e.target.value })
            }
            className="p-2 border rounded"
          />
          <input
            type="number"
            placeholder="Weight"
            // value={newProduct.weight}
            value={newProduct.weight === 0 ? '' : newProduct.weight}
            onChange={(e) =>
              setNewProduct({
                ...newProduct,
                weight: parseFloat(e.target.value),
              })
            }
            className="p-2 border rounded"
          />
          <input
            type="file"
            onChange={handleImageChange}
            className="p-2 border rounded"
          />
        </div>
        <button
          type="submit"
          className="mt-4 bg-blue-500 hover:bg-blue-700  text-white px-4 py-2 rounded"
        >
          Add Product
        </button>
      </form>

      <h3 className="mb-6 text-xl font-medium">Already supported garmet types</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(({ id, data }) => (
          <div key={id} className="border p-4 rounded">
            <Image
              src={data.img_url}
              priority
              alt="Loading..."
              width={200}
              height={200}
            />
            <h4 className="font-bold mt-2">{data.name}</h4>
            <p className="font-normalbold mb-2">RWF {data.price}</p>
            <hr className="mb-2" />
            <p>Category: {data?.category?.join(", ")}</p>
            <p>Brand: {data.brand}</p>
            <p>Quantity: {data.quantity}</p>
            <p>Color: {data.color}</p>
            <p>Size: {data.size}</p>
            <p>SKU: {data.sku}</p>
            <hr className="mt-2" />
            <div className="flex space-x-4  mt-2">
              <button
                onClick={() => setEditingProduct({ id, data })}
                className="mr-2 text-blue-500 hover:text-blue-700 hover:translate-x-1"
              >
                Edit
              </button>

              <button
                onClick={() => handleDeleteProduct(id)}
                className="text-red-500 hover:text-red-700 hover:translate-x-1"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingProduct && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"
          id="my-modal"
        >
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-2">
              Edit Product
            </h3>
            <form onSubmit={handleUpdateProduct}>
              <input
                type="text"
                value={editingProduct.data.name}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    data: { ...editingProduct.data, name: e.target.value },
                  })
                }
                className="block w-full p-2 mb-2 border rounded"
              />
              <input
                type="number"
                value={editingProduct.data.price}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    data: {
                      ...editingProduct.data,
                      price: parseFloat(e.target.value),
                    },
                  })
                }
                className="block w-full p-2 mb-2 border rounded"
              />
              <input
                type="text"
                value={editingProduct.data.description}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    data: {
                      ...editingProduct.data,
                      description: e.target.value,
                    },
                  })
                }
                className="block w-full p-2 mb-2 border rounded"
              />
              <input
                type="text"
                value={editingProduct.data?.category?.join(",")}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    data: {
                      ...editingProduct.data,
                      category: e.target.value.split(","),
                    },
                  })
                }
                className="block w-full p-2 mb-2 border rounded"
              />
              <input
                type="text"
                value={editingProduct.data.brand}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    data: { ...editingProduct.data, brand: e.target.value },
                  })
                }
                className="block w-full p-2 mb-2 border rounded"
              />
              <input
                type="number"
                value={editingProduct.data.quantity}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    data: {
                      ...editingProduct.data,
                      quantity: parseInt(e.target.value),
                    },
                  })
                }
                className="block w-full p-2 mb-2 border rounded"
              />
              <input
                type="text"
                value={editingProduct.data.color}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    data: { ...editingProduct.data, color: e.target.value },
                  })
                }
                className="block w-full p-2 mb-2 border rounded"
              />
              <input
                type="text"
                value={editingProduct.data.size}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    data: { ...editingProduct.data, size: e.target.value },
                  })
                }
                className="block w-full p-2 mb-2 border rounded"
              />
              <input
                type="text"
                value={editingProduct.data.sku}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    data: { ...editingProduct.data, sku: e.target.value },
                  })
                }
                className="block w-full p-2 mb-2 border rounded"
              />
              <input
                type="number"
                value={editingProduct.data.cost_price}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    data: {
                      ...editingProduct.data,
                      cost_price: parseFloat(e.target.value),
                    },
                  })
                }
                className="block w-full p-2 mb-2 border rounded"
              />
              <input
                type="number"
                value={editingProduct.data.discount_price}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    data: {
                      ...editingProduct.data,
                      discount_price: parseFloat(e.target.value),
                    },
                  })
                }
                className="block w-full p-2 mb-2 border rounded"
              />
              <input
                type="text"
                value={editingProduct.data.material}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    data: { ...editingProduct.data, material: e.target.value },
                  })
                }
                className="block w-full p-2 mb-2 border rounded"
              />
              <input
                type="text"
                value={editingProduct.data.care_instructions}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    data: {
                      ...editingProduct.data,
                      care_instructions: e.target.value,
                    },
                  })
                }
                className="block w-full p-2 mb-2 border rounded"
              />
              <input
                type="number"
                value={editingProduct.data.shipping_weight}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    data: {
                      ...editingProduct.data,
                      shipping_weight: parseFloat(e.target.value),
                    },
                  })
                }
                className="block w-full p-2 mb-2 border rounded"
              />
              <input
                type="text"
                value={editingProduct.data?.available_colors?.join(",")}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    data: {
                      ...editingProduct.data,
                      available_colors: e.target.value.split(","),
                    },
                  })
                }
                className="block w-full p-2 mb-2 border rounded"
              />
              <input
                type="text"
                value={editingProduct.data?.available_sizes?.join(",")}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    data: {
                      ...editingProduct.data,
                      available_sizes: e.target.value.split(","),
                    },
                  })
                }
                className="block w-full p-2 border rounded"
              />
              <input
                type="text"
                value={editingProduct.data?.tags?.join(",")}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    data: {
                      ...editingProduct.data,
                      tags: e.target.value.split(","),
                    },
                  })
                }
                className="block w-full p-2 mb-2 border rounded"
              />
              <input
                type="text"
                value={editingProduct.data.bar_code}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    data: { ...editingProduct.data, bar_code: e.target.value },
                  })
                }
                className="block w-full p-2 mb-2 border rounded"
              />
              <input
                type="text"
                value={editingProduct.data.lead_time}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    data: { ...editingProduct.data, lead_time: e.target.value },
                  })
                }
                className="block w-full p-2 mb-2 border rounded"
              />
              <input
                type="number"
                value={editingProduct.data.product_id}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    data: {
                      ...editingProduct.data,
                      product_id: parseInt(e.target.value),
                    },
                  })
                }
                className="block w-full p-2 mb-2 border rounded"
              />
              <input
                type="text"
                value={editingProduct.data.supplier_info}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    data: {
                      ...editingProduct.data,
                      supplier_info: e.target.value,
                    },
                  })
                }
                className="block w-full p-2 mb-2 border rounded"
              />
              <input
                type="text"
                value={editingProduct.data.tax_category}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    data: {
                      ...editingProduct.data,
                      tax_category: e.target.value,
                    },
                  })
                }
                className="block w-full p-2 mb-2 border rounded"
              />
              <input
                type="number"
                value={editingProduct.data.weight}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    data: {
                      ...editingProduct.data,
                      weight: parseFloat(e.target.value),
                    },
                  })
                }
                className="block w-full p-2 mb-2 border rounded"
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
              >
                Update
              </button>
              <button
                onClick={() => setEditingProduct(null)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
