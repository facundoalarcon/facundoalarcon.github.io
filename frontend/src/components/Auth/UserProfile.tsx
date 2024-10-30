// src/components/Auth/UserProfile.tsx

import React from 'react';
import { useAuth } from './AuthProvider';

const UserProfile: React.FC = () => {
    const { user } = useAuth();

    if (!user) {
        return null; // No user logged in
    }

    return (
        <div>
            <img src={user.picture} alt="User" />
            <h3>{user.name}</h3>
            <p>{user.email}</p>
        </div>
    );
};

export default UserProfile;
