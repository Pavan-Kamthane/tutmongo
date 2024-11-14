// npm init - y
// npm install express mongodb nodemon

const express = require('express');
const mongodb = require('mongodb');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Local MongoDB connection string
const url = "mongodb://localhost:27017"; // Local MongoDB
const client = new mongodb.MongoClient(url);
let db, tasksCollection;

async function main() {
    try {
        await client.connect();
        db = client.db('todoDB'); // Use the database `todoDB`
        tasksCollection = db.collection('tasks'); // Use the `tasks` collection
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Failed to connect to MongoDB', error);
    }
}

main();

// Routes
// CREATE: Add a new task
app.post('/tasks', async (req, res) => {
    const { name } = req.body;
    const task = { name, completed: false };
    await tasksCollection.insertOne(task);
    res.sendStatus(201);
});

// READ: Get all tasks
app.get('/tasks', async (req, res) => {
    const tasks = await tasksCollection.find({}).toArray();
    res.json(tasks);
});

// UPDATE: Toggle task completion
// UPDATE: Edit task name or toggle completion status
app.put('/tasks/:id', async (req, res) => {
    const { id } = req.params;
    const { name, completed } = req.body;
    const updateFields = {};

    if (name !== undefined) updateFields.name = name;
    if (completed !== undefined) updateFields.completed = completed;

    try {
        await tasksCollection.updateOne(
            { _id: new mongodb.ObjectId(id) },
            { $set: updateFields }
        );
        res.sendStatus(200);
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ error: 'Failed to update task' });
    }
});


// DELETE: Delete a task
app.delete('/tasks/:id', async (req, res) => {
    const { id } = req.params;
    await tasksCollection.deleteOne({ _id: new mongodb.ObjectId(id) });
    res.sendStatus(200);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
