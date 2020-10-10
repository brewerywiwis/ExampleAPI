// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const app = express();

var serviceAccount = require("./permission.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://test-api-project-7ba8a.firebaseio.com",
});

const db = admin.firestore();

app.use(cors({ origin: true }));

app.get("/api/hello-world", (req, res) => {
  return res.status(200).send("Hello World!");
});

app.post("/api/create", (req, res) => {
  (async () => {
    try {
      await db
        .collection("items")
        .doc("/" + req.body.id + "/")
        .create({ item: req.body.item });
      return res.status(200).send();
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })();
});
app.post("/api/create-user", (req, res) => {
  (async () => {
    try {
      await db
        .collection("users")
        .doc("/" + req.body.username + "/")
        .create({ password: req.body.password });
      return res.status(200).send();
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })();
});
// read item
app.get("/api/read/:item_id", (req, res) => {
  (async () => {
    try {
      const document = db.collection("items").doc(req.params.item_id);
      let item = await document.get();
      let response = item.data();
      return res.status(200).send(response);
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })();
});

// read all
app.get("/api/read", (req, res) => {
  (async () => {
    try {
      let query = db.collection("items");
      let response = [];
      await query.get().then((querySnapshot) => {
        let docs = querySnapshot.docs;
        for (let doc of docs) {
          const selectedItem = {
            id: doc.id,
            item: doc.data().item,
          };
          response.push(selectedItem);
        }
      });
      return res.status(200).send(response);
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })();
});

// update
app.put("/api/update/:item_id", (req, res) => {
  (async () => {
    try {
      const document = db.collection("items").doc(req.params.item_id);
      await document.update({
        item: req.body.item,
      });
      return res.status(200).send();
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })();
});

// delete
app.delete("/api/delete/:item_id", (req, res) => {
  (async () => {
    try {
      const document = db.collection("items").doc(req.params.item_id);
      await document.delete();
      return res.status(200).send();
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })();
});
function valid_user(input, data) {
  if (input === data) {
    return "accept";
  } else {
    return "denied";
  }
}
app.get("/api/valid_user", (req, res) => {
  (async () => {
    try {
      const document = db.collection("users").doc(req.body.username);
      await document.get().then(function (doc) {
        if (doc.exists) {
          return res
            .status(200)
            .send(valid_user(req.body.password, doc.data().password));
        } else {
          // doc.data() will be undefined in this case
          return res.status(200).send("No such a username");
        }
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })();
});
exports.app = functions.https.onRequest(app);
