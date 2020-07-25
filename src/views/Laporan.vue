<template>
  <v-row>
    <v-col cols="12">
      <div class="text-h3">Laporan Bulanan</div>
    </v-col>
    <v-col cols="12" md="4">
      <v-menu
        ref="menu"
        v-model="menu"
        :close-on-content-click="false"
        :return-value.sync="month"
        transition="scale-transition"
        offset-y
        min-width="290px"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-text-field
            v-model="month"
            append-icon="mdi-calendar"
            background-color="white"
            outlined
            readonly
            v-bind="attrs"
            v-on="on"
          ></v-text-field>
        </template>
        <v-date-picker v-model="month" type="month" no-title scrollable>
          <v-spacer></v-spacer>
          <v-btn text color="blue" @click="menu = false">Cancel</v-btn>
          <v-btn text color="blue" @click="$refs.menu.save(month)">OK</v-btn>
        </v-date-picker>
      </v-menu>
    </v-col>
    <v-col cols="12"
      ><v-btn class="ma-2" depressed color="blue" dark @click="exportPDF">
        <v-icon left>mdi-printer</v-icon> Print
      </v-btn></v-col
    >
    <v-col cols="12"><Galon :month="month"/></v-col>
    <v-col cols="12"><Tanki :month="month"/></v-col>
  </v-row>
</template>

<script>
import moment from "moment";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Galon from "../components/laporan/Galon";
import Tanki from "../components/laporan/Tanki";
import { mapState } from "vuex";
export default {
  components: { Galon, Tanki },
  data: () => ({
    month: new Date().toISOString().substr(0, 7),
    menu: false,
  }),
  computed: mapState([
    "totalPemasukan",
    "totalPengeluaran",
    "galonTerjual",
    "galonPerBulan",
    "tankiPerBulan",
  ]),
  methods: {
    exportPDF() {
      const columns = [
        { title: "Tanggal", dataKey: "tanggal" },
        { title: "Dilayani oleh", dataKey: "dilayaniOleh" },
        { title: "Harga per galon (Rp)", dataKey: "hargaSatuan" },
        { title: "Jumlah galon", dataKey: "jumlahGalon" },
        { title: "Total harga (Rp)", dataKey: "totalHarga" },
      ];

      const columnsTank = [
        { title: "Tanggal", dataKey: "tanggal" },
        { title: "Nama pengantar", dataKey: "namaPengantar" },
        { title: "Harga per tanki (Rp)", dataKey: "hargaPerTanki" },
      ];
      const doc = new jsPDF("p", "pt");
      doc.text(
        `Laporan bulanan periode ${moment(this.month).format("MMMM YYYY")}`,
        40,
        40
      );
      doc.setFontSize(14);
      doc.text(`Total galon terjual : ${this.galonTerjual}`, 40, 80);
      doc.text(`Total pemasukan : ${this.totalPemasukan}`, 40, 105);
      doc.text(`Total pengeluaran : ${this.totalPengeluaran}`, 40, 130);
      doc.text(`Detail transaksi galon`, 40, 170);
      doc.autoTable(columns, this.galonPerBulan, {
        margin: { top: 190 },
      });
      let finalY = doc.lastAutoTable.finalY; // The y position on the page
      doc.text("Detail pembelian tanki", 40, finalY + 60);
      const options = {
        startY: doc.lastAutoTable.finalY + 80,
      };
      doc.autoTable(columnsTank, this.tankiPerBulan, options);
      doc.save(
        `Laporan bulanan periode ${moment(this.month).format("MMMM YYYY")}.pdf`
      );
    },
  },
};
</script>

<style></style>
