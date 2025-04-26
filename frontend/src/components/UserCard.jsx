import React, { useState } from 'react';

// Import the same SKILL_ICONS array for consistency
const SKILL_ICONS = [
  {
    id: 'programming',
    name: 'Programming',
    color: '#3498db',
    path: 'M14.25 0a3 3 0 012.95 2.45l.38 3.81.42.42a10 10 0 11-2.93 2.93l-.42-.42-3.81-.38A3 3 0 118.25 6l3.82.38.38 3.81a3 3 0 002.45 2.95 7 7 0 10-2.83-2.83l-3.81-.38A3 3 0 016.4 6.45L6 2.62A3 3 0 019 0z'
  },
  {
    id: 'design',
    name: 'Design',
    color: '#e74c3c',
    path: 'M15 4a8 8 0 100 16 8 8 0 000-16zm-7 8a7 7 0 1114 0 7 7 0 01-14 0zm7-5a5 5 0 100 10 5 5 0 000-10zm-4 5a4 4 0 118 0 4 4 0 01-8 0z'
  },
  {
    id: 'business',
    name: 'Business',
    color: '#2ecc71',
    path: 'M3 3v18h18V3H3zm17 17H4V4h16v16zM8 15l2.5-3L13 15l4.5-6L21 15H8zm-1-8.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z'
  },
  {
    id: 'data',
    name: 'Data Science',
    color: '#9b59b6',
    path: 'M12 16a4 4 0 100-8 4 4 0 000 8zm0-7a3 3 0 110 6 3 3 0 010-6zm8.7-4.7l-6-3.6a2 2 0 00-2 0l-6 3.6C5.7 5 5 5.8 5 6.8v6.4c0 1 .7 1.9 1.7 2.5l6 3.6c.6.4 1.4.4 2 0l6-3.6c1-.6 1.7-1.5 1.7-2.5V6.8c0-1-.7-1.9-1.7-2.5z'
  },
  {
    id: 'language',
    name: 'Languages',
    color: '#f39c12',
    path: 'M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0014.07 6H17V4h-7V2H8v2H1v2h12.17c-.43.8-.97 1.58-1.61 2.33a14.1 14.1 0 01-1.4-1.65H6.4a16.78 16.78 0 002.1 2.57L5.16 11.5 6.6 13l3.4-3.4L14 13.93z'
  },
  {
    id: 'finance',
    name: 'Finance',
    color: '#16a085',
    path: 'M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.42 0 2.13.54 2.39 1.4.12.4.45.7.87.7h.3c.66 0 1.13-.65.9-1.27-.42-1.18-1.4-2.16-2.96-2.54V4.5A1 1 0 0012 3.5h-2a1 1 0 00-1 1v.74c-1.79.45-3.25 1.7-3.25 3.65 0 2.35 1.97 3.35 4.8 3.97 2.47.55 3 1.37 3 2.22 0 .63-.4 1.64-2.7 1.64-1.63 0-2.5-.48-2.83-1.4-.15-.42-.5-.72-.92-.72h-.3c-.67 0-1.14.68-.89 1.3.57 1.46 1.9 2.28 3.63 2.6V19a1 1 0 001 1h2a1 1 0 001-1v-.77c1.79-.4 3.25-1.6 3.25-3.6 0-2.32-1.67-3.28-4.4-3.73z'
  },
  {
    id: 'marketing',
    name: 'Marketing',
    color: '#d35400',
    path: 'M11 3h2v18h-2zm-9 6h6v2H2zm0 4h6v2H2zm8 2h12v2H10zm8-8h4v2h-4zm-4 0h2v6h-2zm-4 0h2v6H10z'
  },
  {
    id: 'teaching',
    name: 'Teaching',
    color: '#27ae60',
    path: 'M12 3L1 9l11 6 9-4.91V17h2V9M5 15v-4.79l7 3.83V19l-7-4z'
  },
  {
    id: 'music',
    name: 'Music',
    color: '#8e44ad',
    path: 'M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z'
  },
  {
    id: 'writing',
    name: 'Writing',
    color: '#2980b9',
    path: 'M14 3a3 3 0 00-3 3v12a3 3 0 006 0V6a3 3 0 00-3-3zm0 2a1 1 0 011 1v12a1 1 0 11-2 0V6a1 1 0 011-1zm-8 6a3 3 0 00-3 3v4a3 3 0 006 0v-4a3 3 0 00-3-3zm0 2a1 1 0 011 1v4a1 1 0 11-2 0v-4a1 1 0 011-1z'
  }
];

const UserCard = ({ user, onConnect, isPending, connectionStatus, hideConnectButton, hideMessageButton, onMessageClick }) => {
  const [requestSent, setRequestSent] = useState(isPending);

  if (!user) {
    return <div className="text-gray-500">User data is not available</div>;
  }

  const { avatar, fullName, username, role, bio, skills } = user;

  // Function to render avatar based on whether it's a skill icon or custom image
  const renderAvatar = () => {
    if (avatar) {
      // Check if it's a skill icon
      if (typeof avatar === 'string' && avatar.startsWith('skill-icon:')) {
        const iconId = avatar.replace('skill-icon:', '');
        const icon = SKILL_ICONS.find(icon => icon.id === iconId);
        
        if (icon) {
          return (
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gray-100 border-2 border-gray-200">
              <svg 
                viewBox="0 0 24 24" 
                className="w-10 h-10"
                fill={icon.color}
              >
                <path d={icon.path} />
              </svg>
            </div>
          );
        }
      }
      
      // If it's a URL or path to image
      return (
        <img
          src={avatar || '/default-avatar.png'}
          alt={fullName || 'User Avatar'}
          className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
        />
      );
    }
    
    // Default avatar
    return (
      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 border-2 border-gray-300">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center space-x-4">
        {renderAvatar()}
        <div>
          <h3 className="font-semibold">{fullName || 'Unknown User'}</h3>
          <p className="text-sm text-gray-600">@{username || 'No username'}</p>
          <p className="text-sm text-gray-600">{bio || 'No bio available'}</p>
        </div>
      </div>

      {skills && skills.length > 0 && (
        <div className="mt-3">
          <h4 className="text-sm font-medium text-gray-700">Skills:</h4>
          <div className="flex flex-wrap gap-1 mt-1">
            {skills.slice(0, 3).map((skill, index) => (
              <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex justify-between">
        {!hideConnectButton && (
          requestSent ? (
            <span className="text-gray-500 text-sm">Request Sent</span>
          ) : (
            <button
              onClick={async () => {
                await onConnect(user.userId?._id); // Trigger backend request
                setRequestSent(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded text-sm"
            >
              Connect
            </button>
          )
        )}
        {!hideMessageButton && (
          <button
            onClick={() => onMessageClick && onMessageClick(user.userId || user._id)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded text-sm"
          >
            Message
          </button>
        )}
      </div>

      {connectionStatus && (
        <p className="mt-2 text-sm text-green-500">Status: {connectionStatus}</p>
      )}
    </div>
  );
};

export default UserCard;