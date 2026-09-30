const axios = require("axios");
const config = require("./config");

const jira = axios.create({
    baseURL: config.jira.baseUrl,
    auth: {
        username: config.jira.email,
        password: config.jira.token
    },
    headers: {
        Accept: "application/json"
    }
});

async function getSprintIssues(sprint) {

    let issues = [];
    let nextPageToken = null;

    do {

        const params = {
            jql: `Sprint in ("${sprint}")`,
            fields: "status,assignee",
            maxResults: 100
        };

        if (nextPageToken) {
            params.nextPageToken = nextPageToken;
        }

        const response = await jira.get(
            "/rest/api/3/search/jql",
            { params }
        );

        const data = response.data;

        issues.push(...(data.issues || []));

        nextPageToken = data.nextPageToken || null;

    } while (nextPageToken);

    return issues;
}

module.exports = {
    getSprintIssues
};