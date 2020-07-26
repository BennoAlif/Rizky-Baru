<template>
  <v-card
    class="rounded-lg px-6 pb-6"
    outlined
    :loading="loading"
    :disabled="loading"
  >
    <v-card-title>Pembelian Tanki</v-card-title>
    <v-card-subtitle>Bulan {{ formatMonth }}</v-card-subtitle>
    <v-row class="text--secondary">
      <v-col>
        <h2>
          Total pengeluaran :
          <span class="red--text">{{ rupiahFormat(totalPengeluaran) }}</span>
        </h2>
      </v-col>
    </v-row>
    <v-data-table
      :headers="headers"
      :items="transaksiPerTanggal"
      dense
      sort-by="tanggal"
    >
      <template v-slot:item.hargaPerTanki="{ item }">
        <span>{{ rupiahFormat(item.hargaPerTanki) }}</span>
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
                  v-model="editedItem.namaPengantar"
                  :disabled="editedIndex != -1 ? true : false"
                  label="Dilayani Oleh"
                ></v-text-field>

                <v-text-field
                  v-model="editedItem.hargaPerTanki"
                  label="Harga per tanki"
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
        <v-tooltip top>
          <template v-slot:activator="{ on, attrs }">
            <v-icon
              small
              class="mr-2"
              @click="editItem(item)"
              v-bind="attrs"
              v-on="on"
            >
              mdi-pencil
            </v-icon>
          </template>
          <span>Ubah data</span>
        </v-tooltip>
        <v-tooltip top>
          <template v-slot:activator="{ on, attrs }">
            <v-icon small @click="deleteItem(item)" v-bind="attrs" v-on="on">
              mdi-delete
            </v-icon>
          </template>
          <span>Hapus data</span>
        </v-tooltip>
      </template>
      <template v-slot:no-data>
        Tidak ada data
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
      { text: "Nama Pengantar", value: "namaPengantar" },
      { text: "Harga per tanki", value: "hargaPerTanki" },
      { text: "Aksi", value: "actions", sortable: false },
    ],
    transaksiPerTanggal: [],
    editedIndex: -1,
    editedItem: {
      namaPengantar: "",
      hargaPerTanki: 0,
    },
    defaultItem: {
      namaPengantar: "",
      hargaPerTanki: 0,
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
    getMonth() {
      return moment().format("YYYY-MM");
    },
    totalPengeluaran() {
      if (!this.loading) {
        return this.transaksiPerTanggal.reduce(function(prev, cur) {
          return prev + cur.hargaPerTanki;
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
      db.collection("Transaksi_tanki")
        .where("bulan", "==", month)
        .get()
        .then((res) => {
          db.doc(`Transaksi_tanki/${res.docs[0].id}`)
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
              this.$store.commit("setTanki", this.transaksiPerTanggal);
              this.$store.commit(
                "setPengeluaran",
                this.rupiahFormat(this.totalPengeluaran)
              );
            });
        })
        .then(() => (this.loading = false))
        .catch(() => (this.loading = false));
    },
    editItem(item) {
      this.editedIndex = this.transaksiPerTanggal.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    deleteItem(item) {
      confirm("Apakah anda yakin ingin menghapus data ini?") &&
        db
          .collection(`Transaksi_tanki`)
          .where("bulan", "==", this.getMonth)
          .get()
          .then((res) => {
            db.doc(`Transaksi_tanki/${res.docs[0].id}`)
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
      db.collection(`Transaksi_tanki`)
        .where("bulan", "==", this.getMonth)
        .get()
        .then((res) => {
          db.doc(`Transaksi_tanki/${res.docs[0].id}`)
            .collection("transaksiHariIni")
            .doc(this.editedItem.id)
            .update({
              namaPengantar: this.editedItem.namaPengantar,
              hargaPerTanki: parseFloat(this.editedItem.hargaPerTanki),
            });
        })
        .then(() => {
          Object.assign(this.transaksiPerTanggal[this.editedIndex], {
            namaPengantar: this.editedItem.namaPengantar,
            hargaPerTanki: parseFloat(this.editedItem.hargaPerTanki),
          });
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
