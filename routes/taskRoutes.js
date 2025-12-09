const express = require("express");
const { authMiddleware } = require("../middlewares/auth");
const Project = require("../models/Project");
const Task = require("../models/Task")

const taskRouter = express.Router();

// Protects all routes in this router
taskRouter.use(authMiddleware);

/**
 * PUT /api/tasks/taskId
 */

taskRouter.put("/:taskId", async (req, res) => {
  //res.send("update project....");
  try {

    // check that user is logged in
    if (!req.user) {
      return res
            .status(401)
            .json({ message: `User not logged in!`});
    }


    const { taskId } = req.params;
    const taskToUpdate = await Task.findById(taskId);

    if(!taskToUpdate) return res.status(400).json({error: "Task not found"})

    const projectToUpdate = await Project.findById(taskToUpdate.project)

    // authorization check
    if (projectToUpdate.user.toString() !== req.user._id) {
      return res.status(403).json({ message: "user is not authorized!" });
    }

    // update task
    const updatedTask = await Task.findByIdAndUpdate(
        taskId,
        req.body,
        {new:true}
    )

    // if(!updatedTask) return res.status(400).json({error: "Task not found"})
    
    res.json(updatedTask).send("updating task...")

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/tasks/taskId
 */

taskRouter.delete("/:taskId", async (req, res) => {
  //res.send("update project....");
  try {

    // check that user is logged in
    if (!req.user) {
      return res
            .status(401)
            .json({ message: `User not logged in!`});
    }


    const { taskId } = req.params;
    const taskToUpdate = await Task.findById(taskId);

    if(!taskToUpdate) return res.status(400).json({error: "Task not found"})

    const projectToUpdate = await Project.findById(taskToUpdate.project)

    // authorization check
    if (projectToUpdate.user.toString() !== req.user._id) {
      return res.status(403).json({ message: "user is not authorized!" });
    }

    // delete task
    const removeTask = await Task.findByIdAndDelete(taskId)

    res.json(`Removed task: ${removeTask.title}`)

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = taskRouter;