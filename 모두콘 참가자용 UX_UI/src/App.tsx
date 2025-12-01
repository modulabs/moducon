import { useState } from 'react';
import { Home } from './components/Home';
import { Tracks } from './components/Tracks';
import { QRCode } from './components/QRCode';
import { My } from './components/My';
import { Info } from './components/Info';
import { Navigation } from './components/Navigation';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'tracks' | 'qr' | 'my' | 'info'>('home');

  return (
    <div className="min-h-screen bg-gray-50 pb-20 max-w-md mx-auto">
      {activeTab === 'home' && <Home />}
      {activeTab === 'tracks' && <Tracks />}
      {activeTab === 'qr' && <QRCode />}
      {activeTab === 'my' && <My />}
      {activeTab === 'info' && <Info />}
      
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}