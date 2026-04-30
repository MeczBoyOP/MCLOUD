import React from "react";
import PublicHeader from "../common/PublicHeader";
import PublicFooter from "../common/PublicFooter";
import { Outlet } from "react-router-dom";

const PublicLayout = () => {
    return (
        <div className="min-h-screen flex flex-col text-white bg-[#020617]">

            {/* Header */}
            <PublicHeader />

            {/* Main */}
            <main className="flex-1 w-full">
                <Outlet />
            </main>

            {/* Footer */}
            <PublicFooter />

        </div>
    );
};

export default PublicLayout;