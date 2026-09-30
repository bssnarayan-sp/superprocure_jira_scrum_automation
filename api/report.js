const {
  getSprintIssues,
} = require("../src/jira");

const {
  buildReport,
} = require("../src/report");

const {
  sendSlackReport,
} = require("../src/slack");

module.exports = async function handler(req, res) {
  try {
    const authHeader =
      req.headers.authorization;

    const expectedSecret =
      process.env.CRON_SECRET;

    if (
      !expectedSecret ||
      authHeader !== `Bearer ${expectedSecret}`
    ) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const sprint = req.query?.sprint;

    if (!sprint) {
      return res.status(400).json({
        success: false,
        error:
          "Missing required query param: sprint",
      });
    }

    console.log(
      `Generating report for ${sprint}`
    );

    const issues =
      await getSprintIssues(sprint);

    console.log(
      `Fetched ${issues.length} Jira issues`
    );

    const report =
      buildReport(issues);

    await sendSlackReport(
      report,
      sprint
    );

    return res.status(200).json({
      success: true,
      sprint,
      issues: issues.length,
    });
  } catch (error) {
    console.error(
      error.response?.data ||
      error.message
    );

    return res.status(500).json({
      success: false,
      error:
        error.response?.data ||
        error.message,
    });
  }
};