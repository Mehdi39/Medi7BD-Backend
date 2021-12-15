import express from 'express'
import cors from 'cors'
import { MongoClient, ObjectId } from 'mongodb'
import dotenv from 'dotenv'
dotenv.config();

const app = express()
app.use(express.json())
app.use(cors())

const PORT = process.env.PORT || 5000

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.g88s9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function server() {
    try {
        await client.connect()
        const database = client.db('Products')
        const medicineCollection = database.collection('Medicine')
        const reviewsCollection = database.collection('Reviews')
        const userCollection = database.collection('users')
        const orderCollection = database.collection('orders')

        console.log('database connected')


        // GET API for exact 6 medicine
        app.get('/medicine', async (req, res) => {
            const cursor = medicineCollection.find({})
            const Medicines = await cursor.limit(6).toArray()
            res.send(Medicines)
        })

        // GET API single medicine 
        app.get('/medicine/:id', async (req, res) => {
            const id = req.params.id
            const query = {_id: ObjectId(id)}

            const service = await medicineCollection.findOne(query)

            res.send(service)
        })

        // GET API for all reviews
        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({})
            const reviews = await cursor.toArray()
            res.send(reviews)
        })

        // GET API for all pharmachy
        app.get('/pharmachy', async (req, res) => {
            const cursor = medicineCollection.find({})
            const Medicines = await cursor.toArray()
            res.send(Medicines)
        })

        // GET API get purchase by mail
        app.get('/purchase', async (req, res) => {
            const email = req.query.email
            const query = {email: email}
            const cursor = orderCollection.find(query)
            const orders = await cursor.toArray()
            res.json(orders)
        })

        // POST API add new medicine to database
        app.post('/addmedicine', async(req, res) => {
            const data = req.body
            const result = await medicineCollection.insertOne(data)

            res.send(result)
        })

        // POST API for saving user data to database
        app.post('/users', async (req, res) => {
            const data = req.body
            const resutl = await userCollection.insertOne(data)

            res.json(resutl)
        })

        // PUT API for saving google login user data to database
        app.put('/users', async (req, res) => {
            const user = req.body
            const filter = { email: user.email }
            const options = { upsert: true }
            const updateDoc = { $set: user }
            const result = await userCollection.updateOne(filter, updateDoc, options)
            res.json(result)
        })

        // PUT API for making admin
        app.put('/users/makeadmin', async (req, res) => {
            const user = req.body
            const filter = { email: user.email }
            const updateDoc = { $set: { role: 'admin' }}
            const result = await userCollection.updateOne(filter, updateDoc)
            res.json(result)
        })

        // GET API for admin control
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email}
            const user = await userCollection.findOne(query)
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true
            }

            res.json({ admin: isAdmin })
        })

        // POST API for adding new reviews
        app.post('/review', async (req, res) => {
            const data = req.body
            const result = await reviewsCollection.insertOne(data)

            res.json(result)
        })

        // POST API for adding order in database
        app.post('/addorder', async (req, res) => {
            const data = req.body
            const result = await orderCollection.insertOne(data)

            res.json(result)
        })

        // DELETE API for deleting order
        app.delete('/cancelorder', async (req, res) => {
            const result = await orderCollection.deleteOne({
                _id: ObjectId(req.query.pdID)
            })

            res.send(result)
        })
    } finally {
        
    }   
}

server().catch(console.dir);


app.get('/', (req, res) => {
    res.send("Medi7BD Server !!!")
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})