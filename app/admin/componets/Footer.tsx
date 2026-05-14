export default function Footer() {
  return (
    <div className="bg-gray-800 border-t border-gray-700 p-6">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <div className="text-gray-400">
            © 2026 Path of the Cricketer & Talent Portal. All rights reserved.
          </div>
          <div className="flex flex-wrap gap-4 mt-2">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms & Conditions</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Admin Login</a>
          </div>
        </div>
        
        <div className="flex gap-4">
          <button className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors">
            <span>YT</span>
          </button>
          <button className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors">
            <span>TW</span>
          </button>
          <button className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors">
            <span>FB</span>
          </button>
          <button className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors">
            <span>IG</span>
          </button>
        </div>
      </div>
    </div>
  );
}