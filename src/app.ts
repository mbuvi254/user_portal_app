import express, {type Express } from  "express"
import cors from "cors"
import { getAllUsers,getUser,loginUser,registerUser } from "./controllers/users.js"


const app : Express = express();

//Middleware
app.use(express.json());
app.use(cors())

// Routes
app.get("/users",getAllUsers)
app.post("/users",registerUser)
app.get("/users/:id",getUser)
app.post('/users/login',loginUser)





const PORT = 5000;
app.listen(PORT,()=>{
    console.log(`App Running on port ${PORT}`)
});


