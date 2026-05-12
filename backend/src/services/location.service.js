const locationRepository = require('../repositories/location.repository');

exports.create = async (data) => {
  return await locationRepository.create(data);
};

exports.findAll = async () => {
  return await locationRepository.findAll();
};

exports.update = async (id, data) => {
  return await locationRepository.update(id, data);
};

exports.delete = async (id) => {
  return await locationRepository.delete(id);
};
