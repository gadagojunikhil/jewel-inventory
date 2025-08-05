export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateRequired = (value) => {
  return value !== null && value !== undefined && value.toString().trim() !== '';
};

export const validateUnique = (value, list, currentId = null, field = 'id') => {
  return !list.some(item => 
    item[field] !== currentId && 
    item[field].toString().toLowerCase() === value.toString().toLowerCase()
  );
};

export const validateJewelry = (jewelry) => {
  const errors = {};

  if (!validateRequired(jewelry.name)) {
    errors.name = 'Name is required';
  }

  if (!validateRequired(jewelry.code)) {
    errors.code = 'Code is required';
  }

  if (!validateRequired(jewelry.category)) {
    errors.category = 'Category is required';
  }

  if (jewelry.salePrice < 0) {
    errors.salePrice = 'Sale price cannot be negative';
  }

  if (jewelry.laborCost < 0) {
    errors.laborCost = 'Labor cost cannot be negative';
  }

  if (jewelry.otherCosts < 0) {
    errors.otherCosts = 'Other costs cannot be negative';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateMaterial = (material) => {
  const errors = {};

  if (!validateRequired(material.name)) {
    errors.name = 'Name is required';
  }

  if (!validateRequired(material.code)) {
    errors.code = 'Code is required';
  }

  if (!validateRequired(material.category)) {
    errors.category = 'Category is required';
  }

  if (material.costPrice < 0) {
    errors.costPrice = 'Cost price cannot be negative';
  }

  if (material.salePrice < 0) {
    errors.salePrice = 'Sale price cannot be negative';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateUser = (user) => {
  const errors = {};

  if (!validateRequired(user.name)) {
    errors.name = 'Name is required';
  }

  if (!validateRequired(user.email)) {
    errors.email = 'Email is required';
  } else if (!validateEmail(user.email)) {
    errors.email = 'Invalid email format';
  }

  if (!validateRequired(user.role)) {
    errors.role = 'Role is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};