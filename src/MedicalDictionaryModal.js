import React, { useState } from 'react';
import './MedicalDictionaryModal.css';

const MedicalDictionaryModal = ({ isOpen, onClose }) => {
  const [generalTerm, setGeneralTerm] = useState('');
  const [medicalTerm, setMedicalTerm] = useState('');
  const [dictionaryData, setDictionaryData] = useState([
    { id: 200, generalTerm: 'gum recession', medicalTerm: 'Gingival recession' },
    { id: 199, generalTerm: 'receding gum', medicalTerm: 'Recession' },
    { id: 198, generalTerm: 'gum graft', medicalTerm: 'Soft tissue graft' },
    { id: 197, generalTerm: 'thin gum', medicalTerm: 'Thin Tissue biotype' },
    { id: 196, generalTerm: 'strong muscle pull', medicalTerm: 'strong/aberrant frenum' },
    { id: 195, generalTerm: 'no attached tissue', medicalTerm: 'Minimal /No attached gingiva' },
    { id: 194, generalTerm: 'tissue from the roof of your mouth', medicalTerm: 'Connective tissue graft' },
    { id: 193, generalTerm: 'gum recession', medicalTerm: 'Gingival recession' },
  ]);
  const [editingId, setEditingId] = useState(null);
  const [editedGeneralTerm, setEditedGeneralTerm] = useState('');
  const [editedMedicalTerm, setEditedMedicalTerm] = useState('');
  const [dropdownOpenId, setDropdownOpenId] = useState(null);

  const handleAddDictionary = () => {
    if (generalTerm && medicalTerm) {
      const newEntry = {
        id: dictionaryData.length + 1,
        generalTerm,
        medicalTerm,
      };
      setDictionaryData([...dictionaryData, newEntry]); // Append new entry to the end
      setGeneralTerm('');
      setMedicalTerm('');
    }
  };
  

  const handleEdit = (id) => {
    const entry = dictionaryData.find((item) => item.id === id);
    setEditingId(id);
    setEditedGeneralTerm(entry.generalTerm);
    setEditedMedicalTerm(entry.medicalTerm);
    setDropdownOpenId(null);
  };

  const handleSave = (id) => {
    setDictionaryData((prevData) =>
      prevData.map((item) =>
        item.id === id
          ? { ...item, generalTerm: editedGeneralTerm, medicalTerm: editedMedicalTerm }
          : item
      )
    );
    setEditingId(null);
    setEditedGeneralTerm('');
    setEditedMedicalTerm('');
  };

  const handleDelete = (id) => {
    setDictionaryData((prevData) => prevData.filter((item) => item.id !== id));
    setDropdownOpenId(null);
  };

  const toggleDropdown = (id) => {
    setDropdownOpenId(dropdownOpenId === id ? null : id);
  };

  if (!isOpen) return null;

  return (
    <div className="dictionary-modal-overlay">
      <div className="dictionary-modal-content">
        <div className="dictionary-modal-header">
          <div>
            <h2>Medical Dictionary</h2>
            <p className="dictionary-subtitle">2 liner about Medical dictionary</p>
          </div>
          <div className="dictionary-header-right">
            <span className="records-count">{dictionaryData.length} records</span>
            <button className="dictionary-close-button" onClick={onClose}>×</button>
          </div>
        </div>

        <div className="dictionary-input-section">
          <div className="dictionary-input-group">
            <label>General term</label>
            <input
              type="text"
              value={generalTerm}
              onChange={(e) => setGeneralTerm(e.target.value)}
              placeholder="Enter general term here"
              className="dictionary-input"
            />
          </div>

          <div className="dictionary-input-group">
            <label>Medical term</label>
            <input
              type="text"
              value={medicalTerm}
              onChange={(e) => setMedicalTerm(e.target.value)}
              placeholder="Enter medical term here"
              className="dictionary-input"
            />
          </div>

          <button 
            className="add-dictionary-button"
            onClick={handleAddDictionary}
          >
            Add to dictionary
          </button>
        </div>

        <div className="dictionary-table">
          <div className="dictionary-table-header">
            <div className="id-column">ID</div>
            <div className="term-column">General term</div>
            <div className="term-column">Medical term</div>
            <div className="actions-column"></div>
          </div>
          
          {dictionaryData.map((item) => (
            <div key={item.id} className="dictionary-table-row">
              <div className="id-column">{item.id}</div>
              <div className="term-column">
                {editingId === item.id ? (
                  <input
                    type="text"
                    value={editedGeneralTerm}
                    onChange={(e) => setEditedGeneralTerm(e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  item.generalTerm
                )}
              </div>
              <div className="term-column">
                {editingId === item.id ? (
                  <input
                    type="text"
                    value={editedMedicalTerm}
                    onChange={(e) => setEditedMedicalTerm(e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  item.medicalTerm
                )}
              </div>
              <div className="actions-column">
                <button className="action-button" onClick={() => toggleDropdown(item.id)}>⋮</button>
                {dropdownOpenId === item.id && (
                  <div className="dropdown-menu">
                    <button className="dropdown-item" onClick={() => handleEdit(item.id)}>✏️ Edit</button>
                    <button className="dropdown-item" onClick={() => handleDelete(item.id)}>🗑️ Delete</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MedicalDictionaryModal;
