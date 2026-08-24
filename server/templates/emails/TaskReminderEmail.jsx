import React from "react";
import { Text, Heading, Section } from "@react-email/components";
import { EmailLayout } from "./layout/EmailLayout.jsx";

export const TaskReminderEmail = ({ name, taskTitle, reminderAt }) => {
    return (
        <EmailLayout>
            <Heading className="text-2xl font-bold text-indigo-600 mb-4">
                Task Reminder
            </Heading>
            
            <Text className="text-base mb-4">
                Hi {name},
            </Text>
            
            <Text className="text-base mb-4">
                This is a friendly reminder for your upcoming task:
            </Text>
            
            <Section className="bg-gray-50 rounded p-6 text-center my-6">
                <Text className="text-xl font-bold text-gray-800 m-0 mb-2">
                    {taskTitle}
                </Text>
                <Text className="text-md text-gray-600 m-0">
                    Scheduled for: <strong>{new Date(reminderAt).toLocaleString()}</strong>
                </Text>
            </Section>
            
            <Text className="text-base mb-6">
                Please check your dashboard to review the task details.
            </Text>
            
            <Text className="text-xs text-gray-400 mt-10">
                You are receiving this email because a reminder was set for this task.
            </Text>
        </EmailLayout>
    );
};
