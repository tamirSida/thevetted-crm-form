'use client';

import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faEnvelope,
  faBuilding,
  faBriefcase,
  faMapMarkerAlt,
  faLightbulb,
  faSpinner,
  faCheck,
  faTimes,
  faSearch,
  faTag,
} from '@fortawesome/free-solid-svg-icons';
import { faLinkedin as faLinkedinBrand } from '@fortawesome/free-brands-svg-icons';

interface DropdownOption {
  id: number;
  name: string;
}

interface ResendSegment {
  id: string;
  name: string;
}

interface FormData {
  fullName: string;
  email: string;
  employer: string;
  role: string;
  linkedin: string;
  location: string;
  areaOfExpertise: number[];
  labels: number[];
  resendSegments: string[];
  notes: string;
}

const initialFormData: FormData = {
  fullName: '',
  email: '',
  employer: '',
  role: '',
  linkedin: '',
  location: '',
  areaOfExpertise: [],
  labels: [],
  resendSegments: [],
  notes: '',
};

interface SearchableMultiSelectProps {
  options: DropdownOption[];
  selected: number[];
  onChange: (selected: number[]) => void;
  placeholder: string;
  loading?: boolean;
}

function SearchableMultiSelect({
  options,
  selected,
  onChange,
  placeholder,
  loading,
}: SearchableMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOptions = options.filter((opt) => selected.includes(opt.id));

  const toggleOption = (optionId: number) => {
    if (selected.includes(optionId)) {
      onChange(selected.filter((id) => id !== optionId));
    } else {
      onChange([...selected, optionId]);
    }
  };

  const removeOption = (optionId: number) => {
    onChange(selected.filter((id) => id !== optionId));
  };

  return (
    <div className="relative" ref={containerRef}>
      <div
        onClick={() => setIsOpen(true)}
        className="w-full min-h-[48px] px-4 py-2 border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white"
      >
        {loading ? (
          <span className="text-gray-400 flex items-center gap-2">
            <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
            Loading options...
          </span>
        ) : selectedOptions.length === 0 ? (
          <span className="text-gray-400">{placeholder}</span>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selectedOptions.map((option) => (
              <span
                key={option.id}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded"
              >
                {option.name}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeOption(option.id);
                  }}
                  className="hover:text-blue-900"
                >
                  <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
      {isOpen && !loading && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <FontAwesomeIcon icon={faSearch} className="w-4 h-4" />
              </span>
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900"
                placeholder="Search..."
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-gray-500 text-sm">No options found</div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.id}
                  onClick={() => toggleOption(option.id)}
                  className={`px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-center justify-between ${
                    selected.includes(option.id) ? 'bg-blue-50' : ''
                  }`}
                >
                  <span className="text-gray-900">{option.name}</span>
                  {selected.includes(option.id) && (
                    <FontAwesomeIcon icon={faCheck} className="w-4 h-4 text-blue-600" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface ResendSegmentSelectProps {
  options: ResendSegment[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder: string;
  loading?: boolean;
}

function ResendSegmentSelect({
  options,
  selected,
  onChange,
  placeholder,
  loading,
}: ResendSegmentSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggleOption = (optionId: string) => {
    if (selected.includes(optionId)) {
      onChange(selected.filter((id) => id !== optionId));
    } else {
      onChange([...selected, optionId]);
    }
  };

  const removeOption = (optionId: string) => {
    onChange(selected.filter((id) => id !== optionId));
  };

  const selectedOptions = options.filter((opt) => selected.includes(opt.id));

  return (
    <div className="relative" ref={containerRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full min-h-[48px] px-4 py-2 border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white"
      >
        {loading ? (
          <span className="text-gray-400 flex items-center gap-2">
            <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
            Loading segments...
          </span>
        ) : selectedOptions.length === 0 ? (
          <span className="text-gray-400">{placeholder}</span>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selectedOptions.map((option) => (
              <span
                key={option.id}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded"
              >
                {option.name}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeOption(option.id);
                  }}
                  className="hover:text-blue-900"
                >
                  <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
      {isOpen && !loading && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {options.length === 0 ? (
            <div className="px-4 py-3 text-gray-500 text-sm">No segments available</div>
          ) : (
            options.map((option) => (
              <div
                key={option.id}
                onClick={() => toggleOption(option.id)}
                className={`px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-center justify-between ${
                  selected.includes(option.id) ? 'bg-blue-50' : ''
                }`}
              >
                <span className="text-gray-900">{option.name}</span>
                {selected.includes(option.id) && (
                  <FontAwesomeIcon icon={faCheck} className="w-4 h-4 text-blue-600" />
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function MainForm() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [resendLoading, setResendLoading] = useState(true);
  const [areaOfExpertiseOptions, setAreaOfExpertiseOptions] = useState<DropdownOption[]>([]);
  const [labelOptions, setLabelOptions] = useState<DropdownOption[]>([]);
  const [resendSegmentOptions, setResendSegmentOptions] = useState<ResendSegment[]>([]);

  useEffect(() => {
    const fetchMondayOptions = async () => {
      try {
        const response = await fetch('/api/monday');
        if (!response.ok) {
          throw new Error('Failed to fetch options');
        }
        const data = await response.json();
        setAreaOfExpertiseOptions(data.areaOfExpertise || []);
        setLabelOptions(data.labels || []);
      } catch (err) {
        console.error('Error fetching Monday.com options:', err);
        setError('Failed to load form options. Please refresh the page.');
      } finally {
        setOptionsLoading(false);
      }
    };

    const fetchResendSegments = async () => {
      try {
        const response = await fetch('/api/resend');
        if (!response.ok) {
          throw new Error('Failed to fetch Resend segments');
        }
        const data = await response.json();
        setResendSegmentOptions(data.segments || []);
      } catch (err) {
        console.error('Error fetching Resend segments:', err);
      } finally {
        setResendLoading(false);
      }
    };

    fetchMondayOptions();
    fetchResendSegments();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    if (formData.areaOfExpertise.length === 0) {
      setError('Please select at least one area of expertise');
      setLoading(false);
      return;
    }

    if (formData.labels.length === 0) {
      setError('Please select at least one label');
      setLoading(false);
      return;
    }

    if (formData.resendSegments.length === 0) {
      setError('Please select at least one Resend segment');
      setLoading(false);
      return;
    }

    try {
      // Submit to Monday.com
      const mondayResponse = await fetch('/api/monday', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          employer: formData.employer,
          role: formData.role,
          linkedin: formData.linkedin,
          location: formData.location,
          areaOfExpertise: formData.areaOfExpertise,
          labels: formData.labels,
          notes: formData.notes,
        }),
      });

      if (!mondayResponse.ok) {
        const errorData = await mondayResponse.json();
        throw new Error(errorData.error || 'Failed to submit to Monday.com');
      }

      // Submit to Resend - create contact and add to segments
      const nameParts = formData.fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const resendResponse = await fetch('/api/resend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          firstName,
          lastName,
          segmentIds: formData.resendSegments,
        }),
      });

      if (!resendResponse.ok) {
        const errorData = await resendResponse.json();
        throw new Error(errorData.error || 'Failed to add contact to Resend');
      }

      setSuccess(true);
      setFormData(initialFormData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit form. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 text-sm text-green-600 bg-green-50 rounded-lg flex items-center gap-2">
          <FontAwesomeIcon icon={faCheck} className="w-4 h-4" />
          Contact added successfully!
        </div>
      )}

      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
          Full Name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <FontAwesomeIcon icon={faUser} className="w-4 h-4" />
          </span>
          <input
            id="fullName"
            name="fullName"
            type="text"
            value={formData.fullName}
            onChange={handleChange}
            required
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900"
            placeholder="John Doe"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4" />
          </span>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900"
            placeholder="john@example.com"
          />
        </div>
      </div>

      <div>
        <label htmlFor="employer" className="block text-sm font-medium text-gray-700 mb-1">
          Employer/Organization
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <FontAwesomeIcon icon={faBuilding} className="w-4 h-4" />
          </span>
          <input
            id="employer"
            name="employer"
            type="text"
            value={formData.employer}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900"
            placeholder="Acme Inc."
          />
        </div>
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
          Role
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <FontAwesomeIcon icon={faBriefcase} className="w-4 h-4" />
          </span>
          <input
            id="role"
            name="role"
            type="text"
            value={formData.role}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900"
            placeholder="CEO, CTO, Founder..."
          />
        </div>
      </div>

      <div>
        <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-1">
          LinkedIn
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <FontAwesomeIcon icon={faLinkedinBrand} className="w-4 h-4" />
          </span>
          <input
            id="linkedin"
            name="linkedin"
            type="url"
            value={formData.linkedin}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900"
            placeholder="https://linkedin.com/in/johndoe"
          />
        </div>
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
          Location (City, State)
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 h-4" />
          </span>
          <input
            id="location"
            name="location"
            type="text"
            value={formData.location}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900"
            placeholder="San Francisco, CA"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <FontAwesomeIcon icon={faLightbulb} className="w-4 h-4 mr-1 text-gray-400" />
          Area of Expertise <span className="text-red-500">*</span>
        </label>
        <SearchableMultiSelect
          options={areaOfExpertiseOptions}
          selected={formData.areaOfExpertise}
          onChange={(value) => setFormData((prev) => ({ ...prev, areaOfExpertise: value }))}
          placeholder="Search and select from Monday.com..."
          loading={optionsLoading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <FontAwesomeIcon icon={faTag} className="w-4 h-4 mr-1 text-gray-400" />
          Label (How they can help) <span className="text-red-500">*</span>
        </label>
        <SearchableMultiSelect
          options={labelOptions}
          selected={formData.labels}
          onChange={(value) => setFormData((prev) => ({ ...prev, labels: value }))}
          placeholder="Search and select from Monday.com..."
          loading={optionsLoading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Resend Segment <span className="text-red-500">*</span>
        </label>
        <ResendSegmentSelect
          options={resendSegmentOptions}
          selected={formData.resendSegments}
          onChange={(value) => setFormData((prev) => ({ ...prev, resendSegments: value }))}
          placeholder="Select segments..."
          loading={resendLoading}
        />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900 resize-none"
          placeholder="Additional notes..."
        />
      </div>

      <button
        type="submit"
        disabled={loading || optionsLoading || resendLoading}
        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
            Submitting...
          </>
        ) : (
          'Add Contact'
        )}
      </button>
    </form>
  );
}
