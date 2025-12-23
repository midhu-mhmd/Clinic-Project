import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-[#FAF9F6] border-t border-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-sm text-gray-600">
          {/* HealthBook */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900 text-base">HealthBook</h3>
            <p className="text-xs leading-relaxed opacity-80">
              Making healthcare accessible, convenient, and patient-centric for everyone.
            </p>
          </div>
          
          {/* Platform */}
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900">Platform</h4>
            <ul className="space-y-1 text-xs">
              <li><a href="#" className="hover:text-gray-900 transition-colors">Find Clinics</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Find Doctors</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Hire AI Maria</a></li>
            </ul>
          </div>
          
          {/* Company */}
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900">Company</h4>
            <ul className="space-y-1 text-xs">
              <li><a href="#" className="hover:text-gray-900 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">AI Assistant</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Contact</a></li>
            </ul>
          </div>
          
          {/* Legal */}
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900">Legal</h4>
            <ul className="space-y-1 text-xs">
              <li><a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-6 mt-8 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <p>&copy; 2023 HealthBook Inc. All rights reserved.</p>
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-[10px]">DB</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;