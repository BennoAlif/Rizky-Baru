<template>
  <v-card
    class="rounded-lg px-6 pb-6"
    outlined
    :loading="loading"
    :disabled="loading"
  >
    <v-card-title>Daftar Karyawan</v-card-title>
    <v-card-title> </v-card-title>
    <v-data-table :headers="headers" :items="users" :search="search">
      <template v-slot:top>
        <v-dialog v-model="dialog" max-width="500px">
          <template v-slot:activator="{ on, attrs }">
            <v-row>
              <v-col cols="12" md="6">
                <v-btn color="blue" depressed dark v-bind="attrs" v-on="on"
                  >Tambah Karyawan</v-btn
                >
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="search"
                  append-icon="mdi-magnify"
                  label="Cari"
                  single-line
                  hide-details
                ></v-text-field>
              </v-col>
            </v-row>
          </template>
          <v-card :loading="loading" :disabled="loading">
            <v-card-title>
              <span class="headline">{{ formTitle }}</span>
            </v-card-title>

            <v-card-text>
              <v-container>
                <v-form ref="form" v-model="valid" :lazy-validation="lazy">
                  <v-text-field
                    v-model="editedItem.nama"
                    label="Nama"
                    :rules="[(v) => !!v || 'Nama wajib diisi']"
                  ></v-text-field>

                  <v-text-field
                    :disabled="editedIndex != -1 ? true : false"
                    v-model="editedItem.email"
                    label="Email"
                    :rules="emailRules"
                  ></v-text-field>

                  <v-text-field
                    :disabled="editedIndex != -1 ? true : false"
                    v-model="editedItem.password"
                    :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                    :rules="editedIndex != -1 ? [] : [rules.required]"
                    :type="show1 ? 'text' : 'password'"
                    id="password"
                    label="Password"
                    name="password"
                    @click:append="show1 = !show1"
                  ></v-text-field>

                  <v-text-field
                    v-model="editedItem.noTelp"
                    label="No. Telepon"
                    :rules="noTelpRules"
                  ></v-text-field>

                  <v-textarea
                    v-model="editedItem.alamat"
                    :rules="[(v) => !!v || 'Alamat wajib diisi']"
                    label="Alamat"
                  ></v-textarea>
                </v-form>
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
        <v-icon small @click="editItem(item)">
          mdi-pencil
        </v-icon>
        <v-icon small class="mx-2" @click="resetPassword(item)">
          mdi-lock-reset
        </v-icon>
        <v-icon small @click="deleteItem(item)">
          mdi-delete
        </v-icon>
      </template>
      <template v-slot:no-data>
        There is no data
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
import { db, functions, auth } from "../firebase/index";
// import { mapState } from "vuex";
export default {
  data: () => ({
    snackbar: false,
    alertMsg: "",
    alertType: "",
    loading: false,
    valid: true,
    lazy: false,
    dialog: false,
    show1: false,
    search: "",
    users: [],
    emailRules: [
      (v) => !!v || "Alamat e-mail wajib diisi",
      (v) => /.+@.+\..+/.test(v) || "Alamat e-mail tidak valid",
    ],
    noTelpRules: [
      (v) => !!v || "No. Telepon wajib diisi",
      (v) => /^[0-9]*$/g.test(v) || "No. Telepon tidak valid",
    ],
    rules: {
      required: (value) => !!value || "Password tidak boleh kosong",
      min: (v) => v.length >= 8 || "Min 8 characters",
    },
    headers: [
      { text: "Nama", value: "nama" },
      { text: "Email", value: "email" },
      { text: "No. Telepon", value: "noTelp" },
      { text: "Alamat", value: "alamat" },
      { text: "Aksi", value: "actions", sortable: false },
    ],
    editedIndex: -1,
    editedItem: {
      nama: "",
      email: "",
      password: "",
      noTelp: "",
      alamat: "",
    },
    defaultItem: {
      nama: "",
      email: "",
      password: "",
      noTelp: "",
      alamat: "",
    },
  }),

  watch: {
    dialog(val) {
      val || this.close();
    },
  },

  created() {
    db.collection("karyawan").onSnapshot((res) => {
      const changes = res.docChanges();
      changes.forEach((change) => {
        if (change.type === "added") {
          this.users.push({
            ...change.doc.data(),
            id: change.doc.id,
          });
        }
      });
    });
  },

  // computed: mapState(["users"]),
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Tambah karyawan" : "Ubah data karyawan";
    },
  },

  methods: {
    editItem(item) {
      this.editedIndex = this.users.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    resetPassword(item) {
      auth
        .sendPasswordResetEmail(item.email)
        .then(() => {
          this.snackbar = true;
          this.alertMsg = "Berhasil mengirim ulang kata sandi";
          this.alertType = "success";
        })
        .catch((err) => {
          this.snackbar = true;
          this.alertMsg = err.message;
          this.alertType = "error";
          console.error(err);
        });
    },

    deleteItem(item) {
      let r = confirm("Are you sure you want to delete this item?");
      if (r == true) {
        const deleteUser = functions.httpsCallable("deleteUser");
        db.collection("karyawan")
          .doc(item.id)
          .delete()
          .then(() => {
            this.snackbar = true;
            this.alertMsg = "Berhasil menghapus data karyawan";
            this.alertType = "success";
            this.users = this.users.filter((user) => {
              return user.id != item.id;
            });
          })
          .catch((err) => {
            this.snackbar = true;
            this.alertMsg = err.message;
            this.alertType = "error";
          });
        return deleteUser(item.id);
      }
    },

    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    save() {
      if (this.editedIndex > -1) {
        db.collection("karyawan")
          .doc(this.editedItem.id)
          .update({
            nama: this.editedItem.nama,
            noTelp: this.editedItem.noTelp,
            alamat: this.editedItem.alamat,
          })
          .then(() => {
            Object.assign(this.users[this.editedIndex], this.editedItem);
            this.snackbar = true;
            this.alertMsg = "Berhasil mengubah data karyawan";
            this.alertType = "success";
            this.close();
          })
          .catch((err) => {
            this.snackbar = true;
            this.alertMsg = err.message;
            this.alertType = "error";
            console.log(err);
          });
      } else {
        // this.users.push(this.editedItem);
        this.loading = true;
        const createUser = functions.httpsCallable("createUser");
        createUser({
          email: this.editedItem.email,
          password: this.editedItem.password,
        })
          .then((cred) => {
            db.collection("karyawan")
              .doc(cred.data.uid)
              .set({
                nama: this.editedItem.nama,
                email: this.editedItem.email,
                noTelp: this.editedItem.noTelp,
                alamat: this.editedItem.alamat,
              });
          })
          .then(() => {
            this.loading = false;
            this.$refs.form.resetValidation();
            this.snackbar = true;
            this.alertMsg = "Berhasil menambahkan karyawan";
            this.alertType = "success";
            this.close();
          })
          .then(() => {
            const addAdminRole = functions.httpsCallable("addAdminRole");
            return addAdminRole({ email: this.editedItem.email });
          })
          .catch((err) => {
            this.loading = false;
            this.snackbar = true;
            this.alertMsg = err.message;
            this.alertType = "error";
            console.error(err.message);
          });
      }
    },
  },
};
</script>

<style></style>
