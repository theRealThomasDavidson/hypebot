import React, { useState } from 'react';
import API from '../components/lib/backend'; // Adjust path as needed

function CreateProfilePage() {
  const [profile, setProfile] = useState({
    name: '',
    blurb: '',
    bio: '',
    skills: []
    // Add other fields as needed
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Convert skills from comma-separated string to array if needed
    if (name === 'skills') {
      setProfile((prev) => ({ ...prev, [name]: value.split(',') }));
    } else {
      setProfile((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Use the profiles.create endpoint
      const endpoint = API.endpoints.profiles.create();

      // Make the request to create a new profile
      // Body must be stringified JSON for a POST
      const response = await API.request(endpoint, {
        body: JSON.stringify(profile)
      });

      // If successful, show message or redirect
      setMessage('Profile created successfully!');
      console.log('Profile created:', response);
    } catch (error) {
      setMessage(`