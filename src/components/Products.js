import { Search, SentimentDissatisfied } from "@mui/icons-material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import ProductCard from "./ProductCard";
import Cart, { generateCartItemsFrom } from "./Cart";
import "./Products.css";

const Products = () => {

  // ===================== STATES =====================
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState(0);

  const [cartItems, setCartItems] = useState([]);

  const { enqueueSnackbar } = useSnackbar();

  // ===================== FETCH CART =====================
  const fetchCart = React.useCallback(async (token) => {
    if (!token) return;
  
    try {
      const response = await axios.get(
        `${config.endpoint}/cart`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      return response.data;
    } catch {
      enqueueSnackbar(
        "Could not fetch cart details.",
        { variant: "error" }
      );
      return null;
    }
  }, [enqueueSnackbar]);

  // ===================== LOAD ALL PRODUCTS =====================
  const performAPICall = React.useCallback(async () => {
    try {
      setLoading(true);

      const response = await axios.get(`${config.endpoint}/products`);

      setProducts(response.data);

      return response.data;

    } catch (error) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to load products",
        { variant: "error" }
      );

      return [];

    } finally {
      setLoading(false);
    }
  },[enqueueSnackbar]);

  // ===================== SEARCH API =====================
  const performSearch = async (text) => {
    try {
      setLoading(true);

      if (text === "") {
        performAPICall();
        return;
      }

      const response = await axios.get(
        `${config.endpoint}/products/search?value=${text}`
      );

      setProducts(response.data);

    } catch (error) {
      if (error.response && error.response.status === 404) {
        setProducts([]);
      } else {
        enqueueSnackbar(
          error.response?.data?.message || "Search failed",
          { variant: "error" }
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ===================== DEBOUNCE =====================
  const debounceSearch = (event, debounceTimeout) => {
    const value = event.target.value;

    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    const timeout = setTimeout(() => {
      performSearch(value);
    }, 500);

    setDebounceTimeout(timeout);
  };

  

  const isItemInCart = (items, productId) => {
    return items.findIndex((item) => item.productId === productId) !== -1;
  };

  const addToCart = async (token, items, products, productId, qty) => {
    console.log("🔥 CHECKPOINT 2: addToCart called:", { token: !!token, productId, qty });

    if (!token) {
      console.log("❌ CHECKPOINT 3: No token");
      enqueueSnackbar("Login to add an item to the Cart", { variant: "warning" });
      return;
    }

    if (qty === 1 && isItemInCart(items, productId)) {
      console.log("⚠️ CHECKPOINT 4: Duplicate check passed");
      enqueueSnackbar(
        "Item already in cart. Use the cart sidebar to update quantity or remove item.",
        { variant: "warning" }
      );
      return;
    }

    try {
      console.log("🌐 CHECKPOINT 5: POST /cart API call...");
      const response = await axios.post(
        `${config.endpoint}/cart`,
        { productId, qty },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log("✅ CHECKPOINT 6: API Response:", response.data);
      const updatedCart = generateCartItemsFrom(response.data, products);
      setCartItems(updatedCart);
      console.log("🛒 CHECKPOINT 7: Cart updated:", updatedCart);
      
    } catch (e) {
      console.error("❌ CHECKPOINT 8: API Error:", e.response?.data);
      enqueueSnackbar(e.response?.data?.message || "Could not update cart", { variant: "error" });
    }
  };

  // ✅ CHECKPOINT 9: Enhanced handleQuantity
  const handleQuantity = async (productId, qty) => {
    console.log("➕➖ CHECKPOINT 9: Quantity change:", { productId, qty });
    const token = localStorage.getItem("token");
    await addToCart(token, cartItems, products, productId, qty);
  };

  // ===================== LOAD ON OPEN =====================
  const token = localStorage.getItem("token");
  useEffect(() => {

    const onLoad = async () => {
     
  
      // 1️⃣ Load products first
      const productsData = await performAPICall();
  
      // 2️⃣ Load cart
      if (token) {
        const cartData = await fetchCart(token);
  
        const completeCart = generateCartItemsFrom(cartData, productsData);

        console.log(completeCart);
  
        setCartItems(completeCart);
      }
    };
  
    onLoad();
  }, [token, fetchCart, performAPICall]);
  
  

  // ===================== SEARCH BOX JSX =====================
  const searchBox = (
    <TextField
      className="search-desktop"
      size="small"
      fullWidth
      placeholder="Search for items/categories"
      name="search"
      onChange={(e) => debounceSearch(e, debounceTimeout)}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <Search color="primary" />
          </InputAdornment>
        ),
      }}
    />
  );

  return (
    <div>

      <Header>
        {searchBox}
      </Header>

      <TextField
        className="search-mobile"
        size="small"
        fullWidth
        placeholder="Search for items/categories"
        name="search"
        onChange={(e) => debounceSearch(e, debounceTimeout)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
      />

      <Grid container>
        <Grid item className="product-grid">
          <Box className="hero">
            <p className="hero-heading">
              India’s <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
              to your door step
            </p>
          </Box>
        </Grid>
      </Grid>

      <Grid container>

        {/* PRODUCTS */}
        <Grid item xs={12} md={9}>

          {loading ? (
            <Box display="flex" flexDirection="column" alignItems="center" mt={5}>
              <CircularProgress />
              <p>Loading Products</p>
            </Box>

          ) : (

            <Grid container spacing={2} className="product-grid">

              {products.length > 0 ? (
                products.map((item) => (
                  <Grid item xs={6} md={3} key={item._id}>
                   <ProductCard
      product={item}
      handleAddToCart={(productId) => {  // ✅ Fixed: receives productId
        console.log("📦 CHECKPOINT 1: Button clicked for:", productId);
        addToCart(
          localStorage.getItem("token"),
          cartItems,
          products,
          productId,  // ✅ Use passed ID
          1
        );
      }}
    />
                  </Grid>
                ))
              ) : (
                <Box className="loading">
                  <SentimentDissatisfied />
                  <p>No products found</p>
                </Box>
              )}

            </Grid>
          )}

        </Grid>

        {/* -------- CART SECTION -------- */}
        {localStorage.getItem("token") && (
          <Grid item xs={12} md={3}>
            <Cart
              items={cartItems}
              handleQuantity={handleQuantity}
            />
          </Grid>
        )}

      </Grid>

      <Footer />
    </div>
  );
};

export default Products;
