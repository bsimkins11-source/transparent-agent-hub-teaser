import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  XCircleIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { AgentRequest } from '../types/requests';
import toast from 'react-hot-toast';

interface DeniedRequestCardProps {
  request: AgentRequest;
  onContactAdmin: (requestId: string, message: string) => void;
  onResubmitRequest: (requestId: string) => void;
}

export default function DeniedRequestCard({ 
  request, 
  onContactAdmin, 
  onResubmitRequest 
}: DeniedRequestCardProps) {
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContactAdmin = async () => {
    if (!contactMessage.trim()) {
      toast.error('Please enter a message to send to the admin');
      return;
    }

    setIsSubmitting(true);
    try {
      await onContactAdmin(request.id, contactMessage);
      toast.success('Message sent to admin successfully');
      setContactMessage('');
      setShowContactForm(false);
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResubmitRequest = () => {
    onResubmitRequest(request.id);
    toast.success('Request resubmitted for review');
  };

  const daysSinceDenied = Math.floor(
    (new Date().getTime() - new Date(request.reviewedAt || request.requestedAt).getTime()) / 
    (1000 * 60 * 60 * 24)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-2 border-red-200 bg-red-50 rounded-lg p-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <XCircleIcon className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-red-900">{request.agentName}</h3>
            <p className="text-sm text-red-700">Request Denied</p>
          </div>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-200 text-red-800">
            Denied
          </span>
          <p className="text-xs text-red-600 mt-1">
            {daysSinceDenied === 0 ? 'Today' : `${daysSinceDenied} day${daysSinceDenied !== 1 ? 's' : ''} ago`}
          </p>
        </div>
      </div>

      {/* Denial Information */}
      <div className="mb-4 space-y-3">
        {request.denyReason && (
          <div className="bg-white border border-red-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <ExclamationTriangleIcon className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">Reason for Denial:</p>
                <p className="text-sm text-red-700 mt-1">{request.denyReason}</p>
              </div>
            </div>
          </div>
        )}

        {request.adminContact && (
          <div className="bg-white border border-red-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <UserIcon className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">Reviewed by:</p>
                <p className="text-sm text-red-700">
                  {request.adminContact.name} ({request.adminContact.role.replace('_', ' ')})
                </p>
                <p className="text-sm text-red-600">{request.adminContact.email}</p>
              </div>
            </div>
          </div>
        )}

        {request.reviewedAt && (
          <div className="flex items-center space-x-2 text-sm text-red-600">
            <CalendarIcon className="w-4 h-4" />
            <span>Reviewed on {new Date(request.reviewedAt).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {/* Original Request Context */}
      {request.requestReason && (
        <div className="mb-4 p-3 bg-white border border-red-200 rounded-lg">
          <p className="text-sm font-medium text-red-800 mb-1">Your Original Request:</p>
          <p className="text-sm text-red-700">"{request.requestReason}"</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowContactForm(!showContactForm)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ChatBubbleLeftRightIcon className="w-4 h-4" />
            <span>Contact Admin</span>
          </button>
          
          <button
            onClick={handleResubmitRequest}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
          >
            <EnvelopeIcon className="w-4 h-4" />
            <span>Resubmit Request</span>
          </button>
        </div>

        {request.adminContact && (
          <a
            href={`mailto:${request.adminContact.email}?subject=Agent Request Appeal - ${request.agentName}&body=Hi ${request.adminContact.name},%0D%0A%0D%0AI would like to discuss my denied request for the ${request.agentName} agent.%0D%0A%0D%0AOriginal request: ${request.requestReason || 'No reason provided'}%0D%0ADenial reason: ${request.denyReason || 'No reason provided'}%0D%0A%0D%0AThank you.`}
            className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <EnvelopeIcon className="w-4 h-4" />
            <span>Email Directly</span>
          </a>
        )}
      </div>

      {/* Contact Form */}
      {showContactForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 border-t border-red-200 pt-4"
        >
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-red-800 mb-1">
                Message to {request.adminContact?.name || 'Admin'}:
              </label>
              <textarea
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                className="w-full border border-red-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                rows={4}
                placeholder="Explain why you need this agent or provide additional context for reconsideration..."
              />
            </div>
            
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => {
                  setShowContactForm(false);
                  setContactMessage('');
                }}
                className="text-sm text-gray-600 hover:text-gray-800"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleContactAdmin}
                disabled={isSubmitting || !contactMessage.trim()}
                className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
