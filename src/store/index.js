/* eslint-disable no-unused-vars */
import Vue from "vue";
import Vuex from "vuex";
import { db, auth } from "../firebase/index";
import router from "../router";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    loading: false,
    alertMsg: "",
    snackbar: false,
    users: [],
    currentUser: null,
    userProfile: {},
    alertType: "",
    totalPemasukan: "",
    totalPengeluaran: "",
    galonTerjual: 0,
    galonPerBulan: [],
    tankiPerBulan: [],
  },
  mutations: {
    setPemasukan(state, data) {
      state.totalPemasukan = data;
    },
    setPengeluaran(state, data) {
      state.totalPengeluaran = data;
    },
    setGalonTerjual(state, data) {
      state.galonTerjual = data;
    },
    setTanki(state, data) {
      state.tankiPerBulan = data;
    },
    setGalon(state, data) {
      state.galonPerBulan = data;
    },
    setSnackbar(state, data) {
      state.snackbar = data;
    },
    setUserProfile(state, val) {
      state.userProfile = val;
    },
  },
  actions: {
    login({ commit }, data) {
      this.state.loading = true;
      auth
        .signInWithEmailAndPassword(data.email, data.password)
        .then((cred) => {
          router.push("beranda");
          this.state.loading = false;
        })
        .catch((err) => {
          this.state.loading = false;
          this.state.snackbar = true;
          this.state.alertMsg = err.message;
          this.state.alertType = "error";
          console.log(err);
        });
    },
    logout() {
      auth.signOut().then(() => {
        router.push("/login");
      });
    },
    onAuth({ commit }) {
      auth.onAuthStateChanged((user) => {
        if (user) {
          db.collection("karyawan")
            .doc(user.uid)
            .get()
            .then((res) => commit("setUserProfile", res.data()));
        }
      });
    },
    getDataKaryawan() {
      db.collection("karyawan").onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
          let doc = change.doc;
          this.state.users.push({
            id: doc.id,
            nama: doc.data().nama,
            email: doc.data().email,
            noTelp: doc.data().noTelp,
            alamat: doc.data().alamat,
          });
        });
      });
    },
    tambahTransaksiGalon({ commit }, data) {
      let bulan = data.tanggal.substring(0, 7);

      db.collection("Transaksi_galon")
        .where("bulan", "==", bulan)
        .get()
        .then((res) => {
          if (res.empty) {
            console.log("data tidak ada");
            db.collection("Transaksi_galon")
              .add({ bulan: bulan })
              .then((res) =>
                db
                  .doc(`Transaksi_galon/${res.id}`)
                  .collection("transaksiHariIni")
                  .add(data)
                  .then(() => {
                    this.state.snackbar = true;
                    this.state.alertMsg =
                      "Berhasil menambah data transaksi galon";
                    this.state.alertType = "success";
                  })
                  .catch((err) => {
                    this.state.snackbar = true;
                    this.state.alertMsg = err.message;
                    this.state.alertType = "error";
                  })
              );
          } else {
            console.log("data sudah ada", res);
            db.doc(`Transaksi_galon/${res.docs[0].id}`)
              .collection("transaksiHariIni")
              .add(data)
              .then(() => {
                this.state.snackbar = true;
                this.state.alertMsg = "Berhasil menambah data transaksi galon";
                this.state.alertType = "success";
              })
              .catch((err) => {
                this.state.snackbar = true;
                this.state.alertMsg = err.message;
                this.state.alertType = "error";
              });
          }
        });
    },
    tambahTanki({ commit }, data) {
      let bulan = data.tanggal.substring(0, 7);

      db.collection("Transaksi_tanki")
        .where("bulan", "==", bulan)
        .get()
        .then((res) => {
          if (res.empty) {
            console.log("data tidak ada");
            db.collection("Transaksi_tanki")
              .add({ bulan: bulan })
              .then((res) =>
                db
                  .doc(`Transaksi_tanki/${res.id}`)
                  .collection("transaksiHariIni")
                  .add(data)
                  .then(() => {
                    this.state.snackbar = true;
                    this.state.alertMsg =
                      "Berhasil menambah data transaksi tanki";
                    this.state.alertType = "success";
                  })
                  .catch((err) => {
                    this.state.snackbar = true;
                    this.state.alertMsg = err.message;
                    this.state.alertType = "error";
                  })
              );
          } else {
            console.log("data sudah ada", res);
            db.doc(`Transaksi_tanki/${res.docs[0].id}`)
              .collection("transaksiHariIni")
              .add(data)
              .then(() => {
                this.state.snackbar = true;
                this.state.alertMsg = "Berhasil menambah data transaksi tanki";
                this.state.alertType = "success";
              })
              .catch((err) => {
                this.state.snackbar = true;
                this.state.alertMsg = err.message;
                this.state.alertType = "error";
              });
          }
        });
    },
  },
  modules: {},
});
