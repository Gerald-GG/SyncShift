const locationService = require('../services/location.service');

exports.createLocation = async (req, res, next) => {
  try {
    const { name, latitude, longitude, radius_m } = req.body;
    const location = await locationService.create({ name, latitude, longitude, radius_m });
    res.status(201).json({ success: true, data: location });
  } catch (error) {
    next(error);
  }
};

exports.getAllLocations = async (req, res, next) => {
  try {
    const locations = await locationService.findAll();
    res.json({ success: true, data: locations });
  } catch (error) {
    next(error);
  }
};

exports.updateLocation = async (req, res, next) => {
  try {
    const location = await locationService.update(req.params.id, req.body);
    res.json({ success: true, data: location });
  } catch (error) {
    next(error);
  }
};

exports.deleteLocation = async (req, res, next) => {
  try {
    await locationService.delete(req.params.id);
    res.json({ success: true, data: { is_active: false } });
  } catch (error) {
    next(error);
  }
};
