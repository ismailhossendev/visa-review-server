// express server setup 
const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config();

// middleware
app.use(express.json());
app.use(cors());

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.odx3u2z.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const services = client.db("Visa_Service").collection("services");

// connect to the database
client.connect(err => {
    if (err) {
        console.log('Error connecting to database', err);
    } else {
        console.log('Connected to database');
    }
});

// routes
app.get('/', (req, res) => {
    res.send('server is running');
})

app.get('/services', async(req, res) => {
    const limit = req.query.limit || 0;
    const result = await services.find({}).limit(parseInt(limit)).toArray();
    res.send({
        success: true,
        message:'Services fetched successfully',
        data: result
    })
})

app.post('/services/add', async(req, res) => {
    const service = req.body;
    const result = await services.insertOne(service)
    
    res.send({
        success: true,
        message: 'Service added successfully',
        data: result
    })
    
})



//exit 
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});