import fs from "fs/promises";
import path from "path";
import handlebars from "handlebars";
import { fileURLToPath } from "url";
import logger from "./logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const renderTemplate = async (templateName, variables) => {
    try {
        const normalizedTemplateName = templateName === "TaskReminderEmail" ? "taskReminderEmail" : templateName;
        const layoutPath = path.join(__dirname, "../templates/emails/layout/main.hbs");
        const templatePath = path.join(__dirname, `../templates/emails/${normalizedTemplateName}.hbs`);
        
        const [layoutContent, templateContent] = await Promise.all([
            fs.readFile(layoutPath, "utf-8"),
            fs.readFile(templatePath, "utf-8")
        ]);

        const pageTemplate = handlebars.compile(templateContent);
        const layoutTemplate = handlebars.compile(layoutContent);

        // Pre-process some variables if needed
        let processedVariables = { ...variables };
        if (templateName === "taskReminderEmail" && variables.reminderAt) {
            processedVariables.reminderAtFormatted = new Date(variables.reminderAt).toLocaleString();
        }

        const pageHtml = pageTemplate(processedVariables);
        const html = layoutTemplate({ body: pageHtml });
        
        return html;
    } catch (error) {
        logger.error(`Error rendering template ${templateName}:`, error);
        throw error;
    }
};
