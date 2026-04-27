import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";
import AdminBottomNav from "./AdminBottomNav";

const Layout = ({ isAdmin }) => {

    console.log("Layout renderas. Är användaren admin?", isAdmin);
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <main className="flex-1 pb-20">
                <Outlet />
            </main>

            <div className="fixed bottom-0 w-full">
                {isAdmin ? (
                    <AdminBottomNav isAdmin={isAdmin} /> 
                ) : (
                     <BottomNav isAdmin={isAdmin} />
                )}
            </div>
        </div>
    )
}

export default Layout;