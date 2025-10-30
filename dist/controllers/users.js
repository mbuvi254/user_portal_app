import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import express, {} from "express";
const client = new PrismaClient();
// Password Hash helper function
async function hashPassword(plainPassword) {
    const hashedPassword = await bcrypt.hash(plainPassword, 12);
    return hashedPassword;
}
//Verify
async function comparePassword(password, dbPassword) {
    try {
        const hashedPassword = dbPassword;
        const plainPassword = password;
        const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
        if (isMatch) {
            return true;
        }
        else {
            return false;
        }
    }
    catch (error) {
        console.log(error);
    }
}
;
async function generateToken(id, username) {
    try {
        const payload = { id, username };
        const token = jwt.sign(payload, "MYSECRETKEY", { expiresIn: 50000 });
        return token;
    }
    catch (error) {
        console.log(error);
    }
}
;
export const registerUser = async (req, res) => {
    try {
        const { username, firstName, lastName, email, password } = req.body;
        if (!username || !firstName || !lastName || !email || !password) {
            console.log("All fields required");
            return res.status(500).json({ message: "Something Went Wrong" });
        }
        const existingUser = await client.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "User already registered" });
        }
        const hashedPassword = await hashPassword(password);
        const newUser = await client.user.create({ data: { username, firstName, lastName, email, password: hashedPassword }, });
        console.log(`User registed ${newUser}`);
        return res.status(201).json({
            message: "User Registered Successfully",
            user: newUser
        });
    }
    catch (error) {
        console.error("Error occured during user regitration:", error);
        return res.status(500).json({
            message: "Something Went Wrong"
        });
    }
};
export const getAllUsers = async (req, res) => {
    try {
        const users = await client.user.findMany();
        console.log(users);
        return res.status(200).json(users);
    }
    catch (error) {
        console.error("Error occured during fetching users:", error);
        return res.status(500).json({ message: "Something Went Wrong" });
    }
};
export const getUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = Number(id);
        if (isNaN(userId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }
        const user = await client.user.findUnique({
            where: { id: userId },
            include: { tasks: true }
        });
        if (!user) {
            console.log("No user found");
            return res.status(404).json("User not Found");
        }
        return res.status(200).json(user);
    }
    catch (error) {
        console.error("Database Error:", error);
        return res.status(500).json({ message: "Something Went Wrong" });
    }
    ;
};
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            console.log("All fields required");
            return res.status(500).json({ message: "Something Went Wrong" });
        }
        //const inputPassword= await hashPassword(password);
        //Get User Data
        const user = await client.user.findUnique({ where: { email } });
        if (!user) {
            console.log("User data not loaded");
            return res.status(404).json({ message: "User not found" });
        }
        //Assign db user password
        const dbPassword = user.password;
        const validityPassword = await comparePassword(password, dbPassword);
        if (validityPassword) {
            const accessToken = generateToken(user.id, user.username);
            return res.status(200).json({ message: "Well ! Your Password worked", accessKey: accessToken });
        }
        else {
            return res.status(500).json("Whoops! Your Password did not worked");
        }
    }
    catch (error) {
        console.error("Login Failed:", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};
//# sourceMappingURL=users.js.map