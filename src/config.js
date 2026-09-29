require("dotenv").config();

const slackEnv = process.env.SLACK_ENV || "test";

module.exports = {
  jira: {
    baseUrl: process.env.JIRA_BASE_URL,
    email: process.env.JIRA_EMAIL,
    token: process.env.JIRA_API_TOKEN,
    sprint: process.env.JIRA_SPRINT,
  },

  slack: {
    env: slackEnv,

    webhookUrl:
      slackEnv === "prod"
        ? process.env.SLACK_WEBHOOK_PROD
        : process.env.SLACK_WEBHOOK_TEST,

    showDetails:
      process.env.SLACK_SHOW_DETAILS === "true",
  },
};