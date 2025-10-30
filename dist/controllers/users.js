import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import express, {} from "express";
const client = new PrismaClient();
async function hashPassword(plainPassword) {
    const hashedPassword = await bcrypt.hash(plainPassword, 12);
    return hashedPassword;
}
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
//# sourceMappingURL=users.js.map