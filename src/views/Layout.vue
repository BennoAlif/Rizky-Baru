<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" app clipped>
      <v-list>
        <v-list-item link to="beranda">
          <v-list-item-action>
            <v-icon>mdi-view-dashboard</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Beranda</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item link to="laporan">
          <v-list-item-action>
            <v-icon>mdi-file-chart</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Laporan</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item link to="karyawan">
          <v-list-item-action>
            <v-icon>mdi-account-group</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Karyawan</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app color="blue" dark clipped-left flat>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Rizky Baru</v-toolbar-title>
      <v-spacer></v-spacer>
      {{ userProfile.nama }}
      <v-btn icon large @click="logout">
        <v-icon>mdi-power</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main class="grey lighten-5">
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>
    <v-snackbar v-model="snackbar" :color="alertType">
      {{ alertMsg }}

      <template v-slot:action="{ attrs }">
        <v-btn color="white" text v-bind="attrs" @click="snackbar = false">
          tutup
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script>
import { mapState } from "vuex";
export default {
  data: () => ({
    drawer: null,
  }),
  methods: {
    logout() {
      this.$store.dispatch("logout");
    },
  },
  created() {
    this.$store.dispatch("onAuth");
  },
  computed: {
    ...mapState(["snackbar", "alertMsg", "userProfile", "alertType"]),
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
