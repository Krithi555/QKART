import { AddShoppingCartOutlined } from "@mui/icons-material";
import { Button, Card, CardActions, CardContent, CardMedia, Rating, Typography } from "@mui/material";
import React from "react";
import "./ProductCard.css";

const ProductCard = ({ product, handleAddToCart }) => {
  return (
    <Card className="card">
      {/* Product Image */}
      <CardMedia
        component="img"
        height="200"
        image={product.image}
        alt={product.name}
      />

      {/* Product Details */}
      <CardContent>
        <Typography variant="h6">{product.name}</Typography>
        <Typography color="textSecondary">{product.category}</Typography>
        <Typography variant="h6" color="primary">
          ${product.cost}
        </Typography>
        <Rating value={product.rating} readOnly />
      </CardContent>

      {/* Add to Cart Button - ✅ CHECKPOINT 1: Test-ready attributes */}
      <CardActions>
        <Button
          role="button"
          data-testid="add-to-cart-btn"
          variant="contained"
          fullWidth
          startIcon={<AddShoppingCartOutlined />}
          onClick={() => handleAddToCart(product._id)}  // ✅ Pass _id only
        >
          ADD TO CART
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;
