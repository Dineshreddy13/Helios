import React from "react";
import { Tailwind, Html, Head, Body, Container } from "@react-email/components";

export const EmailLayout = ({ children }) => {
    return (
        <Html lang="en">
            <Head />
            <Tailwind>
                <Body className="bg-white font-sans text-gray-800">
                    <Container className="mx-auto my-10 max-w-lg p-6 border border-gray-200 rounded-lg shadow-sm">
                        {children}
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};
