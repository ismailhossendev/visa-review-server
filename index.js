// express server setup 
const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config();

//jwt
const jwt = require('jsonwebtoken');

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


// jwt verify function
const verifyToken = (req, res, next) => {
    const Header = req.headers.authorization;
    if(!Header){
        return res.status(401).send({
            message:'unauthorized access',
            data:[]
        })
    } 
        

    const token = Header.split(' ')[1];

    jwt.verify(token,process.env.JWT_SECRET,function(err,decoded){
        if(err){
            return res.status(403).send({
                message:'forbidden access',
            });
        }
        req.decoded = decoded
        next();
    })

}



// routes
app.get('/', (req, res) => {
    res.send('server is running');
})

app.post('/jwt', (req, res) =>{
    const user = req.body.email;
    const token = jwt.sign(user, process.env.JWT_SECRET)
    console.log(token);
    res.send({token})
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
    const limit = Number(req.query.limit) || 0;
    
    if(req.query.productId){
        filter = {productId: req.query.productId};
    }
    const result = await reviews.find(filter).sort({time: -1}).limit(limit).toArray();
    res.send({
        success: true,
        message: 'Reviews fetched successfully',
        data: result
    })
})

app.get('/my-review',verifyToken,async(req,res)=>{
    const email = req.query.email;
    const decoded = req.decoded;
    const filter = {email:email}
    if(email != decoded){
        return res.send({
            message: 'access dined',
            data:[]
            
        })
    }
    const result = await reviews.find(filter).toArray();
    res.send({
        success: true,
        message: 'Reviews fetched successfully',
        data: result
    })

})


app.delete('/reviews/:id',async(req,res)=>{
    const id = req.params.id;
    const result = await reviews.deleteOne({_id: ObjectId(id)});
    res.send({
        success: true,
        message: 'Review deleted successfully',
        data: result
    })
})

app.patch('/reviews/:id',async(req,res)=>{
        const id = req.params.id;
        const {newReview} = req.body;

        const  updateDoc = {
            $set:{
                reviewText:newReview
            }
        }

        const result = await reviews.updateOne({_id:ObjectId(id)},updateDoc);
        res.send({
            success: true,
            message: 'Review updated successfully',
            data: result
        })
    
})

app.get('/services', async(req, res) => {
    const limit = req.query.limit || 0;
    const result = await services.find({}).sort({_id:-1}).limit(parseInt(limit)).toArray();
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