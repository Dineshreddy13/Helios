import React from "react";
import { Text, Heading, Section } from "@react-email/components";
import { EmailLayout } from "./layout/EmailLayout.jsx";

export const OtpEmail = ({ name, otp, requestId, expiry }) => {
    return (
        <EmailLayout>
            <Heading className="text-2xl font-bold text-indigo-600 mb-4">
                Verify your email
            </Heading>
            
            <Text className="text-base mb-4">
                Hi {name},
            </Text>
            
            <Text className="text-base mb-4">
                Your OTP verification code is:
            </Text>
            
            <Section className="bg-gray-50 rounded p-6 text-center my-6">
                <Text className="text-4xl font-bold tracking-widest text-indigo-600 m-0">
                    {otp}
                </Text>
            </Section>
            
            <Text className="text-sm text-gray-500 mb-6">
                Request ID: <strong>{requestId}</strong>
            </Text>
            
            <Text className="text-base mb-6">
                This code expires in <strong>{expiry}</strong>.
            </Text>
            
            <Text className="text-xs text-gray-400 mt-10">
                If you didn't request this, ignore this email.
            </Text>
        </EmailLayout>
    );
};
