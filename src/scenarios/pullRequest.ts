import {addLabels, labels, removeAllLabels, removeLabels} from "../labelling";
import {PRFlowAction} from "../prFlowAction";

export async function handlePullRequestEvent(action: PRFlowAction) {
  let context = action.context;
  let {action: contextAction} = context.payload;

  console.log(`pull_request ${contextAction} event`);

  if (contextAction === 'opened') {
    console.log(`PR opened`);
    let pr = await action.getPullRequest();

    if (pr.title.includes('[WIP]')) {
      await addLabels(action, [labels.inProgress]);
    }

  } else if (contextAction === 'reopened') {
    console.log(`PR reopened`);
    let pr = await action.getPullRequest();

    if (pr.title.includes('[WIP]')) {
      await addLabels(action, [labels.inProgress]);
    }

  } else if (contextAction === 'converted_to_draft') {
    console.log(`PR drafted, removing review labels`);
    removeAllLabels(action);

  } else if (contextAction === 'ready_for_review') {
    removeLabels(action, [labels.inProgress]);
    addLabels(action, [labels.review]);

  } else if (contextAction === 'closed') {
    console.log(`PR closed, removing labels`);
    removeAllLabels(action);

  } else if (contextAction === 'review_requested') {
    console.log("Review requested: updating labels");
    addLabels(action, [labels.review]);
    removeLabels(action, [labels.approved, labels.changesRequested, labels.inProgress]);

  } else if (contextAction === 'review_request_removed') {
    console.log("Review request removed: updating labels");
    let reviewers = await action.getRequestedReviewers();
    if ([...reviewers.users, ...reviewers.teams].length === 0) {
      console.log("Review request: no active reviewers, removing labels");
      removeLabels(action, [labels.review]);
    }

  } else if (contextAction == "synchronize") {
    console.log("Synchronize: updating labels");

    if (await action.previouslyReviewed()) {
      console.log("Synchronize: Previously reviewed, show changed since last review");
      addLabels(action, [labels.changedSinceLastReview]);
    }
  }
}
