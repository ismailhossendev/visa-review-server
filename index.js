// express server setup 
const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config();

// middleware
app.use(express.json());
app.use(cors());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.odx3u2z.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const services = client.db("Visa_Service").collection("services");
const reviews = client.db("Visa_Service").collection("reviews");

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

app.post('/review',async(req,res)=>{
    const review = req.body;
    const result = await reviews.insertOne(review);
    res.send({
        success: true,
        message: 'Review added successfully',
        data: result
    })
})
app.get('/reviews',async(req,res)=>{
    let filter ={};
    const product = req.query.productId;
    if(req.query.email){
        filter = {email: req.query.email};
    }else if(req.query.productId){
        filter = {productId: product};
    }
    const result = await reviews.find(filter).sort({time: -1}).toArray();
    res.send({
        success: true,
        message: 'Reviews fetched successfully',
        data: result
    })
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

app.get('/services/:id', async(req, res) => {
    const id = req.params.id;
    const result = await services.findOne({_id: ObjectId(id)});
    if(result.length === 0) {
        res.send({
            success: true,
            message: 'Service fetched successfully',
            data: result
        })
    }else {
        res.send({
            success: false,
            message: 'product not found',
            data: result
        })
    }


})


//exit 
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});