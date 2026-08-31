import { Worker } from "bullmq";
import { redis } from "../../config/redis.js";
import { sendEmail } from "../../config/mail.js";
import { renderTemplate } from "../../utils/templateRenderer.js";
import logger from "../../utils/logger.js";

const processEmailJob = async (job) => {
  const { to, subject, template, data } = job.data;

  const html = await renderTemplate(template, data);
  
  await sendEmail({
    to,
    subject,
    html,
  });

  logger.info(`Email sent to ${to} | Job: ${job.id}`);
};

export const emailWorker = new Worker("emailQueue", processEmailJob, {
  connection: redis,
});

emailWorker.on("completed", (job) => {
  logger.info(`Email job ${job.id} completed.`);
});

emailWorker.on("failed", (job, err) => {
  logger.error(`Email job ${job.id} failed: ${err.message}`);
});