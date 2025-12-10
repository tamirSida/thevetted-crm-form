'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Tabs from '@/components/Tabs';
import Header from '@/components/Header';
import MainForm from '@/components/MainForm';
import AddUsers from '@/components/AddUsers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faUserPlus } from '@fortawesome/free-solid-svg-icons';

const tabs = [
  {
    id: 'form',
    label: 'Form',
    icon: <FontAwesomeIcon icon={faFileAlt} className="w-4 h-4" />,
  },
  {
    id: 'users',
    label: 'Add Users',
    icon: <FontAwesomeIcon icon={faUserPlus} className="w-4 h-4" />,
  },
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('form');

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-6">
          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
          <div className="mt-6">
            {activeTab === 'form' && <MainForm />}
            {activeTab === 'users' && <AddUsers />}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
