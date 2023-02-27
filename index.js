const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, Collection } = require("mongodb");
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
    console.log("DBCooonected");
    const productCollection = client.db("products").collection("product");

    app.post("/addNewProduct", async (req, res) => {
      const data = req.body.product;
      const result = await productCollection.insertOne(data);
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
