const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const userRouter = require('./routes/userRoutes')

dotenv.config();

const app =express();
const PORT =process.env.PORT || 3000;

app.use(express.json());

mongoose.connect(process.env.MONGODB_URI,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(()=>{
    console.log("connected to mongoDB sucessfully");
}).catch((err)=>{
    console.error("error connecting to mongoDB",err.message);
    process.exit(1);
});//adkm

//MountRouter
app.use('/api/v1/users',userRouter);

app.get('/',(req,res)=>{
    res.send('Hello world!');
});

app.listen(PORT, ()=>{
    console.log(`Server is running on the ${PORT}`);
});
