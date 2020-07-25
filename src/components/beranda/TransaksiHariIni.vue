<template>
  <v-card
    class="rounded-lg px-6 pb-6"
    outlined
    :loading="loading"
    :disabled="loading"
  >
    <v-card-title>Transaksi Galon Hari Ini</v-card-title>
    <v-card-subtitle>{{ today }}</v-card-subtitle>
    <h2>
      Total pemasukan :
      <span class="green--text">{{ rupiahFormat(totalPemasukan) }}</span>
    </h2>
    <v-card-title>
      <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        label="Cari"
        single-line
        hide-details
      ></v-text-field>
    </v-card-title>
    <v-data-table
      :headers="headers"
      :items="galonHariIni"
      :search="search"
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
                  label="Harga per galon"
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
              <v-btn color="blue darken-1" text @click="close">Batal</v-btn>
              <v-btn color="blue darken-1" text @click="save">Simpan</v-btn>
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
moment.locale("id");
import { db } from "../../firebase/index";
export default {
  data: () => ({
    loading: false,
    dialog: false,
    snackbar: false,
    alertMsg: "",
    alertType: "",
    today: moment().format("LL"),
    search: "",
    headers: [
      { text: "Dilayani oleh", value: "dilayaniOleh" },
      { text: "Harga satuan", value: "hargaSatuan" },
      { text: "Jumlah galon", value: "jumlahGalon" },
      { text: "Total harga", value: "totalHarga" },
      { text: "Aksi", value: "actions", sortable: false },
    ],
    galonHariIni: [],
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
  },

  created() {
    this.loading = true;
    db.collection("transaksiGalon")
      .where("bulan", "==", this.getMonth)
      .get()
      .then((res) => {
        if (!res.empty) {
          db.doc(`transaksiGalon/${res.docs[0].id}`)
            .collection("transaksiHariIni")
            .where("tanggal", "==", this.getTodayDate)
            .onSnapshot((res) => {
              const changes = res.docChanges();
              changes.forEach((change) => {
                if (change.type === "added") {
                  this.galonHariIni.push({
                    ...change.doc.data(),
                    id: change.doc.id,
                  });
                }
              });
            });
        }
      })
      .then(() => {
        this.loading = false;
      })
      .catch((err) => {
        this.loading = false;
        console.log(err);
      });
  },

  computed: {
    totalPemasukan() {
      if (!this.loading) {
        return this.galonHariIni.reduce(function(prev, cur) {
          return prev + cur.totalHarga;
        }, 0);
      }
      return 0;
    },
    getTodayDate() {
      return moment().format("YYYY-MM-DD");
    },
    getMonth() {
      return moment().format("YYYY-MM");
    },
    totalHarga() {
      return this.editedItem.jumlahGalon * this.editedItem.hargaSatuan;
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
    editItem(item) {
      this.editedIndex = this.galonHariIni.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    deleteItem(item) {
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
                this.alertMsg = "Berhasil mengahpus data";
                this.alertType = "success";
                this.galonHariIni = this.galonHariIni.filter((e) => {
                  return e.id != item.id;
                });
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
            })
            .then((res) => console.log(res));
        })
        .then(() => {
          Object.assign(this.galonHariIni[this.editedIndex], this.editedItem);
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
