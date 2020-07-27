<template>
  <v-card class="rounded-lg px-6 pb-6" outlined>
    <v-card-title>Transaksi Galon</v-card-title>
    <v-card-text>
      <v-row no-gutters justify="center" align="center">
        <v-col cols="12" md="6" class="text-center">
          <div class="text-h1">{{ jumlahGalon }}</div>
          <div class="my-6">
            <v-btn
              :disabled="jumlahGalon == 1 ? true : false"
              color="blue"
              class="rounded-r-0"
              depressed
              @click="jumlahGalon--"
              ><v-icon color="white">mdi-minus</v-icon></v-btn
            >
            <v-btn
              color="blue"
              class="rounded-l-0"
              depressed
              @click="jumlahGalon++"
              ><v-icon color="white">mdi-plus</v-icon></v-btn
            >
          </div>
        </v-col>
        <v-col cols="12" md="6">
          <v-form ref="form" v-model="valid" lazy-validation>
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
                <v-btn text color="blue" @click="$refs.menu.save(date)"
                  >OK</v-btn
                >
              </v-date-picker>
            </v-menu>

            <v-text-field
              v-model="satuan"
              :rules="[(v) => !!v || 'Harga per galon wajib diisi']"
              label="Harga per galon"
              type="number"
              required
            ></v-text-field>

            <p>Total Harga</p>
            <div class="text-h2 mb-6">Rp {{ totalHarga }}</div>

            <v-btn
              block
              :disabled="!valid"
              color="primary"
              depressed
              class="mr-4 text--blue"
              @click="validate"
            >
              Simpan
            </v-btn>
          </v-form>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import moment from "moment";
import { mapState } from "vuex";
export default {
  data: () => ({
    jumlahGalon: 1,
    date: moment().format("YYYY-MM-DD"),
    menu: false,
    valid: true,
    satuan: 0,
  }),
  computed: {
    totalHarga() {
      return this.jumlahGalon * this.satuan;
    },
    ...mapState(["userProfile", "userId"]),
  },
  created() {
    if (localStorage.getItem("hargaSatuan")) {
      this.satuan = localStorage.getItem("hargaSatuan");
    } else {
      this.satuan = 0;
    }
  },
  methods: {
    validate() {
      let data = {
        idKaryawan: this.userId,
        dilayaniOleh: this.userProfile.nama,
        tanggal: this.date,
        hargaSatuan: parseFloat(this.satuan),
        jumlahGalon: this.jumlahGalon,
        totalHarga: this.totalHarga,
      };
      if (this.$refs.form.validate()) {
      localStorage.setItem("hargaSatuan", this.satuan);
        this.$store.dispatch("tambahTransaksiGalon", data).then(() => {
          this.jumlahGalon = 1;
        });
      }
    },
  },
};
</script>

<style></style>
