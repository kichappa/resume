import React from 'react';
import reactCSS from 'reactcss';
import { FaExternalLinkSquareAlt, FaExternalLinkAlt } from 'react-icons/fa';

const Portfolio = ({ title, link, desc }) => {
    // link = "window.open('" + link + "')";
    // console.log(link);
    return (
        <div className="pfChild">
            <h3 className="pfTitle">{title}</h3>
            <p className="pfContent">{desc}</p>
            {/* prettier-ignore */}
            <button onClick={() => window.open(link, '_blank')}>
                Open my {title} &nbsp; <FaExternalLinkAlt />
            </button>
        </div>
    );
};

export default Portfolio;
