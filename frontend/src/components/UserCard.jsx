import React, { useState } from 'react';

const UserCard = ({ user, onConnect, isPending, connectionStatus, hideConnectButton }) => {
  const [requestSent, setRequestSent] = useState(isPending);

  if (!user) {
    return <div className="text-gray-500">User data is not available</div>;
  }

  const { avatar, fullName, username, role, bio, skills } = user;

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center space-x-4">
        <img
          src={avatar || '/default-avatar.png'}
          alt={fullName || 'User Avatar'}
          className="w-16 h-16 rounded-full object-cover"
        />
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

      {!hideConnectButton && (
        <div className="mt-4 flex justify-between">
          {requestSent ? (
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
          )}
        </div>
      )}

      {connectionStatus && (
        <p className="mt-2 text-sm text-green-500">Status: {connectionStatus}</p>
      )}
    </div>
  );
};

export default UserCard;