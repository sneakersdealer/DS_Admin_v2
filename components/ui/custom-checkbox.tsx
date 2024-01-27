import { useState } from 'react';

const CustomCheckbox = ({ label, checked, onChange }) => {
  const toggleCheckbox = () => {
    onChange(!checked);
  };

  return (
    <label className="flex items-center cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          className="hidden"
          checked={checked}
          onChange={toggleCheckbox}
        />
        <div className="w-6 h-6 border-2 rounded-md border-gray-400 transition duration-300 ease-in-out transform scale-100 hover:scale-110"></div>
        {checked && (
          <div className="absolute top-0 left-0 flex justify-center items-center w-6 h-6 text-white bg-green-500 rounded-md transition duration-300 ease-in-out transform scale-0 group-hover:scale-100">
            ✓
          </div>
        )}
      </div>
      <span className="ml-2">{label}</span>
    </label>
  );
};

export default CustomCheckbox;