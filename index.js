const express = require("express");
const cors = require("cors");
require("dotenv").config();
const {
  MongoClient,
  ServerApiVersion,
  Collection,
  ObjectId,
} = require("mongodb");
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

async function run() {
  try {
    await client.connect();
    console.log("Mongo Server Connected");
    const productCollection = client.db("products").collection("product");
    const userCollection = client.db("users").collection("user");
    const reviewsCollection = client.db("users").collection("reviews");

    // Get All Products
    app.get("/allproducts", async (req, res) => {
      const result = await productCollection.find({}).toArray();
      res.send(result);
    });

    // Get Single Product with ID
    app.get("/singleProduct/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollection.findOne(query);
      res.send(result);
    });

    // Add New Product
    app.post("/addNewProduct", async (req, res) => {
      const data = req.body.product;
      const result = await productCollection.insertOne(data);
      res.send(result);
    });

    // Register New user
    app.post("/addNewUser", async (req, res) => {
      const data = req.body.userInfo;
      const result = await userCollection.insertOne(data);
      res.send(result);
    });

    // Get Signle User by Email
    app.get("/signleUser/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await userCollection.findOne(query);
      res.send(result);
    });

    // Update user Account
    app.put("/updateUser/:email", async (req, res) => {
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
      console.log(result);
      res.send(result);
    });

    // Get All User reviews
    app.get("/allreviews", async (req, res) => {
      const result = await reviewsCollection.find({}).toArray();
      res.send(result);
    });

    // Get Specific User Reviews
    app.get("/allreviews/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await reviewsCollection.find(query).toArray();

      res.send(result);
    });

    // User = Add New Reviews
    app.post("/addnewreviews/:email", async (req, res) => {
      const reviews = req.body.reviews;
      const result = await reviewsCollection.insertOne(reviews);
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
