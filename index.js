
const express = require('express');
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');
require('dotenv').config();
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
    const userDB = client.db('Fitness-Tracker-Project').collection('user');
    const TainerDB = client.db('Fitness-Tracker-Project').collection('trainer');
    const RequestToBeTainerDB = client.db('Fitness-Tracker-Project').collection('RequestToBeTainer');
    const NewsLatterDB = client.db('Fitness-Tracker-Project').collection('NewsLatter');
    const NewClassDB = client.db('Fitness-Tracker-Project').collection('classes');
    const PaymentDB = client.db('Fitness-Tracker-Project').collection('paymentHistory');
    const forumPosttDB = client.db('Fitness-Tracker-Project').collection('ForumPost');
    const ReviewDB = client.db('Fitness-Tracker-Project').collection('Review');


    // jwt related api
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
      res.send({ token });
    })
 
    // middlewares 
    const verifyToken = (req, res, next) => {
     
      if (!req.headers.authorization) {
        return res.status(401).send({ message: 'unauthorized access' });
      }
      const token = req.headers.authorization.split(' ')[1];
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).send({ message: 'unauthorized access' })
        }
        req.decoded = decoded;
        next();
      })
    }

    // use verify admin after verifyToken
    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await userDB.findOne(query);
      const isAdmin = user?.role == 'admin';
      if (!isAdmin) {
        return res.status(403).send({ message: 'forbidden access' });
      }
      next();
    }
    
 

    app.get('/users/admin/:email', verifyAdmin, async (req, res) => {
      console.log('check', req.params)
      const email = req.params.email;
      console.log(req.headers)
      if (email !== req.decoded.email) {
        return res.status(403).send({ message: 'forbidden access' })
      }
 
      const query = { email: email };
      const user = await userDB.findOne(query);
      let admin = false;
      if (user) {
        admin = user?.role == 'admin';
      }
      res.send({ admin });
    })










    // ALL GET METHOD
    app.get("/users",verifyToken, async (req, res) => {
      const find = userDB.find()
      const result = await find.toArray()
      res.send(result)
    })
 
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      console.log(email)

      const quary = { email: email }
      const result = await userDB.findOne(quary)
      res.send(result)
    })



    app.get("/trainers", async (req, res) => {
      const find = TainerDB.find()
      const result = await find.toArray()
      res.send(result)
    })

    app.get("/trainers/:id",verifyToken, async (req, res) => {
      console.log(req.headers)
      const id = req.params.id;
      const quary = { _id: new ObjectId(id) }
      const result = await TainerDB.findOne(quary)
      res.send(result)
    })

    app.get("/trainer/:status1", async (req, res) => {
      console.log(req.headers)
      const status1 = req.params.status1;
      console.log(status1)
      const quary = { status: status1 }
      const result = await TainerDB.find(quary).toArray()
      res.send(result)
    })

    app.get("/alltrainer/:email",verifyToken, async (req, res) => {
      const email = req.params.email;
      console.log(email)
      const quary = { user_email: email }
      const result = await TainerDB.findOne(quary)
      res.send(result)
    })

    //public route ditected
    app.get('/trainers/classes/:className',async (req, res) => {

      const className = req.params.className;
      const trainers = await TainerDB.find({
        'classes.value': className
      }).toArray();
      res.send(trainers);

    });
    // get classes
    app.get("/NewClass", async (req, res) => {
      const find = NewClassDB.find()
      const result = await find.sort({ totalBook: -1 }).toArray()
      res.send(result)
    })

    app.get("/NewClass/:className", async (req, res) => {
      const className = req.params.className;
      console.log(className)
      const quary = { className: className }
      const result = await NewClassDB.findOne(quary)
      res.send(result)
    })


    app.get("/newsLatter",verifyToken, async (req, res) => {
      console.log(req.headers)
      const find = NewsLatterDB.find()
      const result = await find.toArray()
      res.send(result)
    })
    // payment
    app.get("/payment",verifyToken,  async (req, res) => {
      const find = PaymentDB.find()
      const result = await find.sort({ _id: -1 }).toArray()
      res.send(result)
    })
    app.get("/payment/:class", async (req, res) => {
      const Findclass = req.params.class;

      const quary = { class: Findclass }
      const result = await PaymentDB.find(quary).toArray()
      res.send(result)
    })

    app.get("/payment/mail/:email", async (req, res) => {
      const email = req.params.email;

      const quary = { email: email }
      const result = await PaymentDB.find(quary).toArray()
      res.send(result)
    })

    app.get("/ckeckbooking/:email/:slotTime",verifyToken, async (req, res) => {
      console.log(req.headers)
      const { email, slotTime } = req.params;
      const query = { trainerEmail: email, selectedSlot: slotTime };
      const result = await PaymentDB.find(query).toArray()
      res.send(result)
    })

    // get forumPost
    app.get("/forumPost", async (req, res) => {
      const find = forumPosttDB.find()
      const result = await find.sort({ _id: -1 }).toArray()
      res.send(result)
    })
    app.get("/review", async (req, res) => {
      const find = ReviewDB.find()
      const result = await find.sort({ _id: -1 }).toArray()
      res.send(result)
    })

    app.post("/users", async (req, res) => {
      const user = req.body;
      const quary = { email: user.email }
      const existingSubscriber = await userDB.findOne(quary)
      if (existingSubscriber) {
        return res.send({ message: '0' })
      }
      else {
        const result = await userDB.insertOne(user)
        res.send(result)
      }

    })


    app.post("/trainers",verifyToken, async (req, res) => {
      const trainer = req.body;
      const quary = { user_email: trainer.user_email }
      console.log(quary)
      const existingtrainer = await TainerDB.findOne(quary)
      console.log(existingtrainer)
      if (existingtrainer) {
        return res.send({ message: '0' })
      }
      const result = await TainerDB.insertOne(trainer)
      res.send(result)
    })

    //newslatter subscriber

    app.post("/newsLatter", async (req, res) => {
      const subscriber = req.body;
      console.log(subscriber.user_email)
      const quary = { user_email: subscriber.user_email }
      const existingSubscriber = await NewsLatterDB.findOne(quary)
      if (existingSubscriber) {
        return res.send({ message: '0' })
      }
      else {
        const result = await NewsLatterDB.insertOne(subscriber)
        res.send(result)
      }

    })

    // add new class
    app.post("/NewClass", async (req, res) => {
      const newClass = req.body;
      const result = await NewClassDB.insertOne(newClass)
      res.send(result)
    })


    // add review
    app.post("/review", verifyToken, async (req, res) => {
      const review = req.body;
      const result = await ReviewDB.insertOne(review)
      res.send(result)
    })

    // add forum post
    app.post("/forumPost", async (req, res) => {
      const newClass = req.body;
      const result = await forumPosttDB.insertOne(newClass)
      res.send(result)
    })
    // Payment
    app.post("/payment",verifyToken, async (req, res) => {
      console.log(req.headers)
      const Payment = req.body

      const result = await PaymentDB.insertOne(Payment)
      res.send(result)


    })


    app.post("/RequestToBeTrainer", async (req, res) => {
      const requestToBeTrainer = req.body;
      const result = await RequestToBeTainerDB.insertOne(requestToBeTrainer)
      res.send(result)
    })


    // ALL UPDATE

    app.put("/trainers/:id",verifyToken, async (req, res) => {
      const id = req.params.id;
      const trainerData = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          status: trainerData.status,
          SlotTime: trainerData.SlotTime,
          classes: trainerData.Classes,
          AvailableDaysAWeek: trainerData.AvailableDaysAWeek,
          FeedBack: trainerData.FeedBack,

        }
      };
      const result = await TainerDB.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      console.log("user is", email)
      const UserData = req.body;
      const filter = { email: email };
      const updateDoc = {
        $set: {
          name: UserData.name,
          photoURL: UserData.photoURL,



        }
      };
      const result = await userDB.updateOne(filter, updateDoc);
      res.send(result);
    });
    // app.put("/trainer/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const trainerData = req.body;
    //   const filter = { _id: new ObjectId(id) };
    //   const updateDoc = {
    //     $set: {
    //       SlotTime: trainerData.SlotTime,


    //     }
    //   };
    //   const result = await TainerDB.updateOne(filter, updateDoc);
    //   res.send(result);
    // });


    app.put("/users/:email",verifyToken, async (req, res) => {
      const email = req.params.email;
      console.log(email)
      const userData = req.body;
      const filter = { email: email };
      console.log(filter)
      const options = { upset: true };
      const updateDoc = {
        $set: {
          role: userData.role,
        }
      };
      const result = await userDB.updateOne(filter, updateDoc, options);
      res.send(result);
    })


    app.put("/NewClass/:className", async (req, res) => {
      const className = req.params.className;
      const totalBook = req.body.totalBook || 0;
      console.log(totalBook);

      const filter = { className: className };
      console.log(filter);

      const options = { upsert: true };
      const updateDoc = {
        $set: {
          totalBook: totalBook + 1,
        },
      };

      const result = await NewClassDB.updateOne(filter, updateDoc, options);
      res.send(result);
    });

    app.put("/forumPost/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const userData = req.body;
      const filter = { _id: new ObjectId(id) };
      console.log(filter);
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          totalUpvote: userData.totalUpvote,
          message: userData.message,
        },
      };
      const result = await forumPosttDB.updateOne(filter, updateDoc, options);
      res.send(result);
    })

    // ALL DELETE


    // app.delete("/trainers/:id/slots/:slot", async (req, res) => {
    //   const { id, slot } = req.params;

    //   try {
    //     // Fetch the trainer document
    //     const trainer = await TainerDB.findOne({ _id: new ObjectId(id) });

    //     if (!trainer) {
    //       return res.status(404).json({ message: "Trainer not found" });
    //     }

    //     // Filter out the slot
    //     const updatedSlots = trainer.SlotTime.filter(s => s !== slot);
    //     console.log(updatedSlots)
    //     // Update the trainer's document
    //     const result = await TainerDB.updateOne(
    //       { _id: new ObjectId(id) },
    //       { $set: { SlotTime: updatedSlots } }
    //     );

    //     if (result.modifiedCount === 0) {
    //       return res.status(404).json({ message: "Slot not found or already deleted" });
    //     }

    //     res.json({ message: "Slot deleted successfully" });
    //   } catch (error) {
    //     console.error("Error deleting slot:", error);
    //     res.status(500).json({ message: "Internal server error" });
    //   }
    // });
    app.delete("/trainers/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await TainerDB.deleteOne(query);
      res.send(result)
    })


    app.delete("/trainers/:id/:slot", async (req, res) => {
      const id = req.params.id;
      const slot = req.params.slot;
      console.log(id, slot)
      const query = { _id: new ObjectId(id) };
      console.log(query)
      try {
        const trainer = await TainerDB.findOne(query);
        console.log(typeof (trainer))
        if (!trainer) {
          return res.status(404).json({ message: "Trainer not found" });
        }

        const updatedSlots = trainer.SlotTime.filter(s => s !== slot);

        const update = { $set: { SlotTime: updatedSlots } };
        const result = await TainerDB.updateOne(query, update);

        if (result.modifiedCount === 0) {
          return res.status(404).json({ message: "Slot not found or already deleted" });
        }

        res.json({ message: "Slot deleted successfully" });
      } catch (error) {
        console.error("Error deleting slot:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

  }
}
run().catch(console.dir);








app.get('/features', async (req, res) => {
  res.send(feature)
})










app.get("/", (req, res) => {
  res.send('server is running');
})

app.listen(port, () =>
  console.log('running port is ', port)
)