import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Components/Navbar';
import Footer from './Components/Footer';
import WhatsAppBubbleChat from './Components/WhatsAppBubbleChat';

const Layout: React.FC = () => {
    return (
        <>
            <Navbar />
            <Outlet />
            <WhatsAppBubbleChat />
            <Footer />
        </>
    );
};

export default Layout;
