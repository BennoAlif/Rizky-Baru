<template>
  <v-card
    class="rounded-lg px-6 pb-6"
    outlined
    :loading="loading"
    :disabled="loading"
  >
    <v-card-title>Penjualan Galon</v-card-title>
    <v-card-subtitle>Bulan {{ formatMonth }}</v-card-subtitle>
    <v-row class="text--secondary">
      <v-col cols="12" md="4">
        <h2>
          Total pemasukan :
          <span class="green--text">{{ rupiahFormat(totalPemasukan) }}</span>
        </h2>
      </v-col>
      <v-col cols="12" md="8">
        <h2>
          Total galon terjual : <span class="blue--text">{{ totalGalon }}</span>
        </h2>
      </v-col>
    </v-row>
    <v-data-table
      :headers="headers"
      :items="transaksiPerTanggal"
      dense
      sort-by="tanggal"
    >
      <template v-slot:item.hargaSatuan="{ item }">
        <span>{{ rupiahFormat(item.hargaSatuan) }}</span>
      </template>
      <template v-slot:item.totalHarga="{ item }">
        <span>{{ rupiahFormat(item.totalHarga) }}</span>
      </template>
      <template v-slot:top>
        <v-dialog v-model="dialog" max-width="500px">
          <v-card>
            <v-card-title>
              <span class="headline">Ubah data</span>
            </v-card-title>

            <v-card-text>
              <v-container>
                <v-text-field
                  v-model="editedItem.dilayaniOleh"
                  :disabled="editedIndex != -1 ? true : false"
                  label="Dilayani Oleh"
                ></v-text-field>

                <v-text-field
                  v-model="editedItem.hargaSatuan"
                  label="Harga Per Galon"
                  type="number"
                ></v-text-field>

                <v-text-field
                  v-model="editedItem.jumlahGalon"
                  label="Jumlah galon"
                  type="number"
                ></v-text-field>

                <v-text-field
                  :disabled="editedIndex != -1 ? true : false"
                  v-model="totalHarga"
                  label="Total harga"
                  type="number"
                ></v-text-field>
              </v-container>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="close">Cancel</v-btn>
              <v-btn color="blue darken-1" text @click="save">Save</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-icon small class="mr-2" @click="editItem(item)">
          mdi-pencil
        </v-icon>
        <v-icon small @click="deleteItem(item)">
          mdi-delete
        </v-icon>
      </template>
      <template v-slot:no-data>
        There is no data to show
      </template>
    </v-data-table>
    <v-snackbar v-model="snackbar" :color="alertType">
      {{ alertMsg }}

      <template v-slot:action="{ attrs }">
        <v-btn color="white" text v-bind="attrs" @click="snackbar = false">
          tutup
        </v-btn>
      </template>
    </v-snackbar>
  </v-card>
</template>

<script>
import moment from "moment";
import { db } from "../../firebase/index";
export default {
  props: ["month"],
  data: () => ({
    dialog: false,
    loading: false,
    snackbar: false,
    alertMsg: "",
    alertType: "",
    headers: [
      { text: "Tanggal", value: "tanggal" },
      { text: "Dilayani oleh", value: "dilayaniOleh" },
      { text: "Harga satuan (Rp)", value: "hargaSatuan" },
      { text: "Jumlah galon", value: "jumlahGalon" },
      { text: "Total harga (Rp)", value: "totalHarga" },
      { text: "Aksi", value: "actions", sortable: false },
    ],
    transaksiPerTanggal: [],
    editedIndex: -1,
    editedItem: {
      dilayaniOleh: "",
      hargaSatuan: 0,
      jumlahGalon: 0,
      totalHarga: 0,
    },
    defaultItem: {
      dilayaniOleh: "",
      hargaSatuan: 0,
      jumlahGalon: 0,
      totalHarga: 0,
    },
  }),
  watch: {
    dialog(val) {
      val || this.close();
    },
    month(val) {
      this.getData(val);
    },
  },

  created() {
    this.getData(this.$props.month);
  },

  computed: {
    formatMonth() {
      return moment(this.$props.month).format("MMMM YYYY");
    },
    totalHarga() {
      return this.editedItem.jumlahGalon * this.editedItem.hargaSatuan;
    },
    getMonth() {
      return moment().format("YYYY-MM");
    },
    totalGalon() {
      if (!this.loading) {
        return this.transaksiPerTanggal.reduce(function(prev, cur) {
          return prev + cur.jumlahGalon;
        }, 0);
      }
      return 0;
    },
    totalPemasukan() {
      if (!this.loading) {
        return this.transaksiPerTanggal.reduce(function(prev, cur) {
          return prev + cur.totalHarga;
        }, 0);
      }
      return 0;
    },
  },

  methods: {
    rupiahFormat(data) {
      const formatter = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 2,
      });

      return formatter.format(data);
    },
    getData(month) {
      this.transaksiPerTanggal = [];

      this.loading = true;
      db.collection("transaksiGalon")
        .where("bulan", "==", month)
        .get()
        .then((res) => {
          db.doc(`transaksiGalon/${res.docs[0].id}`)
            .collection("transaksiHariIni")
            .onSnapshot((res) => {
              const changes = res.docChanges();
              changes.forEach((change) => {
                if (change.type === "added") {
                  this.transaksiPerTanggal.push({
                    ...change.doc.data(),
                    id: change.doc.id,
                  });
                }
              });
              this.$store.commit(
                "setPemasukan",
                this.rupiahFormat(this.totalPemasukan)
              );
              this.$store.commit("setGalonTerjual", this.totalGalon);
              this.$store.commit("setGalon", this.transaksiPerTanggal);
            });
        })
        .then(() => {
          this.loading = false;
        })
        .catch(() => (this.loading = false));
    },
    editItem(item) {
      this.editedIndex = this.transaksiPerTanggal.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    deleteItem(item) {
      console.log(this.totalPemasukan);
      confirm("Are you sure you want to delete this item?") &&
        db
          .collection(`transaksiGalon`)
          .where("bulan", "==", this.getMonth)
          .get()
          .then((res) => {
            db.doc(`transaksiGalon/${res.docs[0].id}`)
              .collection("transaksiHariIni")
              .doc(item.id)
              .delete()
              .then(() => {
                this.snackbar = true;
                this.alertMsg = "Berhasil menghapus data";
                this.alertType = "success";
                this.transaksiPerTanggal = this.transaksiPerTanggal.filter(
                  (e) => {
                    return e.id != item.id;
                  }
                );
              })
              .catch((err) => {
                this.snackbar = true;
                this.alertMsg = err.message;
                this.alertType = "error";
              });
          });
    },

    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    save() {
      db.collection(`transaksiGalon`)
        .where("bulan", "==", this.getMonth)
        .get()
        .then((res) => {
          db.doc(`transaksiGalon/${res.docs[0].id}`)
            .collection("transaksiHariIni")
            .doc(this.editedItem.id)
            .update({
              hargaSatuan: parseFloat(this.editedItem.hargaSatuan),
              jumlahGalon: parseFloat(this.editedItem.jumlahGalon),
              totalHarga: this.totalHarga,
            });
        })
        .then(() => {
          Object.assign(this.transaksiPerTanggal[this.editedIndex], {
            totalHarga: this.totalHarga,
            hargaSatuan: this.editedItem.hargaSatuan,
            jumlahGalon: parseFloat(this.editedItem.jumlahGalon),
          });
          console.log(this.transaksiPerTanggal);
          this.snackbar = true;
          this.alertMsg = "Berhasil mengubah data";
          this.alertType = "success";
          this.close();
        })
        .catch((err) => {
          this.snackbar = true;
          this.alertMsg = err.message;
          this.alertType = "error";
          console.log(err);
        });
    },
  },
};
</script>

<style></style>
