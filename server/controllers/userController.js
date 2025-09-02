const { userService } = require('../services');

/**
 * User Controller - Handles HTTP requests for user management
 */
class UserController {
  /**
   * Get all users with optional filtering and pagination
   */
  async getAllUsers(req, res) {
    try {
      const { 
        page = 1, 
        limit = 50, 
        role, 
        search,
        include_inactive = false 
      } = req.query;

      const offset = (page - 1) * limit;
      
      let users;
      if (search) {
        users = await userService.search(search, {
          limit: parseInt(limit),
          offset: parseInt(offset),
          includeInactive: include_inactive === 'true'
        });
      } else {
        const options = {
          limit: parseInt(limit),
          offset: parseInt(offset),
          where: {}
        };

        if (role) {
          options.where.role = role;
        }

        if (include_inactive !== 'true') {
          options.where.is_active = true;
        }

        users = await userService.getAllWithDetails(options);
      }

      res.json({
        success: true,
        data: users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: users.length
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await userService.getById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Create new user
   */
  async createUser(req, res) {
    try {
      const context = {
        userId: req.user?.userId
      };

      const user = await userService.create(req.body, context);

      res.status(201).json({
        success: true,
        data: user,
        message: 'User created successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Update user
   */
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const context = {
        userId: req.user?.userId
      };

      const user = await userService.update(id, req.body, context);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user,
        message: 'User updated successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Delete user
   */
  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const { soft_delete = true } = req.query;
      const context = {
        userId: req.user?.userId
      };

      let result;
      if (soft_delete === 'true') {
        result = await userService.softDelete(id, context);
      } else {
        result = await userService.delete(id, context);
      }

      if (!result) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      res.json({
        success: true,
        message: `User ${soft_delete === 'true' ? 'deactivated' : 'deleted'} successfully`
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Change user password
   */
  async changePassword(req, res) {
    try {
      const userId = req.user.userId;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          error: 'Current password and new password are required'
        });
      }

      const user = await userService.changePassword(userId, currentPassword, newPassword);

      res.json({
        success: true,
        data: user,
        message: 'Password changed successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get users by role
   */
  async getUsersByRole(req, res) {
    try {
      const { role } = req.params;
      const users = await userService.getUsersByRole(role);

      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get user statistics
   */
  async getUserStatistics(req, res) {
    try {
      const statistics = await userService.getStatistics();

      res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Search users
   */
  async searchUsers(req, res) {
    try {
      const { q: searchTerm } = req.query;
      const { 
        page = 1, 
        limit = 50,
        include_inactive = false 
      } = req.query;

      if (!searchTerm) {
        return res.status(400).json({
          success: false,
          error: 'Search term is required'
        });
      }

      const offset = (page - 1) * limit;
      const users = await userService.search(searchTerm, {
        limit: parseInt(limit),
        offset: parseInt(offset),
        includeInactive: include_inactive === 'true'
      });

      res.json({
        success: true,
        data: users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: users.length
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Reset user password (Admin function)
   */
  async resetUserPassword(req, res) {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;

      // Only admin, manager, or super_admin can reset passwords
      if (!['admin', 'super_admin', 'manager'].includes(req.user?.role)) {
        return res.status(403).json({ 
          success: false,
          error: 'Insufficient permissions' 
        });
      }

      // For now, we'll use a simplified approach
      // In a full implementation, this would call userService.resetPassword
      const defaultPassword = newPassword || 'User@123';
      
      res.json({
        success: true,
        message: 'Password reset functionality would be implemented here',
        temporaryPassword: defaultPassword
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get password requirements
   */
  getPasswordRequirements(req, res) {
    res.json({
      success: true,
      data: {
        requirements: [
          'Minimum 6 characters',
          'At least 1 letter',
          'At least 1 number'
        ]
      }
    });
  }
}

const userController = new UserController();

module.exports = {
  getAllUsers: userController.getAllUsers.bind(userController),
  getUserById: userController.getUserById.bind(userController),
  createUser: userController.createUser.bind(userController),
  updateUser: userController.updateUser.bind(userController),
  deleteUser: userController.deleteUser.bind(userController),
  changePassword: userController.changePassword.bind(userController),
  getUsersByRole: userController.getUsersByRole.bind(userController),
  getUserStatistics: userController.getUserStatistics.bind(userController),
  searchUsers: userController.searchUsers.bind(userController),
  resetUserPassword: userController.resetUserPassword.bind(userController),
  getPasswordRequirements: userController.getPasswordRequirements.bind(userController)
};
