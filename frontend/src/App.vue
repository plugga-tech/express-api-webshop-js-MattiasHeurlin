<script>
import products from "./components/products.vue";

import { defineComponent, reactive, ref, onMounted, computed } from "vue";

export default defineComponent({
  name: "App",
  components: {
    products,
  },
  setup() {
    const state = reactive({
      orderHistory: [],
      loggedin: false, 
      createUser: false,
      wrongLogin: false,
      emptyfields: false,
      passwordNotMatch: false,
      userCreated: false,
      orderHistory: false,
      updateCart:  0,
    });

    const currenCart = ref([]);
    const user = ref(null);
    const isCartEmpty = computed(() => currenCart.value.length === 0);

    const orderHistory = ref([]);

    const username = ref("");
    const email = ref("");
    const password = ref("");

    const newUsername = ref("");
    const newEmail = ref("");
    const newPassword = ref("");
    const newConfirmPassword = ref("");

    onMounted(() => {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      currenCart.value = cart;
    });

    async function loginAttempt() {
      if (email.value === "" || password.value === "") {
        state.emptyfields = true;
        state.wrongLogin = false;
        return;
      }
      try {
        const response = await fetch("http://localhost:3000/api/users/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.value,
            password: password.value,
          }),
        });

        if (response.status === 401 || response.status === 404) {
          state.emptyfields = false;
          state.wrongLogin = true;
          password.value = "";
          return;
        }

        if (!response.ok) {
          console.log("Error" + response.status);
          password.value = "";
          return;
        }
        const data = await response.json();

        state.wrongLogin = false;
        state.emptyfields = false;
        state.loggedin = true;
        user.value = data;
        email.value = "";
        password.value = "";

        console.log("Logged In User:", data);
      } catch (err) {
        console.error("Error:", err);
      }
    }

    async function createUser() {
      if (
        newUsername.value === "" ||
        newEmail.value === "" ||
        newPassword.value === "" ||
        newConfirmPassword.value === ""
      ) {
        state.emptyfields = true;
        return;
      }
      if (newPassword.value !== newConfirmPassword.value) {
        state.passwordNotMatch = true;
        return;
      }
      try {
        const response = await fetch("http://localhost:3000/api/users/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: newUsername.value,
            email: newEmail.value,
            password: newPassword.value,
          }),
        });
        if (!response.ok) {
          console.log("Error");
          return;
        }
        const data = await response.json();

        console.log("New User:", data);
        state.createUser = false;
        state.emptyfields = false;
        state.passwordNotMatch = false;
        newUsername.value = "";
        newEmail.value = "";
        newPassword.value = "";
        newConfirmPassword.value = "";
        state.userCreated = true;
      } catch (err) {
        console.error("Error:", err);
      }
    }

    function addProductToCart(product) {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      const productInCart = cart.find((item) => item._id === product._id);
      currenCart.value = cart;

      if (productInCart) {
        productInCart.quantity++;
      } else {
        cart.push({ ...product, quantity: 1 });
      }
      console.log("Cart:", cart);
      localStorage.setItem("cart", JSON.stringify(cart));
    }

    function removeProductFromCart(product) {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      const productInCart = cart.find((item) => item._id === product._id);
      currenCart.value = cart;

      if (productInCart) {
        productInCart.quantity--;
        if (productInCart.quantity === 0) {
          cart.splice(cart.indexOf(productInCart), 1);
        }
      }
      console.log("Cart:", cart);
      localStorage.setItem("cart", JSON.stringify(cart));
    }

    async function sendOrder() {
      const cart = JSON.parse(localStorage.getItem("cart"));
      try {
        const response = await fetch("http://localhost:3000/api/orders/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user: user.value._id,
            products: cart,
          }),
        });
        if (!response.ok) {
          console.log("Error" + response.status);
          return;
        }
        const data = await response.json();

        console.log("New Order:", data);
        localStorage.removeItem("cart");
        currenCart.value = [];
        state.updateCart++;
      } catch (err) {
        console.error("Error:", err);
      }
    }

    async function getOrderHistory() {
      const token = import.meta.env.VITE_API_KEY;
      try {
        const response = await fetch("http://localhost:3000/api/orders/user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user: user.value._id,
            token: token,
          }),
        });
        if (!response.ok) {
          console.log("Error" + response.status);
          return;
        }
        const data = await response.json();
        orderHistory.value = data;
        state.orderHistory = true;
        console.log(state.orderHistory)
        console.log("Order History:", data);
      } catch (err) {
        console.error("Error:", err);
      }
    }

    return {
      state,
      username,
      email,
      password,
      loginAttempt,
      newUsername,
      newEmail,
      newPassword,
      newConfirmPassword,
      createUser,
      addProductToCart,
      currenCart,
      user,
      removeProductFromCart,
      sendOrder,
      isCartEmpty,
      getOrderHistory,
      orderHistory,
    };
  },
});
</script>

<template>
  <main>
    <header class="flex justify-center content-center">
      <h1 class="text-4xl text-info">WebShop</h1>
    </header>
    <section class="p-8 w-1/2 loginPage shadow-2xl" v-if="!state.loggedin">
      <div class="w-full h-full flex justify-center content-center">
        <div
          v-if="!state.createUser"
          class="flex flex-col justify-center gap-2 text-center"
        >
          <h2 class="text-4xl mb-2 text-primary">Login</h2>
          <div class="flex flex-col loginform">
            <label class="text-accent text-xl" for="username">Email:</label>
            <input
              type="text"
              id="email"
              name="email"
              placeholder="Din Email"
              v-model="email"
              class="input input-bordered input-info w-full max-w-xs"
            />
            <label class="text-accent text-xl" for="password">Lösenord:</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Lösenord"
              v-model="password"
              class="input input-bordered input-info w-full max-w-xs"
            />
          </div>
          <div v-if="state.userCreated" class="alert alert-success shadow-lg">
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="stroke-current flex-shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Användare Skapad: Vänligen Logga in.</span>
            </div>
          </div>
          <div
            v-if="state.emptyfields || state.wrongLogin"
            class="alert alert-warning shadow-lg"
          >
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="stroke-current flex-shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span
                >Varning:
                <span v-if="!state.emptyfields"
                  >Fel Inloggnings Uppgifter!</span
                >
                <span v-if="state.emptyfields">Fälten Är Tomma!</span>
              </span>
            </div>
          </div>
          <button
            @click="loginAttempt()"
            class="mt-2 btn btn-outline btn-primary"
          >
            Logga in
          </button>
          <button class="mt-4" @click="state.createUser = true">
            Skapa Ny Användare
          </button>
        </div>
        <div
          v-if="state.createUser"
          class="flex flex-col justify-center text-center"
        >
          <h2 class="text-2xl mb-4">Skapa Ny Användare:</h2>
          <div class="flex flex-col gap-2">
            <label class="text-accent" for="username"
              >Användarnamn:
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Användarnamn"
                v-model="newUsername"
                class="input input-bordered input-info w-full max-w-xs"
              />
            </label>

            <label class="text-accent" for="email"
              >E-post:
              <input
                type="email"
                id="email"
                name="email"
                placeholder="E-post"
                v-model="newEmail"
                class="input input-bordered input-info w-full max-w-xs"
              />
            </label>
            <label class="text-accent" for="password"
              >Lösenord:
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Lösenord"
                v-model="newPassword"
                class="input input-bordered input-info w-full max-w-xs"
              />
            </label>
            <label class="text-accent" for="password"
              >Bekräfta Lösenord:
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Lösenord"
                v-model="newConfirmPassword"
                class="input input-bordered input-info w-full max-w-xs"
              />
            </label>
            <div
              v-if="state.emptyfields || state.passwordNotMatch"
              class="alert alert-warning shadow-lg"
            >
              <div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="stroke-current flex-shrink-0 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span>
                  Varning:
                  <span v-if="state.passwordNotMatch"
                    >Lösenorden Matcher inte!</span
                  >
                  <span v-if="!state.passwordNotMatch">Fälten Är Tomma!</span>
                </span>
              </div>
            </div>
            <button @click="createUser()" class="btn btn-outline btn-success">
              Skapa Användare
            </button>
          </div>
          <button @click="state.createUser = false" class="mt-4">
            Tillbaka Till Login
          </button>
        </div>
      </div>
    </section>
    <section v-if="state.loggedin && !state.orderHistory" class="flex w-full mainSection relative">
      <div class="flex flex-col gap-6 cartSection">
        <div>
          <h2 class="text-3xl text-primary">Varukorg:</h2>
        </div>
        <div class="flex flex-col gap-4">
          <ul class="flex flex-col gap-4">
            <li
              class="flex gap-2 orderItems items-center justify-between"
              v-for="product in currenCart"
              :key="product.id"
            >
              <p class="text-info">
                {{ product.name }}
              </p>
              <p>Pris: {{ product.price }}kr</p>
              <p>
                Antal: <span class="text-info"> {{ product.quantity }} </span>
              </p>
              <button>
                <i
                  class="fa-solid fa-plus text-success text-xl"
                  @click="addProductToCart(product)"
                >
                </i>
              </button>
              <button>
                <i
                  class="fa-solid fa-minus text-error text-xl"
                  @click="removeProductFromCart(product)"
                >
                </i>
              </button>
            
            </li>
          </ul>

          <button
            :disabled="isCartEmpty"
            class="btn btn-success text-base"
            @click="sendOrder"
          >
            Skicka Order
          </button>
        </div>
        <button
          @click="getOrderHistory"
          class="text-base btn btn-outline btn-info"
        >
          Se Order Historik
        </button>
      </div>
      <div class="flex flex-col products">
        <h2 class="text-3xl mt-4 text-primary">
          Välkommen {{ user.userName }}
        </h2>
        <h3 class="text-2xl mt-4 text-info">Produkter:</h3>
        <products :key="state.updateCart" @add-to-cart="addProductToCart"></products>
      </div>
      <button @click="state.loggedin = false" class="absolute top-6 right-10 text-error text-xl">LOGGA UT</button>
    </section>

    <article v-if="state.orderHistory" class="orderHistory">
      <div> <!-- Vet att dessa borde ligga i en component, hinner ej -->
        <h2 class="text-3xl text-primary mt-4 mb-6">Order Historik:</h2>
        <ul class="flex gap-4 flex-wrap orderHistoryList">
          <li
            class="flex flex-col orderHistoryItem p-4 rounded-md shadow-md mb-4"
            v-for="order in orderHistory"
          >
            <p class="font-semibold">
              Order ID: <br />
            <span class="text-info">  {{ order._id }}</span>
            </p>
            <p class="font-semibold">Order Produkter:</p>

            <ul class="flex flex-col gap-2">
              <li class="p-2 rounded-md" v-for="product in order.products">
                <div class="flex flex-col gap-1">
                  <p>
                    Produkt Namn:
                    <span class="text-info">{{ product.name }}</span>
                  </p>
                  <p>
                    Produkt Antal:
                    <span class="text-info"> {{ product.quantity }}</span>
                  </p>
                </div>
              </li>
            </ul>
          </li>
        </ul>
        <button @click="state.orderHistory = false" class="absolute top-6 right-6 text-xl text-primary">STÄNG</button>
      </div>
    </article>
  </main>
</template>

<style scoped>
section {
  margin: 0 auto;
  background-color: rgba(0, 32, 64, 0.821);
 
}

.orderHistoryList > li:nth-child(odd) {
  background-color: rgb(0, 26, 45);
}
.orderHistoryList > li:nth-child(even) {
  background-color: rgb(5, 37, 48);
}

.mainSection {
  min-height: 90vh;
  max-width: 2200px;
}
.loginform {
  background-color: rgba(5, 113, 149, 0.391);
  padding: 20px 30px;
  border-radius: 10px;
}

.cartSection {
  background-color: rgba(5, 113, 149, 0.391);
  padding: 20px 30px;
  margin-right: 20px;
}
.orderHistory {
  padding: 50px 30px;
  background-color: rgb(0, 17, 34);
  min-height: 90vh;
}

.orderHistory > div {
  background-color: rgba(26, 48, 73, 0.81);
  padding: 20px 30px;
  border-radius: 10px;
  margin: 0 auto;
  margin-top: 20px;
  width: 80%;
  height: 80%;
  overflow: scroll;
  position: relative;
}

.orderItems {
  background-color: rgba(5, 113, 149, 0.391);
  padding: 10px 20px;
  border-radius: 10px;
}

.loginPage {
  border-radius: 30px 0;
}
</style>
