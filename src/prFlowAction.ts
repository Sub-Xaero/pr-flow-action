import * as core from "@actions/core";
import * as github from "@actions/github";

export class PRFlowAction {

  // This should be a token with access to your repository scoped in as a secret.
  // The YML workflow will need to set myToken with the GitHub Secret Token
  // myToken: ${{ secrets.GITHUB_TOKEN }}
  // https://help.github.com/en/actions/automating-your-workflow-with-github-actions/authenticating-with-the-github_token#about-the-github_token-secret
  declare octokit: ReturnType<typeof github.getOctokit>;

  get context(): typeof github.context {
    return github.context;
  }

  get repo(): typeof github.context.repo {
    return github.context.repo;
  }

  get repoName(): string {
    return this.repo.repo;
  }

  get repoOwner(): string {
    return this.repo.owner;
  }

  get pullRequestNumber(): number {
    if (this.context.payload.pull_request) {
      return this.context.payload.pull_request.number;
    } else {
      throw new Error("No pull request found");
    }
  }

  constructor() {
    const token = core.getInput("token");
    this.octokit = github.getOctokit(token);
  }

  async getRequestedReviewers() {
    const reviewers = await this.octokit.rest.pulls.listRequestedReviewers({
      owner: this.repoOwner,
      repo: this.repoName,
      pull_number: this.pullRequestNumber,
    });
    return reviewers.data;
  }

  async getPullRequest() {
    const pull = await this.octokit.rest.pulls.get({
      owner: this.repoOwner,
      repo: this.repoName,
      pull_number: this.pullRequestNumber,
    });
    return pull.data;
  }

  async getReviews(): Promise<any[]> {
    const reviews = await this.octokit.rest.pulls.listReviews({
      owner: this.repoOwner,
      repo: this.repoName,
      pull_number: this.pullRequestNumber,
    });
    return reviews.data;
  }

  async previouslyReviewed(): Promise<boolean> {
    const reviews = await this.getReviews();
    return reviews.length > 0;
  }

  async removePRLabels(labels: Array<string | undefined>) {
    labels = labels.filter(label => label !== undefined);
    console.log(`removingLabels: ${labels.join(",")}`);
    for (let label in labels) {
      if (!label) {
        continue;
      }

      try {
        await this.octokit.rest.issues.deleteLabel({
          owner: this.repoOwner,
          repo: this.repoName,
          issue_number: this.pullRequestNumber,
          name: label,
        });
      } catch (error) {
        //  Do nothing
      }
    }
  }

  async addPRLabels(labels: Array<string | undefined>) {
    let newLabels = labels.filter((label) => label) as string[];
    console.log(`addingLabels: ${newLabels.join(",")}`);

    try {
      await this.octokit.rest.issues.addLabels({
        owner: this.repoOwner,
        repo: this.repoName,
        issue_number: this.pullRequestNumber,
        labels: newLabels,
      });
    } catch (error) {
      //  Do nothing
    }
  }
}
