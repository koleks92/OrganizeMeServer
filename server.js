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
        enum: ["do", "buy", "sell", "check"],
    },
    shop: String,
    extra: String,
    completed: {
        type: Boolean,
        required: true,
    },
});

const Task = mongoose.model("Task", TaskSchema);

// Get one task by id
app.get("/tasks/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const task = await Task.findById(id);
        res.status(200).json(task);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete one task by id
app.delete("/tasks/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const task = await Task.findByIdAndDelete(id);
        res.status(200).json({ message: "Task deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all not completed tasks
app.get("/tasks", async (req, res) => {
    try {
        const tasks = await Task.find({ completed: false });
        res.status(200).json(tasks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all completed tasks(history)
app.get("/history", async (req, res) => {
    try {
        const tasks = await Task.find({ completed: true });
        res.status(200).json(tasks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add new Task
app.post("/tasks", async (req, res) => {
    const newTask = new Task({
        name: req.body.name,
        type: req.body.type,
        completed: req.body.completed,
        shop: req.body.shop,
        extra: req.body.extra,
    });
    try {
        const savedTask = await newTask.save();
        res.status(201).json(savedTask);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Edit task
app.put("/tasks/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const updatedName = req.body.name;
        const updatedType = req.body.type;
        const updatedShop = req.body.shop;
        const updatedExtra = req.body.extra;
        const options = { new: true }; // To return new document
        const task = await Task.findByIdAndUpdate(id, {
            name: updatedName,
            type: updatedType,
            shop: updatedShop,
            extra: updatedExtra,
            completed: false,
        }, options);
        res.status(200).json(task);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Mark as completed/uncompleted
app.put("/tasks/:id/completed", async (req, res) => {
  try {
    const id = req.params.id;
    let completed = req.params.completed;
    
    if (completed === true) {
      completed = false;  
    } else {
      completed = true;
    };

    const options = { new: true }; // To return new object

    const task = await Task.findByIdAndUpdate(id, {
      completed: completed
    }, options)
    res.status(200).json(task);
  } catch (err) {
    res.status(500).json({message: err.message});
  }
})

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
