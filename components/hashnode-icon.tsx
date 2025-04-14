import React from 'react';

interface HashNodeIconProps {
    size?: number;
    className?: string;
}

export const HashNodeIcon: React.FC<HashNodeIconProps> = ({ size = 24, className }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 337 337"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M23.155 112.598c-30.873 30.874-30.873 80.93 0 111.804l89.443 89.443c30.874 30.873 80.93 30.873 111.804 0l89.443-89.443c30.873-30.874 30.873-80.93 0-111.804l-89.443-89.443c-30.874-30.873-80.93-30.873-111.804 0l-89.443 89.443zm184.476 95.033c21.612-21.611 21.612-56.652 0-78.264-21.611-21.611-56.652-21.611-78.264 0-21.611 21.612-21.611 56.653 0 78.264 21.612 21.612 56.653 21.612 78.264 0z"
                fill="currentColor"
            />
        </svg>
    );
};