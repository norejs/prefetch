<template>
  <div class="page">
    <h2>Products</h2>
    <div v-if="loading">Loading products...</div>
    <div v-else-if="error">Error: {{ error }}</div>
    <div v-else class="products-grid">
      <div v-if="products && products.length > 0">
        <div v-for="product in products" :key="product.id" class="product-card">
          <h3>{{ product.name }}</h3>
          <p>{{ product.description }}</p>
          <p class="price">${{ product.price }}</p>
        </div>
      </div>
      <p v-else>No products available.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Products',
  data() {
    return {
      products: [],
      loading: true,
      error: null
    }
  },
  mounted() {
    fetch('http://localhost:18001/api/products')
      .then(response => response.json())
      .then(data => {
        this.products = Array.isArray(data) ? data : [];
        this.loading = false;
      })
      .catch(err => {
        this.error = err.message;
        this.loading = false;
      });
  }
}
</script>
