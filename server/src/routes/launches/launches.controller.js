const {
  getAllLaunches,
  scheduleNewLaunch,
  abortLaunchById,
  existsLaunchWithId,
} = require('../../models/launches.model');

const { getPagination } = require('../../services/query');

async function httpGetAllLaunches(req, res) {
  const { skip, limit } = getPagination(req.query);
  const launches = await getAllLaunches(skip, limit);
  return res.status(200).json(launches);
}

async function httpAddNewLaunch(req, res) {
  const launch = req.body;

  if (
    !launch.mission ||
    !launch.rocket ||
    !launch.launchDate ||
    !launch.target
  ) {
    return res.status(400).json({
      error: 'Missing required launch property',
    });
  }

  const validDate = (launch.launchDate = new Date(launch.launchDate));
  if (validDate.toString() === 'Invalid Date') {
    return res.status(400).json({
      error: 'Invalid launch Date',
    });
  }

  const launchToPost = {
    ...launch,
    launchDate: validDate,
  };

  const createdLaunch = await scheduleNewLaunch(launchToPost);
  return res.status(201).json(createdLaunch);
}

async function httpAbortLaunch(req, res) {
  const launchId = Number(req.params.id);
  const launchExists = await existsLaunchWithId(launchId);
  if (!launchExists) {
    return res.status(404).json({
      error: `Launch does not exist.`,
    });
  }
  const aborted = await abortLaunchById(launchId);
  if (!aborted) {
    res.status(400).json({
      error: `Launch not aborted`,
    });
  }
  return res.status(200).json({
    ok: true,
  });
}

module.exports = {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpAbortLaunch,
};
