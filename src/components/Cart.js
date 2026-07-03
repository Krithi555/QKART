import {
  AddOutlined,
  RemoveOutlined,
  ShoppingCart,
  ShoppingCartOutlined,
} from "@mui/icons-material";
import { Button, IconButton, Stack } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";
import { useHistory } from "react-router-dom";
import "./Cart.css";

// ❗ NO checkout code here – only navigation



export const generateCartItemsFrom = (cartData, productsData) => {

  console.log("cartData:", cartData);
  console.log("productsData:", productsData);


  if (!cartData || !productsData) return [];

  return cartData.map((cartItem) => {

    // 🔥 MUST MATCH WITH _id (as per test mock)
    const product = productsData.find(
      (p) => p._id === cartItem.productId
    );

    // If product not found, return minimal
    if (!product) {
      return {
        productId: cartItem.productId,
        qty: cartItem.qty,
        name: "",
        image: "",
        cost: 0,
      };
    }

    return {
      productId: cartItem.productId,
      qty: cartItem.qty,

      // 🔥 THESE FIELDS ARE MANDATORY FOR TEST
      name: product.name,
      image: product.image,
      cost: product.cost,
    };
  });
};

export const getTotalItems = (items = []) => {
  return items.reduce((sum, item) => sum + item.qty, 0);
};



export const getTotalCartValue = (items = []) => {
  if (!items.length) return 0;

  return items.reduce(
    (total, item) => total + item.cost * item.qty,
    0
  );
};

const ItemQuantity = ({
  value,
  handleAdd,
  handleDelete,
  isReadOnly,
}) => {
  if (isReadOnly) {
    return <Box padding="0.5rem">Qty: {value}</Box>;
  }

  return (
    <Stack direction="row" alignItems="center">
      <IconButton size="small" color="primary" onClick={handleDelete}>
        <RemoveOutlined />
      </IconButton>

      <Box padding="0.5rem" data-testid="item-qty">
        {value}
      </Box>

      <IconButton size="small" color="primary" onClick={handleAdd}>
        <AddOutlined />
      </IconButton>
    </Stack>
  );
};

const Cart = ({
  items = [],
  handleQuantity,
  isReadOnly = false,
}) => {
  const history = useHistory();

  if (!items.length) {
    return (
      <Box className="cart empty">
        <ShoppingCartOutlined className="empty-cart-icon" />
        <Box color="#aaa" textAlign="center">
          Cart is empty. Add more items to the cart to checkout.
        </Box>
      </Box>
    );
  }
  console.log("Items inside Cart:", items);


  return (
    <Box className="cart">
      {items.map((item) => (
        <Box
          key={item.productId}
          display="flex"
          alignItems="center"
          padding="1rem"
          className="cart-item"
        >
          <Box className="cart-item-image">
            <img src={item.image} alt={item.name} width="100%" />
          </Box>

          <Box ml={2} width="100%">
            <Box fontWeight="600">{item.name}</Box>

            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <ItemQuantity
                value={item.qty}
                isReadOnly={isReadOnly}
                handleAdd={() =>
                  handleQuantity &&
                  handleQuantity(item.productId, item.qty + 1)
                }
                handleDelete={() =>
                  handleQuantity &&
                  handleQuantity(item.productId, item.qty - 1)
                }
              />

              <Box fontWeight="600">{`$${item.cost}`}</Box>

            </Box>
          </Box>
        </Box>
      ))}

      

      {/* 🔥 ONLY NAVIGATION TO CHECKOUT.JS */}
      {isReadOnly ? (
  <Box padding="1rem">
    <Box fontWeight="700" mb={1}>
      Order Details
    </Box>

    <Box display="flex" justifyContent="space-between">
      <Box>Products</Box>
      <Box>{getTotalItems(items)}</Box>
    </Box>

    <Box display="flex" justifyContent="space-between">
      <Box>Subtotal</Box>
      <Box>${getTotalCartValue(items)}</Box>
    </Box>

    <Box display="flex" justifyContent="space-between">
      <Box>Shipping</Box>
      <Box>$0</Box>
    </Box>

    <Box
      display="flex"
      justifyContent="space-between"
      fontWeight="700"
      mt={1}
    >
      <Box>Total</Box>
      <Box>${getTotalCartValue(items)}</Box>
    </Box>
  </Box>
) : (
  <>
    <Box
      padding="1rem"
      display="flex"
      justifyContent="space-between"
      alignItems="center"
    >
      <Box>Order total</Box>

      <Box
        fontWeight="700"
        fontSize="1.5rem"
        data-testid="cart-total"
      >
        ${getTotalCartValue(items)}
      </Box>
    </Box>

    <Box display="flex" justifyContent="flex-end">
      <Button
        color="primary"
        variant="contained"
        startIcon={<ShoppingCart />}
        onClick={() =>
          history.push({
            pathname: "/checkout",
            state: { items },
          })
        }
      >
        Checkout
      </Button>
    </Box>
  </>
)}
    </Box>
  );
};

export default Cart;
