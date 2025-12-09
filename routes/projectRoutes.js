const express = require("express");
const { authMiddleware } = require("../middlewares/auth");
const Project = require("../models/Project");
const Task = require("../models/Task")

const projectRouter = express.Router();

// Protects all routes in this router
projectRouter.use(authMiddleware);

/**
 * GET /api/projects
 */

projectRouter.get("/", async (req, res) => {
  try {
    console.log(req.user);

    // check that user is logged in
    if (!req.user) {
      return res.status(401).json({ message: `User not logged in!` });
    }

    const userProjects = await Project.find({ user: req.user._id });

    console.log(userProjects);
    res.json(userProjects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/projects/:projectId
 */

projectRouter.get("/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;

    // check that user is logged in
    if (!req.user) {
      return res.status(401).json({ message: `User not logged in!` });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res
        .status(404)
        .json({ message: `Project with id: ${projectId} not found!` });
    }

    // Authorization
    //console.log(req.user._id);
    //console.log(`project user: ${project.user}`);

    if (project.user.toString() !== req.user._id) {
      return res.status(403).json({ message: "user is not authorized!" });
    }

    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/projects
 */
projectRouter.post("/", async (req, res) => {

  // check that user is logged in
  if (!req.user) {
    return res.status(401).json({ message: `User not logged in!` });
  }

  try {
    const newProject = await Project.create({
      ...req.body,
      user: req.user._id,
    });

    res.status(201).json(newProject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/projects/projectId
 */
projectRouter.put("/:projectId", async (req, res) => {
  //res.send("update project....");
  try {

    // check that user is logged in
    if (!req.user) {
      return res
            .status(401)
            .json({ message: `User not logged in!`});
    }


    const { projectId } = req.params;
    const projectToUpdate = await Project.findById(projectId);

    // authorization check
    if (projectToUpdate.user.toString() !== req.user._id) {
      return res.status(403).json({ message: "user is not authorized!" });
    }

    // update project
    const updatedProject = await Project.findByIdAndUpdate(
        projectId,
        req.body,
        {new:true}
    )

    if(!updatedProject) return res.status(400).json({error: "Project not found"})
    
    res.json(updatedProject).send("updating project...")

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/projects/projectId
 */
projectRouter.delete("/:projectId", async (req, res) => {
  //res.send("delete project....");
  try {

    // check that user is logged in
    if (!req.user) {
      return res
            .status(401)
            .json({ message: `User not logged in!`});
    }


    const { projectId } = req.params;
    const projectToDelete = await Project.findById(projectId);

    if(!projectToDelete) return res.status(400).json({error: "Project not found"})

    // authorization check
    if (projectToDelete.user.toString() !== req.user._id) {
      return res.status(403).json({ message: "user is not authorized!" });
    }

    

    const removeProject = await Project.findByIdAndDelete(projectId)

    res.json(`Removed project: ${removeProject.name}`)

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//===================================================
/**
 * Routes for tasks under projects ----------------
 */
//===================================================

/**
 * POST /api/projects/:projectId/tasks
 */

projectRouter.post("/:projectId/tasks", async (req, res) => {

  // check that user is logged in
  if (!req.user) {
    return res.status(401).json({ message: `User not logged in!` });
  }

  const { projectId } = req.params;
  //console.log(`projectId = ${projectId}`)
  const projectToUpdate = await Project.findById(projectId);

  // authorization check
  if (projectToUpdate.user.toString() !== req.user._id) {
    return res.status(403).json({ message: "user is not authorized!" });
  }

  if(!projectToUpdate) return res.status(400).json({error: "Project not found"})

  try {
    const newTask = await Task.create({
      ...req.body,
      project: projectToUpdate._id,
    });

    res.status(201).json(newTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});


/**
 * GET /api/projects/:projectId/tasks
 */

projectRouter.get("/:projectId/tasks", async (req, res) => {
  try {
    //console.log(req.user);

    // check that user is logged in
    if (!req.user) {
      return res.status(401).json({ message: `User not logged in!` });
    }

    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if(!project) return res.status(400).json({error: "Project not found"})

    console.log(project._id)
    // authorization check
    if (project.user.toString() !== req.user._id) {
      return res.status(403).json({ message: "user is not authorized!" });
    }

    const projectTasks = await Task.find({ project: projectId });


    //console.log(projectTasks);
    res.json(projectTasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});


module.exports = projectRouter;
