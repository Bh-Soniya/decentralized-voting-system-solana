import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import API_BASE_URL from '../config/api';
import { datetimeLocalToISO } from '../utils/dateUtils';

interface PollOption {
  text: string;
  description: string;
  imageUrl: string;
}

const CreatePoll: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [options, setOptions] = useState<PollOption[]>([
    { text: '', description: '', imageUrl: '' },
    { text: '', description: '', imageUrl: '' },
  ]);
  const navigate = useNavigate();

  const handleAddOption = () => {
    setOptions([...options, { text: '', description: '', imageUrl: '' }]);
  };

  const handleOptionChange = (index: number, field: keyof PollOption, value: string) => {
    const newOptions = [...options];
    newOptions[index][field] = value;
    setOptions(newOptions);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      handleOptionChange(index, 'imageUrl', base64String);
      toast.success('Image uploaded successfully');
    };
    reader.onerror = () => {
      toast.error('Failed to upload image');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const filteredOptions = options.filter((opt) => opt.text.trim() !== '');
      if (filteredOptions.length < 2) {
        toast.error('Please provide at least 2 options');
        return;
      }

      // Validate dates
      const startDateTime = new Date(startTime);
      const endDateTime = new Date(endTime);

      if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
        toast.error('Invalid date/time selected');
        return;
      }

      if (endDateTime <= startDateTime) {
        toast.error('End time must be after start time');
        return;
      }

      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        navigate('/login');
        return;
      }

      // Convert to ISO strings for backend
      const response = await axios.post(
        `${API_BASE_URL}/polls`,
        {
          title,
          description,
          startTime: datetimeLocalToISO(startTime),
          endTime: datetimeLocalToISO(endTime),
          options: filteredOptions,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success('Poll created successfully!');
      navigate(`/poll/${response.data.poll.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create poll');
    }
  };

  return (
    <div className="create-poll">
      <h2>Create New Poll</h2>
      <form onSubmit={handleSubmit} className="poll-form">
        <div className="form-group">
          <label>Poll Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Start Time</label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>End Time</label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Options / Candidates</label>
          {options.map((option, index) => (
            <div key={index} className="option-card">
              <div className="option-header">
                <h4>Option {index + 1}</h4>
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(index)}
                    className="btn-remove"
                  >
                    ✕
                  </button>
                )}
              </div>
              
              <div className="option-fields">
                <div className="form-group">
                  <label>Name / Title</label>
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                    placeholder="e.g., Candidate Name or Option"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description (Optional)</label>
                  <textarea
                    value={option.description}
                    onChange={(e) => handleOptionChange(index, 'description', e.target.value)}
                    placeholder="Add details about this option/candidate"
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label>Image (Optional)</label>
                  <div className="image-upload-options">
                    <div className="upload-method">
                      <label className="file-upload-label">
                        📁 Upload from Device
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(index, e)}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>
                    <div className="upload-method-divider">OR</div>
                    <div className="upload-method">
                      <input
                        type="url"
                        value={option.imageUrl}
                        onChange={(e) => handleOptionChange(index, 'imageUrl', e.target.value)}
                        placeholder="Enter image URL"
                      />
                    </div>
                  </div>
                  {option.imageUrl && (
                    <div className="image-preview">
                      <img src={option.imageUrl} alt="Preview" onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }} />
                      <button
                        type="button"
                        className="btn-remove-image"
                        onClick={() => handleOptionChange(index, 'imageUrl', '')}
                      >
                        ✕ Remove Image
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          <button type="button" onClick={handleAddOption} className="btn-secondary">
            + Add Option
          </button>
        </div>

        <div className="form-actions-center">
          <button type="submit" className="btn-primary">
            Create Poll
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePoll;
