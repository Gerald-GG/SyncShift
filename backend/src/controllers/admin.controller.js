const userService = require('../services/user.service');

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.findAll();
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await userService.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: { code: 'USER_NOT_FOUND', message: 'User not found' }
      });
    }
    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { role, is_active, schedule_id } = req.body;
    const user = await userService.update(req.params.id, { role, is_active, schedule_id });
    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};
