import { Worker } from "bullmq";
import { redis } from "#config/redis.js";
import { emailQueue } from "../queues/email.queue.js";
import { db } from "#database/db.js";
import { tasks, users } from "#models/index.js";
import { eq } from "drizzle-orm";
import logger from "#utils/logger.js";

const processReminderJob = async (job) => {
  const { taskId } = job.data;

  // 1. Fetch the task from the database
  const [task] = await db
    .select({
      id: tasks.id,
      title: tasks.title,
      status: tasks.status,
      reminderAt: tasks.reminderAt,
      reminderSent: tasks.reminderSent,
      assigneeId: tasks.assigneeId,
      createdById: tasks.createdById,
    })
    .from(tasks)
    .where(eq(tasks.id, taskId))
    .limit(1);

  // 2. If the task no longer exists, do nothing
  if (!task) {
    logger.info(`Reminder job ${job.id}: Task ${taskId} not found.`);
    return;
  }

  // 3. If reminderAt is null, do nothing
  if (!task.reminderAt) {
    logger.info(`Reminder job ${job.id}: Task ${taskId} has no reminderAt set.`);
    return;
  }

  // 4. If reminderSent is already true, do nothing
  if (task.reminderSent) {
    logger.info(`Reminder job ${job.id}: Task ${taskId} reminder already sent.`);
    return;
  }

  // 5. If the task status is completed, do nothing
  if (task.status === "completed") {
    logger.info(`Reminder job ${job.id}: Task ${taskId} is already completed.`);
    return;
  }

  // 6. If the reminder time was changed and the current time is still before the new reminderAt
  const now = new Date();
  const reminderTime = new Date(task.reminderAt);
  if (now < reminderTime) {
    logger.info(`Reminder job ${job.id}: Task ${taskId} reminderAt is in the future. Ignoring old job.`);
    return;
  }

  // 7. Otherwise, add a task-reminder job to the existing emailQueue
  // We need to fetch the user to send the email to.
  // We should send it to the assignee if assigned, otherwise the creator.
  const targetUserId = task.assigneeId || task.createdById;
  const [user] = await db
    .select({ email: users.email, username: users.username })
    .from(users)
    .where(eq(users.id, targetUserId))
    .limit(1);

  if (!user || !user.email) {
    logger.warn(`Reminder job ${job.id}: Target user not found or missing email for task ${taskId}.`);
    return;
  }

  // 8. Pass the required information to the email job
  await emailQueue.add(
    "send-email",
    {
      to: user.email,
      subject: `Task Reminder: ${task.title}`,
      template: "TaskReminderEmail",
      data: {
        name: user.username,
        taskTitle: task.title,
        reminderAt: task.reminderAt,
      },
    }
  );

  // 9. Mark reminderSent = true after successfully adding the email job
  await db
    .update(tasks)
    .set({ reminderSent: true })
    .where(eq(tasks.id, taskId));
    
  logger.info(`Reminder job ${job.id} processed successfully for task ${taskId}.`);
};

export const reminderWorker = new Worker("reminderQueue", processReminderJob, {
  connection: redis,
});

reminderWorker.on("completed", (job) => {
  logger.info(`Reminder job ${job.id} completed.`);
});

reminderWorker.on("failed", (job, err) => {
  logger.error(`Reminder job ${job.id} failed: ${err.message}`);
});
