<script>
import { defineComponent, ref, onMounted } from "vue";

export default defineComponent({
  name: "Products",
  emits: ["add-to-cart"],
  setup(props, { emit}) {
    const products = ref([]);

    onMounted(async () => {
      const result = await fetch("http://localhost:3000/api/products/")
        .then((response) => response.json());

      products.value = result;
    });

    async function updateProducts() {
      const result = await fetch("http://localhost:3000/api/products/")
        .then((response) => response.json());

      products.value = result;
    }

    function addToCart(product) {
      emit("add-to-cart", product);
    }


    return { products, updateProducts, addToCart };
  },
});
</script>

<template>
  <ul class="flex flex-wrap gap-4 m-8">
    <li class="p-5 flex flex-col gap-2" v-for="product in products" :key="product.id">
      <h3 class="text-xl text-center text-accent">{{ product.name }}</h3>
      <img width="100" height="100" loading="lazy" src="https://via.placeholder.com/200x200/31367a/e6e6e6?text=PLACEHOLDER">
      <p class="text-base">{{ product.description }}</p>
      <p>Pris: <span class="text-info text-base">{{ product.price }}</span></p>
      <p>Lager: <span class="text-info">{{ product.lager }}</span></p>
      <button class="btn btn-outline btn-success" @click="addToCart(product)">Lägg I Varukorg</button>
    </li>
  </ul>

</template>

<style scoped>
 li {
  background-color: rgb(32, 68, 101);
  border-radius: 10px;
 }
 img {
  margin: 0 auto;
 }
</style>