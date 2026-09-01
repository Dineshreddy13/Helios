import { Router } from "express";
import authRoute from "#modules/auth/auth.route.js";
import projectRoute from "#modules/projects/project.route.js";
import myInvitationsRoute from "#modules/projects/myInvitations.route.js";
import activityRoute from "#modules/activity/activity.route.js";
import userRoute from "#modules/users/user.route.js";
import taskRoute from "#modules/tasks/task.route.js";
import discussionRoute from "#modules/discussions/discussion.route.js";

const router = Router();

router.use("/auth", authRoute);
router.use("/projects", projectRoute);
router.use("/invitations", myInvitationsRoute);
router.use("/activity", activityRoute);
router.use("/users", userRoute);
router.use("/projects", taskRoute);
router.use("/projects", discussionRoute);

export default router;
