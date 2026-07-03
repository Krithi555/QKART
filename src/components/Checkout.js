import { CreditCard, Delete } from "@mui/icons-material";
import {
  Button,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { config } from "../App";
import Cart, {
  getTotalCartValue,
  generateCartItemsFrom,
} from "./Cart";
import "./Checkout.css";
import Footer from "./Footer";
import Header from "./Header";

const AddNewAddressView = ({
  token,
  newAddress,
  handleNewAddress,
  addAddress,
}) => {
  return (
    <Box display="flex" flexDirection="column" mt="1rem">
      <TextField
        multiline
        minRows={4}
        placeholder="Enter your complete address"
        fullWidth
        value={newAddress.value}
        onChange={(e) =>
          handleNewAddress((prev) => ({
            ...prev,
            value: e.target.value,
          }))
        }
      />

      <Stack direction="row" spacing={2} mt="1rem">
        <Button
          variant="contained"
          onClick={() => addAddress(token, newAddress)}
        >
          Add
        </Button>

        <Button
          variant="outlined"
          onClick={() =>
            handleNewAddress({
              isAddingNewAddress: false,
              value: "",
            })
          }
        >
          Cancel
        </Button>
      </Stack>
    </Box>
  );
};


const Checkout = () => {
  const token = localStorage.getItem("token");
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();

  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [addresses, setAddresses] = useState({
    all: [],
    selected: "",
  });
  const [newAddress, setNewAddress] = useState({
    isAddingNewAddress: false,
    value: "",
  });

  // Fetch products
  const getProducts = async () => {
    try {
      const response = await axios.get(
        `${config.endpoint}/products`
      );
      setProducts(response.data);
      return response.data;
    } catch (e) {
      if (e.response && e.response.status === 500) {
        enqueueSnackbar(e.response.data.message, {
          variant: "error",
        });
        return null;
      } else {
        enqueueSnackbar(
          "Could not fetch products. Check that the backend is running, reachable and returns valid JSON.",
          { variant: "error" }
        );
      }
    }
  };

  // Fetch cart
  const fetchCart = async (token) => {
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
        "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
        { variant: "error" }
      );
      return null;
    }
  };

  // Fetch addresses
  const getAddresses = React.useCallback(async (token) => {
    if (!token) return;
  
    try {
      const response = await axios.get(
        `${config.endpoint}/user/addresses`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      setAddresses((prev) => ({
        ...prev,
        all: response.data,
      }));
  
      return response.data;
    } catch {
      enqueueSnackbar(
        "Could not fetch addresses. Check that the backend is running, reachable and returns valid JSON.",
        { variant: "error" }
      );
      return null;
    }
  }, [enqueueSnackbar]);
  

  const addAddress = async (token, newAddress) => {
    try {
      const response = await axios.post(
        `${config.endpoint}/user/addresses`,
        { address: newAddress.value },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      setAddresses((prev) => ({
        ...prev,
        all: response.data,
      }));
      
      setNewAddress({
        isAddingNewAddress: false,
        value: "",
      });
  
      return response.data;
    } catch (e) {
      if (e.response) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not add this address. Check that the backend is running.",
          { variant: "error" }
        );
      }
    }
  };

  const deleteAddress = async (token, addressId) => {
    try {
      const response = await axios.delete(
        `${config.endpoint}/user/addresses/${addressId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      setAddresses((prev) => ({
        ...prev,
        all: response.data,
      }));
      
  
      return response.data;
    } catch (e) {
      if (e.response) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not delete this address. Check that the backend is running, reachable and returns valid JSON.",
          { variant: "error" }
        );
      }
    }
  };
  

  const validateRequest = (items, addresses) => {
    const totalValue = getTotalCartValue(items);
    const balance = Number(localStorage.getItem("balance"));
  
    if (totalValue > balance) {
      enqueueSnackbar(
        "You do not have enough balance in your wallet for this purchase",
        { variant: "warning" }
      );
      return false;
    }
  
    if (!addresses.all.length) {
      enqueueSnackbar(
        "Please add a new address before proceeding.",
        { variant: "warning" }
      );
      return false;
    }
  
    if (!addresses.selected) {
      enqueueSnackbar(
        "Please select one shipping address to proceed.",
        { variant: "warning" }
      );
      return false;
    }
  
    return true;
  };
  

  const performCheckout = async (token, items, addresses) => {
    if (!validateRequest(items, addresses)) return false;
  
    try {
      const response = await axios.post(
        `${config.endpoint}/cart/checkout`,
        { addressId: addresses.selected },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (response.data.success) {
        enqueueSnackbar("Order placed successfully!", {
          variant: "success",
        });
  
        history.push("/thanks");
        return true;
      }
    } catch (e) {
      if (e.response) {
        enqueueSnackbar(e.response.data.message, {
          variant: "error",
        });
      } else {
        enqueueSnackbar(
          "Could not place order.",
          { variant: "error" }
        );
      }
    }
  
    return false;
  };
  

  // Load products + cart
  useEffect(() => {
    const onLoadHandler = async () => {
      const productsData = await getProducts();
      const cartData = await fetchCart(token);

      if (productsData && cartData) {
        const cartDetails = generateCartItemsFrom(
          cartData,
          productsData
        );
        setItems(cartDetails);
      }
    };

    onLoadHandler();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2️⃣ Check login + fetch addresses
  useEffect(() => {
    if (!token) {
      enqueueSnackbar(
        "You must be logged in to access checkout page",
        { variant: "info" }
      );
      history.push("/login");
      return;
    }
  
    getAddresses(token);
  }, [token, enqueueSnackbar, history, getAddresses]);
  


  return (
    <>
      <Header />

      <Grid container>
        <Grid item xs={12} md={9}>
          <Box
            className="shipping-container"
            minHeight="100vh"
          >
            <Typography variant="h4" my="1rem">
              Shipping
            </Typography>

            <Typography my="1rem">
              Manage all the shipping addresses you want.
              Select the address you want to get your order
              delivered.
            </Typography>

            <Divider />

            <Box mt="1rem">
  {addresses.all.length === 0 ? (
    <Typography my="1rem">
      No addresses found for this account. Please add one to proceed
    </Typography>
  ) : (
    addresses.all.map((address) => (
      <Box
        key={address._id}
        border="1px solid #ccc"
        padding="1rem"
        my="0.5rem"
        sx={{
          cursor: "pointer",
          backgroundColor:
            addresses.selected === address._id
              ? "#E9F5E1"
              : "transparent",
        }}
        onClick={() =>
          setAddresses((prev) => ({
            ...prev,
            selected: address._id,
          }))
        }
      >
        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
        >
          <Grid item xs={10}>
            <Typography whiteSpace="pre-line">
              {address.address}
            </Typography>
          </Grid>

          <Grid item xs={2}>
            <Button
              startIcon={<Delete />}
              color="secondary"
              onClick={(e) => {
                e.stopPropagation();
                deleteAddress(token, address._id);
              }}
            >
              DELETE
            </Button>
          </Grid>
        </Grid>
      </Box>
    ))
  )}
</Box>

{!newAddress.isAddingNewAddress ? (
  <Button
    color="primary"
    variant="contained"
    id="add-new-btn"
    size="large"
    onClick={() =>
      setNewAddress((curr) => ({
        ...curr,
        isAddingNewAddress: true,
      }))
    }
  >
    ADD NEW ADDRESS
  </Button>
) : (
  <AddNewAddressView
    token={token}
    newAddress={newAddress}
    handleNewAddress={setNewAddress}
    addAddress={addAddress}
  />
)}

            <Typography variant="h4" my="1rem">
              Payment
            </Typography>

            <Divider />

            <Box my="1rem">
              <Typography>Wallet</Typography>
              <Typography>
                Pay ${getTotalCartValue(items)} of
                available $
                {localStorage.getItem("balance")}
              </Typography>
            </Box>
            <Button
  startIcon={<CreditCard />}
  variant="contained"
  onClick={() => performCheckout(token, items, addresses)}
>
  PLACE ORDER
</Button>
          </Box>
        </Grid>

        <Grid item xs={12} md={3} bgcolor="#E9F5E1">
          <Cart
            isReadOnly
            products={products}
            items={items}
          />
        </Grid>
      </Grid>

      <Footer />
    </>
  );
};

export default Checkout;
