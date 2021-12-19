import React from 'react';
import reactCSS from 'reactcss';
import { FaExternalLinkSquareAlt } from 'react-icons/fa';

const Portfolio = ({ title, link, desc }) => {
    link = "window.open('" + link + "')";
    return (
        <div className="pfChild">
            <h3 className="pfTitle">{title}</h3>
            <p className="pfContent">{desc}</p>
            <button onclick={link}>
                Open my {title}! <FaExternalLinkSquareAlt />
            </button>
        </div>
    );
};

export default Portfolio;
