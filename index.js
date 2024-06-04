require('dotenv').config()
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const feature = require('./Features.json');


// MIDDLEWARE

app.use(cors());
app.use(express.json());



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://Fitness-Tracker-Project:0TkmXKHJoSThlXSD@cluster0.2vutuar.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    const TainerDB = client.db('Fitness-Tracker-Project').collection('trainer');
    const RequestToBeTainerDB = client.db('Fitness-Tracker-Project').collection('RequestToBeTainer');

    app.get("/trainers",async(req,res)=>{
      const find= TainerDB.find()
      const result =await find.toArray()
      res.send(result)
    })

    app.get("/trainers/:id", async(req,res)=>{
      const id= req.params.id;
      const quary = {_id: new ObjectId(id)}
      const result = await TainerDB.findOne(quary)
      res.send(result)
    })
 
    app.get("/RequestToBeTrainer", async(req,res)=>{
      const find=RequestToBeTainerDB.find();
      const result= await find.toArray()
      res.send(result)
    })
    app.get("/RequestToBeTrainer/:id", async(req,res)=>{
      const id= req.params.id;
      const quary = {_id: new ObjectId(id)}
      const result = await RequestToBeTainerDB.findOne(quary)
      res.send(result)
    })

    app.post("/trainers", async(req,res)=>{
      const trainer = req.body;   
      const result = await TainerDB.insertOne(trainer)
      res.send(result)
    })

    app.post("/RequestToBeTrainer",async(req,res)=>{
      const requestToBeTrainer= req.body;
      const result = await RequestToBeTainerDB.insertOne(requestToBeTrainer)
      res.send(result)
    })
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    
  }
}
run().catch(console.dir);








app.get('/features', async(req,res)=>{
    res.send(feature)
})










app.get("/", (req,res)=>{
    res.send('server is running');
})

app.listen(port, ()=>
    console.log('running port is ' , port )
)