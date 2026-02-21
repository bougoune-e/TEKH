import React from 'react';
import './MotionRings.css';

interface MotionRingsProps {
    className?: string;
    children?: React.ReactNode;
}

const MotionRings: React.FC<MotionRingsProps> = ({ className, children }) => {
    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            <div className="ring-container">
                <i style={{ "--clr": "#00ff41" } as React.CSSProperties}></i>
                <i style={{ "--clr": "#ff002b" } as React.CSSProperties}></i>
                <i style={{ "--clr": "#ffd700" } as React.CSSProperties}></i>
                <div className="login-content">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default MotionRings;
