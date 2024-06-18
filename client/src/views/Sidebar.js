import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';
import { SlArrowRightCircle, SlArrowLeftCircle } from 'react-icons/sl'; 

function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div>
            <div className={`sidebar ${isOpen ? 'open' : ''}`}>
                <button className="toggle-button" onClick={toggleSidebar}>
                    {isOpen ? <SlArrowLeftCircle size={20} /> : <SlArrowRightCircle size={20} />}
                </button>
                <ul>
                    <li>
                        <Link to="/dashboard">Dashboard</Link>
                    </li>
                    <li>
                        <Link to="/income">Income</Link>
                    </li>
                </ul>
            </div>
        </div>
    );
}

export default Sidebar;
