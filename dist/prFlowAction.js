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
exports.PRFlowAction = void 0;
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
    getRequestedReviewers() {
        return __awaiter(this, void 0, void 0, function* () {
            const reviewers = yield this.octokit.rest.pulls.listRequestedReviewers({
                owner: this.repoOwner,
                repo: this.repoName,
                pull_number: this.pullRequestNumber,
            });
            return reviewers.data;
        });
    }
    getPullRequest() {
        return __awaiter(this, void 0, void 0, function* () {
            const pull = yield this.octokit.rest.pulls.get({
                owner: this.repoOwner,
                repo: this.repoName,
                pull_number: this.pullRequestNumber,
            });
            return pull.data;
        });
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
exports.PRFlowAction = PRFlowAction;
