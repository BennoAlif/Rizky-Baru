<template>
  <v-card class="rounded-lg px-6 pb-6" outlined height="100%">
    <v-card-title>Transaksi Galon</v-card-title>
    <v-form ref="form" v-model="valid" lazy-validation>
      <v-card-text>
        <v-menu
          ref="menu"
          v-model="menu"
          :close-on-content-click="false"
          :return-value.sync="date"
          transition="scale-transition"
          offset-y
          min-width="290px"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              v-model="date"
              append-icon="mdi-calendar"
              background-color="white"
              readonly
              v-bind="attrs"
              v-on="on"
            ></v-text-field>
          </template>
          <v-date-picker v-model="date" no-title scrollable>
            <v-spacer></v-spacer>
            <v-btn text color="blue" @click="menu = false">Cancel</v-btn>
            <v-btn text color="blue" @click="$refs.menu.save(date)">OK</v-btn>
          </v-date-picker>
        </v-menu>

        <v-text-field
          v-model="namaPengantar"
          :rules="[(v) => !!v || 'Nama pengantar wajib diisi']"
          label="Nama pengantar"
          required
        ></v-text-field>

        <v-text-field
          v-model="hargaPerTanki"
          :rules="[(v) => !!v || 'Harga wajib diisi']"
          label="Harga per tanki"
          type="number"
          required
        ></v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-btn
          block
          :disabled="!valid"
          color="primary"
          depressed
          class="mr-4 text--blue mt-2"
          @click="validate"
        >
          Simpan
        </v-btn>
      </v-card-actions>
    </v-form>
  </v-card>
</template>

<script>
import moment from "moment";
export default {
  data: () => ({
    date: moment().format("YYYY-MM-DD"),
    menu: false,
    valid: true,
    namaPengantar: "",
    hargaPerTanki: 0,
  }),
  created() {
    if (localStorage.getItem("hargaPerTanki")) {
      this.hargaPerTanki = localStorage.getItem("hargaPerTanki");
    } else {
      this.hargaPerTanki = 0;
    }
  },
  methods: {
    validate() {
      let data = {
        namaPengantar: this.namaPengantar,
        tanggal: this.date,
        hargaPerTanki: parseFloat(this.hargaPerTanki),
      };
      if (this.$refs.form.validate()) {
        localStorage.setItem("hargaPerTanki", this.hargaPerTanki);
        this.$store.dispatch("tambahTanki", data);
      }
    },
  },
};
</script>

<style></style>
