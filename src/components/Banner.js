import axios from 'axios';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faChevronDown, faG, faGear } from '@fortawesome/free-solid-svg-icons';

const Banner = ({isSidebarOpen}) => {
    return (
        <div className={`TopBanner`}>
            <div className={`BottomOverflow ${isSidebarOpen ? '' : 'hidden'}`}>
            <div className="SideCircle"></div>
            <div className="SideRect"></div>
            <div className="SideCircleTop"></div>
            <div className="LogoContainer">
            </div>
            </div>
        </div>
    )
}

export default Banner;