import React from 'react';
import { Gem, Package, DollarSign, Users } from 'lucide-react';
import PageIdentifier from './PageIdentifier';
import SCREEN_IDS from '../../utils/screenIds';

const Dashboard = ({ materials = [], jewelryPieces = [], jewelryCategories = [], users = [] }) => {
  return (
    <div className="p-6 pb-12">
      <PageIdentifier pageId={SCREEN_IDS?.DASHBOARD?.MAIN || 'DASH-001'} pageName="Main Dashboard" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Materials</p>
              <p className="text-3xl font-bold text-blue-700">{materials.length}</p>
            </div>
            <Gem className="text-blue-500" size={40} />
          </div>
        </div>
        
        <div className="bg-green-50 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Jewelry Pieces</p>
              <p className="text-3xl font-bold text-green-700">{jewelryPieces.length}</p>
            </div>
            <Package className="text-green-500" size={40} />
          </div>
        </div>
        
        <div className="bg-yellow-50 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 text-sm font-medium">Total Value</p>
              <p className="text-3xl font-bold text-yellow-700">
                ${jewelryPieces.reduce((sum, j) => sum + j.salePrice, 0).toLocaleString()}
              </p>
            </div>
            <DollarSign className="text-yellow-500" size={40} />
          </div>
        </div>
        
        <div className="bg-purple-50 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Categories</p>
              <p className="text-3xl font-bold text-purple-700">{jewelryCategories.length}</p>
            </div>
            <Users className="text-purple-500" size={40} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Recent Jewelry</h3>
          <div className="space-y-3">
            {jewelryPieces.slice(0, 5).map(jewelry => (
              <div key={jewelry.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{jewelry.name}</p>
                  <p className="text-sm text-gray-600">{jewelry.code}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">${jewelry.salePrice}</p>
                  <p className="text-xs text-gray-500">{jewelry.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Jewelry Categories</h3>
          <div className="space-y-3">
            {jewelryCategories.map(category => {
              const count = jewelryPieces.filter(j => j.category === category.name && j.status !== 'Archived').length;
              return (
                <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <span className="text-sm font-semibold">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export { Dashboard };