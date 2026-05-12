const userRepository = require('../repositories/user.repository');

exports.findAll = async () => {
  return await userRepository.findAll();
};

exports.findById = async (id) => {
  return await userRepository.findById(id);
};

exports.update = async (id, data) => {
  return await userRepository.update(id, data);
};
