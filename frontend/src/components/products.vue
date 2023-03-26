<script>
import { defineComponent, ref, onMounted, computed } from "vue";

export default defineComponent({
  name: "Products",
  emits: ["add-to-cart"],
  setup(props, { emit }) {
    const products = ref([]);
    const categories = ref([]);
    const sortedProducts = ref();
    const selectedCategoryId = ref("");
    onMounted(async () => {
      try {
        const result = await fetch("http://localhost:3000/api/products/").then(
          (response) => response.json()
        );

        products.value = result;
        sortedProducts.value = sortProducts(products.value, categories.value);
      } catch (error) {
        console.log(error);
      }

      try {
        const fetchResult = await fetch(
          "http://localhost:3000/api/categories/"
        ).then((response) => response.json());

        categories.value = fetchResult;
      } catch (error) {
        console.log(error);
      }
    });

    async function updateProducts() {
      const result = await fetch("http://localhost:3000/api/products/").then(
        (response) => response.json()
      );

      products.value = result;
    }

    function addToCart(product) {
      emit("add-to-cart", product);
    }

    return {
      products,
      updateProducts,
      addToCart,
      selectedCategoryId,
      categories,
    };
  },
});
</script>

<template>
  <div>
    <h1 class="text-4xl text-center my-4">Produkter</h1>
    <div class="flex items-center">
      <label class="text-xl text-neutral text-center my-4 mr-4"
        >Välj Kategori:</label
      >
      <select
        class="select select-info w-full max-w-xs"
        v-model="selectedCategoryId"
      >
        <option value="">Alla</option>
        <option v-for="category in categories" :value="category._id">
          {{ category.name }}
        </option>
      </select>
    </div>
    <section class="flex flex-wrap">
      <div v-for="category in categories" :key="category._id">
        <h2 class="text-2xl text-center my-4">{{ category.name }}</h2>
        <ul class="flex flex-wrap gap-4 m-8">
          <li
            class="p-5 flex flex-col gap-2 shadow-2xl"
            v-for="product in products.filter(
              (product) => product.category === category._id
            )"
            :key="product._id"
          >
            <h3 class="text-xl text-center text-accent">{{ product.name }}</h3>
            <img
              width="100"
              height="100"
              loading="lazy"
              src="https://via.placeholder.com/200x200/31367a/e6e6e6?text=PLACEHOLDER"
            />
            <p class="text-base">{{ product.description }}</p>
            <p>
              Pris: <span class="text-info text-base">{{ product.price }}</span>
            </p>
            <p>
              Lager: <span class="text-info">{{ product.lager }}</span>
            </p>
            <button
              class="btn btn-outline btn-success"
              @click="addToCart(product)"
            >
              Lägg I Varukorg
            </button>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<style scoped>
li {
  background-color: rgba(28, 48, 79, 0.604);
  border-radius: 10px;
}
img {
  margin: 0 auto;
}
</style>
