<template>
  <v-row>
    <v-col cols="12" md="6">
      <Galon />
    </v-col>
    <v-col cols="12" md="6">
      <Tanki />
    </v-col>
    <v-col cols="12">
      <Transaksi />
    </v-col>
  </v-row>
</template>

<script>
import Galon from "../components/beranda/TransaksiGalon";
import Tanki from "../components/beranda/TransakiTanki";
import Transaksi from "../components/beranda/TransaksiHariIni";
export default {
  components: { Galon, Tanki, Transaksi },
};
</script>

<style></style>
