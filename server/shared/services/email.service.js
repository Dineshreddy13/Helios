import { emailQueue } from "#jobs/queues/email.queue.js";

export const sendEmail = async ({ to, subject, template, data }) => {
  await emailQueue.add("send-email", {
    to,
    subject,
    template,
    data,
  });
};