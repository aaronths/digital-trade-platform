import React from 'react';

interface ButtonProps {
    text: string; // Button text
    onClick: () => void; // Click event handler
    variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning'; // Bootstrap button variants
    size?: 'sm' | 'lg'; // Bootstrap button size
    disabled?: boolean; // Disable the button
}

const Button: React.FC<ButtonProps> = ({text, onClick, variant = 'primary', size = '', disabled = false}) => {
    const className = `btn btn-${variant} ${size ? `btn-${size}` : ''} ${disabled ? 'disabled' : ''}`;
    return (
        <button className={className} onClick={onClick} disabled={disabled}>
          {text}
        </button>
    );    
};

export default Button;