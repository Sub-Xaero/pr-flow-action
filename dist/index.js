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
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let action = new PRFlowAction();
        let context = action.context;
        let contextAction = context.action;
        // Get the labels to use from the inputs
        let labels = {
            review: core.getInput("reviewLabel"),
            approved: core.getInput("approvedLabel"),
            changesRequested: core.getInput("changesRequestedLabel"),
            changedSinceLastReview: core.getInput("changedSinceLastReviewLabel"),
        };
        switch (context.eventName) {
            case 'pull_request':
                if (contextAction === 'opened') {
                    // await action.addPRLabels([labels.review]);
                }
                else if (contextAction === 'closed') {
                    yield action.removePRLabels([
                        labels.review,
                        labels.approved,
                        labels.changesRequested,
                        labels.changedSinceLastReview,
                    ]);
                }
                else if (contextAction == "synchronize") {
                    // If PR previously reviewed
                    if (yield action.previouslyReviewed()) {
                        // If PR has changed since last review
                        yield action.addPRLabels([labels.changedSinceLastReview]);
                    }
                }
                break;
            case "pull_request_review":
                // If the review is approved, remove the for-review label
                yield action.removePRLabels([labels.review, labels.changedSinceLastReview]);
                if (context.payload.review.state === "APPROVED") {
                    yield action.addPRLabels([labels.approved]);
                }
                else if (context.payload.review.state === "CHANGES_REQUESTED") {
                    // If the review is changes requested, remove the for-review label
                    yield action.addPRLabels([labels.changesRequested]);
                }
                break;
            case "issue_comment":
                break;
            default:
                // core.setFailed(`Unsupported event: ${context.eventName}`);
                break;
        }
    }
    catch (error) {
        core.setFailed(error.message);
    }
}))();
