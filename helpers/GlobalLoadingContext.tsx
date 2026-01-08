import React, { createContext, useContext, useState, ReactNode } from "react";

type GlobalLoadingContextType = {
    isGlobalLoading: boolean;
    setGlobalLoading: (loading: boolean) => void;
};

const GlobalLoadingContext = createContext<GlobalLoadingContextType>({
    isGlobalLoading: false,
    setGlobalLoading: () => { },
});

export const GlobalLoadingProvider = ({ children }: { children: ReactNode }) => {
    const [isGlobalLoading, setGlobalLoading] = useState(false);

    return (
        <GlobalLoadingContext.Provider value={{ isGlobalLoading, setGlobalLoading }}>
            {children}
        </GlobalLoadingContext.Provider>
    );
};

export const useGlobalLoading = () => useContext(GlobalLoadingContext);
