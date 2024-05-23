const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

// Get environment variables
require("dotenv").config();
const databaseUrl = process.env.MONGO_URI;

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB connection
mongoose
    .connect(databaseUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch((err) => {
        console.error(err);
    });

// Define a schema and model for task
const TaskSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
        enum: ["do", "buy", "sell", "check"]
    },
    shop: String,
    extra: String,
    completed: {
      type: Boolean,
      required: true},
});

const Task = mongoose.model("Task", TaskSchema);

// Get all tasks
app.get("/tasks", async (req, res) => {
    try {
        const tasks = await Task.find();
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ message: err.message });
        res.json("Hello")
    }
});

// Add new Task
app.post("/newTask", async (req, res) => {
  console.log(req.body.name);
  console.log(req.body.type);
    const newTask = new Task({
        name: req.body.name,
        type: req.body.type,
        completed: req.body.completed,
        shop: req.body.shop,
        extra: req.body.extra
    });
    try {
        const savedTask = await newTask.save();
        res.status(201).json(savedTask);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
