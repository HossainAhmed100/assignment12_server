const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

const app = express();

app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.n1qunyp.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "UnAuthorized Access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "unAuthorized Access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    await client.connect();
    console.log("Mongo Server Connected");
    const productCollection = client.db("products").collection("product");
    const userCollection = client.db("users").collection("user");
    const reviewsCollection = client.db("users").collection("reviews");
    const orderCollection = client.db("users").collection("order");

    // Authorization
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
        expiresIn: "365d",
      });
      res.send({ token });
    });

    // Get All Products
    app.get("/allproducts", async (req, res) => {
      const result = await productCollection.find({}).toArray();
      res.send(result);
    });

    // Get Single Product with ID
    app.get("/singleProduct/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollection.findOne(query);
      res.send(result);
    });

    // Add New Product
    app.post("/addNewProduct", verifyJWT, async (req, res) => {
      const data = req.body.product;
      const result = await productCollection.insertOne(data);
      res.send(result);
    });

    // Place New Order
    app.post("/placeNewOrder/:email", verifyJWT, async (req, res) => {
      const decoded = req.decoded;
      if (decoded.email !== req.params.email) {
        return res.status(401).send({ message: "UnAuthorized Access!" });
      }
      const data = req.body.order;
      const result = await orderCollection.insertOne(data);
      res.send(result);
    });

    // Get All Order Data
    app.get("/allOrder", async (req, res) => {
      const result = await orderCollection.find({}).toArray();
      res.send(result);
    });

    // Get User Order Data
    app.get("/allOrder/:email", verifyJWT, async (req, res) => {
      const decoded = req.decoded;
      if (decoded.email !== req.params.email) {
        return res.status(401).send({ message: "UnAuthorized Access!" });
      }
      const email = req.params.email;
      const query = { userEmail: email };
      const result = await orderCollection.find(query).toArray();
      res.send(result);
    });

    // Get User Order Data
    app.get("/getUserOrder/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await orderCollection.findOne(query);
      res.send(result);
    });

    // Delete Specific User Order
    app.delete("/allOrder/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.send(result);
    });

    // Register New user
    app.post("/addNewUser", async (req, res) => {
      const data = req.body.userInfo;
      const result = await userCollection.insertOne(data);
      res.send(result);
    });

    // Get Signle User by Email
    app.get("/signleUser/:email", verifyJWT, async (req, res) => {
      const decoded = req.decoded;
      if (decoded.email !== req.params.email) {
        return res.status(401).send({ message: "UnAuthorized Access!" });
      }
      const email = req.params.email;
      const query = { email: email };
      const result = await userCollection.findOne(query);
      res.send(result);
    });

    // Update user Account
    app.put("/updateUser/:email", verifyJWT, async (req, res) => {
      const decoded = req.decoded;
      if (decoded.email !== req.params.email) {
        return res.status(401).send({ message: "UnAuthorized Access!" });
      }
      const email = req.params.email;
      const user = req.body.userInfo;
      const query = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          name: user.names,
          phone: user.phones,
          address: user.addresss,
          email: user.email,
          role: user.role,
        },
      };
      const result = await userCollection.updateOne(query, updateDoc, options);
      res.send(result);
    });

    // Get All User reviews
    app.get("/allreviews", async (req, res) => {
      const result = await reviewsCollection.find({}).toArray();
      res.send(result);
    });

    // Get Specific User Reviews
    app.get("/allreviews/:email", verifyJWT, async (req, res) => {
      const decoded = req.decoded;
      if (decoded.email !== req.params.email) {
        return res.status(401).send({ message: "UnAuthorized Access!" });
      }
      const email = req.params.email;
      const query = { email: email };
      const result = await reviewsCollection.find(query).toArray();
      res.send(result);
    });

    // Delete Specific User Reviews
    app.delete("/allreviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await reviewsCollection.deleteOne(query);
      console.log(result);
      res.send(result);
    });

    // User = Add New Reviews
    app.post("/addnewreviews/:email", verifyJWT, async (req, res) => {
      const decoded = req.decoded;
      if (decoded.email !== req.params.email) {
        return res.status(401).send({ message: "UnAuthorized Access!" });
      }
      const reviews = req.body.reviews;
      const result = await reviewsCollection.insertOne(reviews);
      res.send(result);
    });

    // <-------------- Admin API -------------->

    // ALL User
    app.get("/alluser", async (req, res) => {
      const result = await userCollection.find({}).toArray();
      res.send(result);
    });

    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      res.send({ isAdmin: user?.role === "Admin" });
    });

    // Approve Order
    app.put("/approveOrder/:email", verifyJWT, async (req, res) => {
      const decoded = req.decoded;
      if (decoded.email !== req.params.email) {
        return res.status(401).send({ message: "UnAuthorized Access!" });
      }
      const id = req.body.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          orderStatus: true,
        },
      };
      const result = await orderCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    // Delete Specific Product
    app.delete("/deleteProduct/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollection.deleteOne(query);
      console.log(result);
      res.send(result);
    });

    // Update Order Payment Status
    app.put("/paymentUpdate/:email", verifyJWT, async (req, res) => {
      const decoded = req.decoded;
      if (decoded.email !== req.params.email) {
        return res.status(401).send({ message: "UnAuthorized Access!" });
      }
      const id = req.body._id;
      const transactionId = req.body.transactionId;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          transactionId: transactionId,
          paymentStatus: true,
        },
      };
      const result = await orderCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });
  } finally {
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Materia Server is Running");
});

app.listen(port, () => {
  console.log("Server Running Port : ", port);
});
