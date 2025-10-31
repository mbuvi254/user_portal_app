import  { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';

import express, { type Request, type Response } from "express";

const client = new PrismaClient()


// Password Hash helper function
async function hashPassword(plainPassword :string) {
  const hashedPassword = await bcrypt.hash(plainPassword, 12);
  return hashedPassword

}

//Verify
async function comparePassword(password:string,dbPassword:string) {
    try{
        const hashedPassword =dbPassword;
        const plainPassword = password;
       
        const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
        if (isMatch) {
           return true
       } else {
          return false
  }
}catch(error){
  console.log(error);
}
};



function generateToken(id:Number,username :string) {
    const payload = {id,username};
    try{
       return jwt.sign(payload, "MYSECRETKEY", { expiresIn: 50000}); 
    }catch(error){
      console.log(`JWT Sign Error: ${error}`);
      return null    
    }
};




export const registerUser = async (req:Request, res:Response)=>{
    try{
        const {username,firstName,lastName,email,password}=req.body;

        if(!username || ! firstName || ! lastName || ! email || ! password){
            console.log("All fields required");
            return res.status(500).json({message:"Something Went Wrong"})
        }
        
        const existingUser = await client.user.findUnique({ where: { email } });
        if (existingUser) {
            console.log("User already registered");
        return res.status(400).json({ message: "User already registered" });
        }

        const hashedPassword = await hashPassword(password)
    
        const newUser = await client.user.create({data : {username,firstName,lastName,email,password:hashedPassword},});
        console.log(`User registed ${newUser.username}`)
        return res.status(201).json({
            message: "User Registered Successfully",
            user: newUser
        });
        
    }catch(error){
        console.error("Error occured during user regitration:",error)
        return res.status(500).json({
            message:"Something Went Wrong"
        });
        
    }
   
}



export  const getAllUsers = async (req:Request,res:Response)=>{
    try{
        const users = await client.user.findMany();
        console.log(users)
        return res.status(200).json(users)
    }catch(error){
        console.error("Error occured during fetching users:",error)
        return res.status(500).json({ message:"Something Went Wrong" });
    
    }
}

export const getUser = async (req:Request,res:Response)=>{
    try{
        const {id} =req.params;

        const userId = Number(id);
        if(isNaN(userId)){
             return res.status(400).json({ message: "Invalid user ID" });
         
        }
        const user = await client.user.findUnique({
            where :{ id : userId},
             include :{tasks:true} 
        });
        if(!user){
            console.log("No user found");
            return res.status(404).json("User not Found")
        }
        return res.status(200).json(user);
    }catch(error){
        console.error("Database Error:",error);
        return res.status(500).json({message:"Something Went Wrong"})
    };
}

export const loginUser = async (req:Request,res:Response)=>{
    try{
        const {email,password}=req.body;

        if(! email || ! password){
            console.log("All fields required");
            return res.status(500).json({message:"Something Went Wrong"})
        }
        //const inputPassword= await hashPassword(password);
        //Get User Data
        const user = await client.user.findUnique({where :{ email }});

        if(!user){
            console.log("User data not loaded");
            return res.status(404).json({message:"User not found"});
        }
        //Assign db user password
        const dbPassword =user.password;

        const validityPassword = await comparePassword(password,dbPassword);
        if(validityPassword){
            const accessToken  =generateToken(user.id,user.username)
            if(!accessToken){
                return res.status(500).json({message:"Token generation failed"});
            }
            console.log("Login Successful",accessToken);
            return res.status(200).json({message:"Well ! Your Password worked",accessToken});
        }else{
            return res.status(500).json("Whoops! Your Password did not worked");
        }

    }catch(error){
        console.error("Login Failed:",error);
        return res.status(500).json({message:"Something went wrong"});
    }
}