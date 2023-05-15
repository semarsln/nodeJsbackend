const express=require("express");
require("dotenv").config();
require("./db")
const cors=require("cors")

const User=require("./model/user")

const app=express(); 

app.use(cors())
const userRouter=require("./router/user")


app.get("/",(req,res)=> {
    res.send("Backend");
})

app.use(express.json())
app.use(userRouter)
app.use(stationRouter)
app.listen(8000,()=>{
    console.log("Backend is running")
})


