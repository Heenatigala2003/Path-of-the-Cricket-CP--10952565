// app/admin/footer/page.tsx
"use client";

import React, { useState } from 'react';
import { FiSave, FiLink, FiMail, FiPhone, FiMapPin, FiGlobe } from 'react-icons/fi';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

export default function FooterPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [footerData, setFooterData] = useState({
    copyright: '© 2024 Sports Platform. All rights reserved.',
    description: 'Your premier destination for sports talent discovery and development.',
    email: 'contact@sportsplatform.com',
    phone: '+1 (555) 123-4567',
    address: '123 Sports Street, City, Country',
    links: [
      { name: 'Home', url: '/' },
      { name: 'About Us', url: '/about' },
      { name: 'Contact', url: '/contact' },
      { name: 'Privacy Policy', url: '/privacy' },
      { name: 'Terms of Service', url: '/terms' },
    ]
  });

  const [socialLinks, setSocialLinks] = useState([
    { platform: 'Facebook', url: 'https://facebook.com', icon: <FaFacebook /> },
    { platform: 'Twitter', url: 'https://twitter.com', icon: <FaTwitter /> },
    { platform: 'Instagram', url: 'https://instagram.com', icon: <FaInstagram /> },
    { platform: 'LinkedIn', url: 'https://linkedin.com', icon: <FaLinkedin /> },
  ]);

  const handleSave = () => {
    setIsEditing(false);
    console.log('Saving footer data:', footerData);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-yellow-400">Footer Settings</h1>
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className="flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg"
        >
          <FiSave className="mr-2" />
          {isEditing ? 'Save Changes' : 'Edit Footer'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Contact Information */}
        <div className="bg-gray-800 border border-yellow-600/20 rounded-xl p-6">
          <h3 className="text-xl font-bold text-yellow-400 mb-6">Contact Information</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 mb-2">Email Address</label>
              {isEditing ? (
                <input
                  type="email"
                  className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
                  value={footerData.email}
                  onChange={(e) => setFooterData({...footerData, email: e.target.value})}
                />
              ) : (
                <div className="flex items-center">
                  <FiMail className="mr-2 text-yellow-400" />
                  {footerData.email}
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-gray-400 mb-2">Phone Number</label>
              {isEditing ? (
                <input
                  type="tel"
                  className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
                  value={footerData.phone}
                  onChange={(e) => setFooterData({...footerData, phone: e.target.value})}
                />
              ) : (
                <div className="flex items-center">
                  <FiPhone className="mr-2 text-yellow-400" />
                  {footerData.phone}
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-gray-400 mb-2">Address</label>
              {isEditing ? (
                <textarea
                  className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
                  value={footerData.address}
                  onChange={(e) => setFooterData({...footerData, address: e.target.value})}
                  rows={3}
                />
              ) : (
                <div className="flex items-start">
                  <FiMapPin className="mr-2 text-yellow-400 mt-1" />
                  {footerData.address}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Copyright & Description */}
        <div className="bg-gray-800 border border-yellow-600/20 rounded-xl p-6">
          <h3 className="text-xl font-bold text-yellow-400 mb-6">Brand Information</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 mb-2">Copyright Text</label>
              {isEditing ? (
                <input
                  type="text"
                  className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
                  value={footerData.copyright}
                  onChange={(e) => setFooterData({...footerData, copyright: e.target.value})}
                />
              ) : (
                <div className="flex items-center">
                  <FiGlobe className="mr-2 text-yellow-400" />
                  {footerData.copyright}
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-gray-400 mb-2">Description</label>
              {isEditing ? (
                <textarea
                  className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
                  value={footerData.description}
                  onChange={(e) => setFooterData({...footerData, description: e.target.value})}
                  rows={4}
                />
              ) : (
                <p className="text-gray-300">{footerData.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-gray-800 border border-yellow-600/20 rounded-xl p-6 mb-6">
        <h3 className="text-xl font-bold text-yellow-400 mb-6">Quick Links</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {footerData.links.map((link, index) => (
            <div key={index} className="bg-gray-750 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <FiLink className="mr-2 text-yellow-400" />
                <span className="font-medium">Link {index + 1}</span>
              </div>
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm"
                    value={link.name}
                    onChange={(e) => {
                      const newLinks = [...footerData.links];
                      newLinks[index].name = e.target.value;
                      setFooterData({...footerData, links: newLinks});
                    }}
                    placeholder="Link Text"
                  />
                  <input
                    type="text"
                    className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm"
                    value={link.url}
                    onChange={(e) => {
                      const newLinks = [...footerData.links];
                      newLinks[index].url = e.target.value;
                      setFooterData({...footerData, links: newLinks});
                    }}
                    placeholder="URL"
                  />
                </div>
              ) : (
                <div>
                  <div className="text-sm font-medium">{link.name}</div>
                  <div className="text-xs text-gray-400 truncate">{link.url}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-gray-800 border border-yellow-600/20 rounded-xl p-6">
        <h3 className="text-xl font-bold text-yellow-400 mb-6">Social Media Links</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {socialLinks.map((social, index) => (
            <div key={index} className="bg-gray-750 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="text-xl mr-3">{social.icon}</div>
                <span className="font-medium">{social.platform}</span>
              </div>
              {isEditing ? (
                <input
                  type="text"
                  className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm"
                  value={social.url}
                  onChange={(e) => {
                    const newLinks = [...socialLinks];
                    newLinks[index].url = e.target.value;
                    setSocialLinks(newLinks);
                  }}
                  placeholder="Profile URL"
                />
              ) : (
                <div className="text-sm text-gray-400 truncate">{social.url}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}