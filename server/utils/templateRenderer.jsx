import React from "react";
import { render } from "@react-email/render";
import { OtpEmail } from "../templates/emails/OtpEmail.jsx";
import { TaskReminderEmail } from "../templates/emails/TaskReminderEmail.jsx";
import logger from "./logger.js";

export const renderTemplate = async (templateName, variables) => {
    try {
        if (templateName === "otpEmail") {
            const html = await render(<OtpEmail {...variables} />);
            return html;
        }

        if (templateName === "TaskReminderEmail") {
            const html = await render(<TaskReminderEmail {...variables} />);
            return html;
        }

        throw new Error(`Template not found: ${templateName}`);
    } catch (error) {
        logger.error(`Error rendering template ${templateName}:`, error);
        throw error;
    }
};