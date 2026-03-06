
import React, { createContext, useState } from 'react';

export const IssuesContext = createContext();

export const IssuesProvider = ({ children }) => {

    const [issues, setIssues] = useState([
        { id: 1, title: "Vasken rinner över", category: "Vatten", date: "Feb 5, 2026", priority: "High", status: "Open" }
    ]);

    const addIssue = (newIssue) => {
        setIssues([newIssue, ...issues]);
    };

    return (
        <IssuesContext.Provider value={{ issues, addIssue}}>
            {children}
        </IssuesContext.Provider>
    );
};