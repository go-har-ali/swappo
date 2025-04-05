// context/CartContext.js
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const token = localStorage.getItem("token"); // Replace this with your auth context if needed

  const api = axios.create({
    baseURL: "http://localhost:5000/api/cart",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Load cart from backend on mount
  useEffect(() => {
    if (token) {
      api
        .get("/")
        .then((res) => setCart(res.data.items || []))
        .catch((err) => console.error("Failed to fetch cart", err));
    }
  }, [token]);

  const addToCart = async (product) => {
    try {
      const res = await api.post("/add", {
        productId: product._id,
        quantity: 1,
      });

      setCart(res.data.items);
    } catch (err) {
      console.error("Error adding to cart", err);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const res = await api.delete(`/remove/${productId}`);
      setCart(res.data.items);
    } catch (err) {
      console.error("Error removing item", err);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const res = await api.put("/update", {
        productId,
        quantity,
      });

      setCart(res.data.items);
    } catch (err) {
      console.error("Error updating quantity", err);
    }
  };

  const clearCart = async () => {
    try {
      await api.delete("/clear");
      setCart([]);
    } catch (err) {
      console.error("Error clearing cart", err);
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

// import { createContext, useContext, useState } from "react";

// const CartContext = createContext();

// // Custom hook to use the cart context
// export const useCart = () => useContext(CartContext);

// export const CartProvider = ({ children }) => {
//   const [cart, setCart] = useState([]);

//   const addToCart = (product) => {
//     setCart((prevCart) => {
//       const existingItem = prevCart.find((item) => item.id === product.id);
//       let updatedCart;

//       if (existingItem) {
//         updatedCart = prevCart.map((item) =>
//           item.id === product.id
//             ? { ...item, quantity: item.quantity + 1 }
//             : item
//         );
//       } else {
//         updatedCart = [...prevCart, { ...product, quantity: 1 }];
//       }

//       localStorage.setItem("cart", JSON.stringify(updatedCart)); // Sync with localStorage
//       return updatedCart;
//     });
//   };

//   // Remove item from cart
//   const removeFromCart = (id) => {
//     setCart((prevCart) => prevCart.filter((item) => item.id !== id));
//   };

//   // Update item quantity
//   const updateQuantity = (id, quantity) => {
//     setCart((prevCart) =>
//       prevCart.map((item) => (item.id === id ? { ...item, quantity } : item))
//     );
//   };

//   // Clear cart
//   const clearCart = () => {
//     setCart([]);
//   };

//   return (
//     <CartContext.Provider
//       value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}
//     >
//       {children}
//     </CartContext.Provider>
//   );
// };
