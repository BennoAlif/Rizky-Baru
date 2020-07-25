<template>
  <v-app>
    <v-main class="grey lighten-2">
      <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
          <v-col cols="12" sm="8" md="4" align="center">
            <v-card
              class="rounded-lg px-4"
              max-width="400"
              min-height="553"
              :loading="loading"
              :disabled="loading"
            >
              <v-card-text>
                <v-img
                  src="../assets/logo.png"
                  width="80"
                  class="mt-6 mb-4"
                ></v-img>
                <h1 class="text-center font-weight-bold mb-16 black--text">
                  Rizky Baru
                </h1>

                <v-text-field
                  v-model="email"
                  :rules="[(value) => !!value || 'E-mail wajib diisi']"
                  label="Email"
                  name="email"
                  type="email"
                ></v-text-field>
                <v-text-field
                  v-model="password"
                  :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                  :rules="[rules.required, rules.min]"
                  :type="show1 ? 'text' : 'password'"
                  id="password"
                  label="Password"
                  name="password"
                  @click:append="show1 = !show1"
                ></v-text-field>
                <v-btn
                  type="submit"
                  :loading="loading"
                  block
                  class="blue mt-4 white--text"
                  depressed
                  x-large
                  @click="login"
                  >Login</v-btn
                >
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        <v-snackbar v-model="snackbar" color="error">
          {{ alertMsg }}

          <template v-slot:action="{ attrs }">
            <v-btn color="white" text v-bind="attrs" @click="snackbar = false">
              tutup
            </v-btn>
          </template>
        </v-snackbar>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { mapState } from "vuex";
export default {
  data() {
    return {
      show1: false,
      email: "",
      password: "",
      rules: {
        required: (value) => !!value || "Password wajib diisi",
        min: (v) => v.length >= 8 || "Min 8 characters",
      },
    };
  },
  methods: {
    login() {
      this.$store.dispatch("login", {
        email: this.email,
        password: this.password,
      });
    },
  },
  computed: {
    ...mapState(["snackbar", "alertMsg", "loading"]),
    snackbar: {
      get() {
        return this.$store.state.snackbar;
      },
      set(val) {
        this.$store.commit("setSnackbar", val);
      },
    },
  },
};
</script>

<style></style>
