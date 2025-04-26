import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

// Import the SKILL_ICONS array to use for avatar selection
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

const ProfileEditor = () => {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [preview, setPreview] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSkillIconPicker, setShowSkillIconPicker] = useState(false);
  const [selectedSkillIcon, setSelectedSkillIcon] = useState(null);
  const { register, handleSubmit, setValue } = useForm();
  const navigate = useNavigate();

  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/profile/${userId}`, {
          withCredentials: true
        });
        setProfile(response.data);
        setSkills(response.data?.skills || []);
        setValue('bio', response.data?.bio || '');
        setValue('role', response.data?.role || 'student');
        if (response.data?.avatar) {
          // Check if it's a skill icon
          if (response.data.avatar.startsWith('skill-icon:')) {
            const iconId = response.data.avatar.replace('skill-icon:', '');
            setSelectedSkillIcon(iconId);
            setPreview(''); // Clear preview to show the icon
          } else {
            setPreview(`${API_BASE_URL.replace('/api', '')}/uploads/${response.data.avatar}`);
          }
        }
      } catch (error) {
        toast.error('Failed to load profile');
        console.error('Error fetching profile:', error);
        navigate('/dashboard');
      }
    };
    fetchProfile();
  }, [userId, setValue, navigate]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    maxFiles: 1,
    onDrop: acceptedFiles => {
      const file = acceptedFiles[0];
      if (file) {
        setPreview(URL.createObjectURL(file));
        setSelectedSkillIcon(null); // Clear any selected skill icon
        handleUpload(file);
      }
    }
  });

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    formData.append('userId', userId);

    try {
      setIsSaving(true);
      const response = await axios.post(
        `${API_BASE_URL}/profile/${userId}/photo`, 
        formData, 
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        }
      );
      setProfile(response.data.profile);
      toast.success('Profile picture updated successfully!');
    } catch (error) {
      toast.error('Failed to upload profile picture');
      console.error('Upload failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const selectSkillIcon = async (iconId) => {
    try {
      setIsSaving(true);
      const response = await axios.put(
        `${API_BASE_URL}/profile/${userId}/icon`,
        { iconId: `skill-icon:${iconId}` },
        { withCredentials: true }
      );
      
      setSelectedSkillIcon(iconId);
      setPreview(''); // Clear any existing preview
      setProfile({...profile, avatar: `skill-icon:${iconId}`});
      setShowSkillIconPicker(false);
      toast.success('Profile icon updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile icon');
      console.error('Icon update failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      const response = await axios.put(
        `${API_BASE_URL}/profile/${userId}`,
        {
          bio: data.bio,
          skills: skills.filter(skill => skill.name.trim() !== ''),
          role: data.role || profile?.role || 'student',
          avatar: selectedSkillIcon ? `skill-icon:${selectedSkillIcon}` : profile?.avatar,
          userId
        },
        {
          withCredentials: true
        }
      );
      toast.success('Profile saved successfully!', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setTimeout(() => {
        navigate('/auth/dashboard');
      }, 1500); // Wait for toast to show before redirecting
    } catch (error) {
      toast.error('Failed to save profile');
      console.error('Update failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const addSkill = () => {
    setSkills([...skills, { name: '', level: 1 }]);
  };

  const removeSkill = (index) => {
    const newSkills = [...skills];
    newSkills.splice(index, 1);
    setSkills(newSkills);
  };

  const handleSkillChange = (index, field, value) => {
    const newSkills = [...skills];
    newSkills[index][field] = value;
    setSkills(newSkills);
  };

  // Render the profile avatar (custom upload or skill icon)
  const renderAvatar = () => {
    if (selectedSkillIcon) {
      const icon = SKILL_ICONS.find(icon => icon.id === selectedSkillIcon);
      if (icon) {
        return (
          <div className="w-32 h-32 mx-auto rounded-full flex items-center justify-center bg-gray-100 border-2 border-gray-200">
            <svg 
              viewBox="0 0 24 24" 
              className="w-20 h-20"
              fill={icon.color}
            >
              <path d={icon.path} />
            </svg>
          </div>
        );
      }
    }
    
    if (preview) {
      return (
        <img 
          src={preview} 
          alt="Profile Preview" 
          className="w-32 h-32 mx-auto rounded-full object-cover border-2 border-gray-200"
        />
      );
    }
    
    return (
      <div className="w-32 h-32 mx-auto rounded-full bg-gray-200 flex items-center justify-center text-gray-500 border-2 border-gray-300">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      </div>
    );
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading profile...</div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Your Profile</h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="text-center">
              {renderAvatar()}
              
              <div className="mt-4 flex justify-center gap-2">
                <div {...getRootProps()} className="cursor-pointer">
                  <input {...getInputProps()} />
                  <button
                    type="button"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                  >
                    Upload Photo
                  </button>
                </div>
                
                <button
                  type="button"
                  onClick={() => setShowSkillIconPicker(!showSkillIconPicker)}
                  className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition"
                >
                  Use Skill Icon
                </button>
              </div>
              
              {showSkillIconPicker && (
                <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h3 className="text-lg font-medium mb-3">Select a Skill Icon</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {SKILL_ICONS.map(icon => (
                      <div 
                        key={icon.id}
                        onClick={() => selectSkillIcon(icon.id)}
                        className={`p-2 border rounded-lg cursor-pointer hover:bg-gray-100 transition ${
                          selectedSkillIcon === icon.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex flex-col items-center">
                          <svg 
                            viewBox="0 0 24 24" 
                            className="w-10 h-10"
                            fill={icon.color}
                          >
                            <path d={icon.path} />
                          </svg>
                          <span className="text-xs mt-1">{icon.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-gray-700 mb-2">About You</label>
              <textarea
                {...register('bio')}
                placeholder="Tell us about yourself..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px]"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Role</label>
              <select
                {...register('role')}
                defaultValue={profile?.role || 'student'}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="student">Student</option>
                <option value="mentor">Mentor</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Your Skills</label>
              <div className="space-y-3">
                {skills.map((skill, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <input
                      value={skill.name}
                      onChange={(e) => handleSkillChange(index, 'name', e.target.value)}
                      placeholder="Skill name"
                      className="flex-1 p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    />
                    <select
                      value={skill.level}
                      onChange={(e) => handleSkillChange(index, 'level', parseInt(e.target.value))}
                      className="p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    >
                      {[1, 2, 3, 4, 5].map(level => (
                        <option key={level} value={level}>Level {level}</option>
                      ))}
                    </select>
                    <button 
                      type="button" 
                      onClick={() => removeSkill(index)}
                      className="text-red-500 hover:text-red-700 p-2"
                      aria-label="Remove skill"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button 
                  type="button" 
                  onClick={addSkill}
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition flex items-center gap-2 w-fit"
                >
                  <span>+</span>
                  <span>Add Skill</span>
                </button>
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={isSaving}
                className="w-full py-3 px-4 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition disabled:bg-gray-400 flex justify-center items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <span className="animate-spin">↻</span>
                    <span>Saving...</span>
                  </>
                ) : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileEditor;