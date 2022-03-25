import {addLabels, labels, removeLabels} from "../labelling";
import {PRFlowAction} from "../prFlowAction";

export function applyReviewState(action: PRFlowAction, state: string) {
  if (state === "approved") {
    console.log("pull_request_review approved: updating labels");
    addLabels(action, [labels.approved]);

  } else if (state === "changes_requested") {
    console.log("pull_request_review changes_requested: updating labels");
    addLabels(action, [labels.changesRequested]);

  } else {
    console.log(`pull_request_review other state: ${state}`);
  }
}

export async function handlePullRequestReviewEvent(action: PRFlowAction) {
  let context = action.context;
  // If the review is approved, remove the for-review label
  console.log("pull_request_review: updating labels");
  removeLabels(action, [labels.review, labels.changedSinceLastReview]);
  applyReviewState(action, context.payload.review.state);
}
