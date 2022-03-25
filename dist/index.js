"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
class PRFlowAction {
    get context() {
        return github.context;
    }
    get repo() {
        return github.context.repo;
    }
    get repoName() {
        return this.repo.repo;
    }
    get repoOwner() {
        return this.repo.owner;
    }
    get pullRequestNumber() {
        if (this.context.payload.pull_request) {
            return this.context.payload.pull_request.number;
        }
        else {
            throw new Error("No pull request found");
        }
    }
    constructor() {
        const token = core.getInput("token");
        this.octokit = github.getOctokit(token);
    }
    getReviews() {
        return __awaiter(this, void 0, void 0, function* () {
            const reviews = yield this.octokit.rest.pulls.listReviews({
                owner: this.repoOwner,
                repo: this.repoName,
                pull_number: this.pullRequestNumber,
            });
            return reviews.data;
        });
    }
    previouslyReviewed() {
        return __awaiter(this, void 0, void 0, function* () {
            const reviews = yield this.getReviews();
            return reviews.length > 0;
        });
    }
    removePRLabels(labels) {
        return __awaiter(this, void 0, void 0, function* () {
            labels = labels.filter(label => label !== undefined);
            console.log(`removingLabels: ${labels.join(",")}`);
            for (let label in labels) {
                if (!label) {
                    continue;
                }
                try {
                    yield this.octokit.rest.issues.deleteLabel({
                        owner: this.repoOwner,
                        repo: this.repoName,
                        issue_number: this.pullRequestNumber,
                        name: label,
                    });
                }
                catch (error) {
                    //  Do nothing
                }
            }
        });
    }
    addPRLabels(labels) {
        return __awaiter(this, void 0, void 0, function* () {
            let newLabels = labels.filter((label) => label);
            console.log(`addingLabels: ${newLabels.join(",")}`);
            try {
                yield this.octokit.rest.issues.addLabels({
                    owner: this.repoOwner,
                    repo: this.repoName,
                    issue_number: this.pullRequestNumber,
                    labels: newLabels,
                });
            }
            catch (error) {
                //  Do nothing
            }
        });
    }
}
console.log(`Booting...`);
try {
    let action = new PRFlowAction();
    let context = action.context;
    let contextEvent = context.eventName;
    let contextAction = context.payload.action;
    // Get the labels to use from the inputs
    let labels = {
        review: core.getInput("reviewLabel"),
        approved: core.getInput("approvedLabel"),
        changesRequested: core.getInput("changesRequestedLabel"),
        changedSinceLastReview: core.getInput("changedSinceLastReviewLabel"),
    };
    // console.log(`context: ${JSON.stringify(context)}`);
    console.log(`contextEvent: ${contextEvent}, contextAction: ${contextAction}`);
    switch (contextEvent) {
        case 'pull_request':
            if (contextAction === 'opened') {
                console.log(`PR opened`);
                // await action.addPRLabels([labels.review]);
            }
            else if (contextAction === 'closed') {
                console.log(`PR closed, removing labels`);
                action.removePRLabels([
                    labels.review,
                    labels.approved,
                    labels.changesRequested,
                    labels.changedSinceLastReview,
                ])
                    .then(() => console.log(`PR closed, labels removed`))
                    .catch(() => core.setFailed(`Failed to remove labels`));
            }
            else if (contextAction === 'review_requested') {
                console.log("reviewRequested: updating labels");
                action.addPRLabels([labels.review])
                    .then(() => console.log(`reviewRequested: labels updated`))
                    .catch(() => core.setFailed(`Failed to update labels`));
                action.removePRLabels([
                    labels.approved,
                    labels.changesRequested,
                    labels.changedSinceLastReview,
                ]).then(() => {
                    console.log(`reviewRequested: labels removed`);
                }).catch(() => core.setFailed(`Failed to remove labels`));
            }
            else if (contextAction == "synchronize") {
                // If PR previously reviewed
                console.log("synchronize");
                action.previouslyReviewed().then((reviewed) => {
                    if (reviewed) {
                        // If PR has changed since last review
                        console.log("synchronize: updating labels");
                        action.addPRLabels([labels.changedSinceLastReview])
                            .then(() => console.log(`synchronize: labels updated`))
                            .catch(() => core.setFailed(`Failed to update labels`));
                    }
                });
            }
            break;
        case "pull_request_review":
            // If the review is approved, remove the for-review label
            console.log("pull_request: updating labels");
            action.removePRLabels([labels.review, labels.changedSinceLastReview])
                .then(() => console.log(`pull_request: labels removed`))
                .catch(() => core.setFailed(`Failed to remove labels`));
            if (context.payload.review.state === "APPROVED") {
                console.log("pull_request_review approved: updating labels");
                action.addPRLabels([labels.approved])
                    .then(() => console.log(`pull_request_review approved: labels updated`))
                    .catch(() => core.setFailed(`Failed to update labels`));
            }
            else if (context.payload.review.state === "CHANGES_REQUESTED") {
                console.log("pull_request_review changes_requested: updating labels");
                // If the review is changes requested, remove the for-review label
                action.addPRLabels([labels.changesRequested])
                    .then(() => console.log(`pull_request_review changes_requested: labels updated`))
                    .catch(() => core.setFailed(`Failed to update labels`));
            }
            else {
                console.log(`pull_request_review other state: ${context.payload.review.state}`);
            }
            break;
        default:
            console.log(`Unknown event: ${context.eventName}`);
            // core.setFailed(`Unsupported event: ${context.eventName}`);
            break;
    }
}
catch (error) {
    core.setFailed(error.message);
}
