import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spin } from 'antd';

const PublicIndex = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect to public spot the mistake page
        navigate('/spot-mistake');
    }, [navigate]);

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
        >
            <Spin size="large" />
        </div>
    );
};

export default PublicIndex;
