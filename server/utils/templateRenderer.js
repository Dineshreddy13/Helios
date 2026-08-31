import fs from "fs/promises";
import path from "path";
import handlebars from "handlebars";
import { fileURLToPath } from "url";

import logger from "./logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EMAIL_TEMPLATES_DIR = path.join(__dirname, "../templates/emails");
const EMAIL_LAYOUT_PATH = path.join(EMAIL_TEMPLATES_DIR, "layout/main.hbs");

const templateCache = new Map();

const loadTemplate = async (templatePath) => {
    if (templateCache.has(templatePath)) {
        return templateCache.get(templatePath);
    }

    const content = await fs.readFile(templatePath, "utf-8");
    const template = handlebars.compile(content);

    templateCache.set(templatePath, template);

    return template;
};

const renderEmailTemplate = async (templateName, variables = {}) => {
    const templatePath = path.join(
        EMAIL_TEMPLATES_DIR,
        `${templateName}.hbs`,
    );

    const [layoutTemplate, pageTemplate] = await Promise.all([
        loadTemplate(EMAIL_LAYOUT_PATH),
        loadTemplate(templatePath),
    ]);

    const pageHtml = pageTemplate(variables);

    return layoutTemplate({
        body: pageHtml,
    });
};

export const renderTemplate = async (templateName, variables = {}) => {
    try {
        return await renderEmailTemplate(templateName, variables);
    } catch (error) {
        logger.error(
            { err: error, templateName },
            "Failed to render email template",
        );

        throw error;
    }
};