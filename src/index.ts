import * as core from "@actions/core";
import {PRFlowAction} from "./prFlowAction";
import {handlePullRequestEvent} from "./scenarios/pullRequest";
import {handlePullRequestReviewEvent} from "./scenarios/pullRequestReview";

console.log(`Booting...`);
(async () => {

  try {
    let action = new PRFlowAction();
    let context = action.context;
    let contextEvent = context.eventName;
    let contextAction = context.payload.action;

    // console.log(`context: ${JSON.stringify(context)}`);
    console.log(`contextEvent: ${contextEvent}, contextAction: ${contextAction}`);
    switch (contextEvent) {
      case 'pull_request':
        await handlePullRequestEvent(action);
        break;
      case "pull_request_review":
        await handlePullRequestReviewEvent(action);
        break;
      default:
        console.log(`Unknown event: ${context.eventName}`);
        // core.setFailed(`Unsupported event: ${context.eventName}`);
        break;
    }
  } catch (error: any) {
    core.setFailed(error.message);
  }
})();
