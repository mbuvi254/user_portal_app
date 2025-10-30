import express, {} from "express";
import { getAllUsers, getUser, registerUser } from "./controllers/users.js";
const app = express();
//Middleware
app.use(express.json());
// Routes
app.get("/users", getAllUsers);
app.post("/users", registerUser);
app.get("/users/:id", getUser);
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`App Running on port ${PORT}`);
});
//# sourceMappingURL=app.js.map