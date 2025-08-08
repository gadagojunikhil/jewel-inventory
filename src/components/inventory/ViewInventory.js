import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ViewInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await axios.get('/api/inventory'); // Replace with your actual endpoint
      setInventory(response.data);
    } catch (err) {
      console.error('Error fetching inventory:', err);
    }
  };

  const handleEdit = (itemId) => {
    navigate(`/edit-inventory/${itemId}`);
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      await axios.delete(`/api/inventory/${itemId}`);
      fetchInventory(); // Refresh list after deletion
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  };

  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="view-inventory">
      <h2>📦 Jewelry Inventory</h2>
      <input
        type="text"
        placeholder="Search by name or category"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Gold ₹</th>
            <th>Diamond ₹</th>
            <th>Stone ₹</th>
            <th>Certificate ₹</th>
            <th>Labour ₹</th>
            <th>Total ₹</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredInventory.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.category}</td>
              <td>{item.goldAmount}</td>
              <td>{item.diamondAmount}</td>
              <td>{item.stoneAmount}</td>
              <td>{item.certificateValue}</td>
              <td>{item.labourAmount}</td>
              <td>{item.totalAmount}</td>
              <td>
                <button onClick={() => handleEdit(item.id)}>Edit</button>
                <button onClick={() => handleDelete(item.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ViewInventory;
