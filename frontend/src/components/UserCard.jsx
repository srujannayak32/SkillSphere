import React from 'react';
import { Link } from 'react-router-dom';

const UserCard = ({ user, connectionStatus, onConnect, onRespond }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4">
        <div className="flex items-center space-x-4">
          <img 
            src={user.photo || '/default-profile.jpg'} 
            alt={user.fullName}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold">{user.fullName}</h3>
            <p className="text-sm text-gray-600 capitalize">{user.role}</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {user.skills?.slice(0, 3).map((skill, index) => (
                <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        {user.bio && (
          <p className="mt-3 text-sm text-gray-600 line-clamp-2">{user.bio}</p>
        )}
        
        <div className="mt-4 flex justify-between">
          <Link 
            to={`/profile/${user._id}`} 
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View Profile
          </Link>
          
          {connectionStatus === 'none' && (
            <button
              onClick={() => onConnect(user._id)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded text-sm"
            >
              Connect
            </button>
          )}
          
          {connectionStatus === 'pending' && (
            <span className="text-gray-500 text-sm">Request Sent</span>
          )}
          
          {connectionStatus === 'accepted' && (
            <Link
              to={`/chat/${user._id}`}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded text-sm"
            >
              Message
            </Link>
          )}
          
          {connectionStatus === 'respond' && (
            <div className="space-x-2">
              <button
                onClick={() => onRespond(user._id, 'accept')}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
              >
                Accept
              </button>
              <button
                onClick={() => onRespond(user._id, 'reject')}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded text-sm"
              >
                Decline
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserCard;