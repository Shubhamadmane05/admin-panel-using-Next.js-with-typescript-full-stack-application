"use client"
import React from 'react';

const ConfirmDeleteModal = ({ show, onConfirm, onCancel }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold">Are you sure you want to delete this user?</h3>
        <div className="mt-4">
          <button
            className="bg-red-500 text-white px-4 py-2 rounded mr-4"
            onClick={onConfirm}
          >
            Yes, delete
          </button>
          <button
            className="bg-gray-300 text-black px-4 py-2 rounded"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
